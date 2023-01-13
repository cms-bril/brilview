import subprocess
import traceback
import re
import numpy as np
import math
import os
import csv
#import utils
from . import utils
from brilview import bvconfig, bvlogging


RE_FILENAME_ALLOWED_CHARS = re.compile(r'^([a-zA-Z0-9]|_|-|\.)+$')


def return_error_on_exception(func):
    def decorated(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            bvlogging.get_logger().warn(traceback.format_exc())
            return {
                'status': 'ERROR',
                'message': e.message
            }
    return decorated


@utils.return_error_on_exception
def get_brilcalc_lumi(args={}):
    '''
    input:
      args: {
          begin: str '^\d\d/\d\d/\d\d \d\d:\d\d:\d\d$|^\d{6}$|^\d{4}$'
          end: str '^\d\d/\d\d/\d\d \d\d:\d\d:\d\d$|^\d{6}$|^\d{4}$'
          unit: str
          beamstatus: str ('stable beams' | 'squeeze' | 'flat top' | 'adjust')
          normtag: str textbox or dropdown select
          datatag: str
          hltpath:  str //'^HLT_[\w\*\?\[\]\!]+$' reject wildcard patterns ??
          type:  str or None
          selectjson: jsonstr
          byls: boolean
          without_correction: boolean
          pileup: boolean
          minbiasxsec: float
      }
    output: {
        'status':'OK'|'ERROR',
        'data'?: {
            'fillnum': [],
            'runnum': [],
            'tssec': [],
            'delivered': [],
            'recorded':[],
            'lsnum':[],
            'hltpathid':[],
            'hltpathid2name':{id:name},
            'hltpathname2id':{name:id},
            'pileup': []
        },
        'message'?: str
    }

    '''
    cmd = _get_total_lumi_command_template()
    cmd.extend(_parse_time_range_args(args))

    byls = False
    if args.get('byls', False):
        cmd.append('--byls')
        byls = True
    if args.get('without_correction', False):
        cmd.append('--without-correction')

    unit = '/ub'
    if 'unit' in args and args['unit']:
        unit = args['unit']
    cmd.extend(['-u', unit])

    if 'type' in args and args['type']:
        cmd.extend(['--type', args['type']])

    if 'normtag' in args and args['normtag']:
        normtag = args['normtag']
        if normtag == '':
            return {'status': 'ERROR', 'message': 'Empty normtag'}
        normtag_file = _make_normtag_filepath(normtag)
        if normtag_file is not None and os.path.isfile(normtag_file):
            normtag = normtag_file
        cmd.extend(['--normtag', normtag])

    if 'beamstatus' in args and args['beamstatus']:
        cmd.extend(['-b', args['beamstatus'].upper()])

    pileup = False
    if 'pileup' in args and args['pileup']:
        if not byls:
            raise ValueError('Pileup option must go with "byls"')
        pileup = True
        if 'minbiasxsec' in args:
            cmd.extend(['--minBiasXsec', str(args['minbiasxsec'])])

    hltpath = None
    if 'hltpath' in args and args['hltpath']:
        cmd.extend(['--hltpath', args['hltpath']])
        hltpath = args['hltpath']

    bvlogging.get_logger().debug(cmd)
    try:
        r = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
        r = r.decode('utf-8')
    except subprocess.CalledProcessError as e:
        if e.returncode != 0:
            out = re.sub('File ".*?"', '<FILE>', e.output)
            return {'status': 'ERROR', 'message': out}

    return {
        'status': 'OK',
        'data': _parse_brilcalc_output(r, byls, pileup, hltpath)
    }


@utils.return_error_on_exception
def get_brilcalc_bxlumi(args={}):
    '''
    input:
        args: {
            'runnum': int,
            'lsnum': int,
            'normtag': str textbox or dropdown select,
            'type':  str or None,
            'without_correction': boolean,
            'unit': str
    }

    output: {
        'status':'OK'|'ERROR',
        'data'?: {
            'fillnum': int,
            'runnum': int,
            'lsnum': int,
            'tssec': int,
            'delivered': float[],
            'recorded': float[]
        },
        'message'?: str
    }
    '''
    cmd = _get_total_lumi_command_template()
    cmd.append('--xing')
    cmd.extend(_parse_run_ls_args(args))
    if args.get('without_correction', False):
        cmd.append('--without-correction')

    unit = '/ub'
    if 'unit' in args and args['unit']:
        unit = args['unit']
    cmd.extend(['-u', unit])

    if 'type' in args and args['type']:
        cmd.extend(['--type', args['type']])

    if 'normtag' in args and args['normtag']:
        cmd.extend(_parse_normtag(args['normtag']))
    
    if 'bxthreshold' in args and args['bxthreshold']:
        cmd.extend(['--xingTr', str(args['bxthreshold'])])

    if 'xingmin' in args and args['xingmin']:
        cmd.extend(['--xingMin', str(args['xingmin'])])

    if ('bxid_start' in args and args['bxid_start']) or ('bxid_end' in args and args['bxid_end']):
        cmd.extend(_parse_bxids(args['bxid_start'], args['bxid_end'])) 
    
    bvlogging.get_logger().debug(cmd)
    try:
        r = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
        r = r.decode('utf-8')
    except subprocess.CalledProcessError as e:
        if e.returncode != 0:
            out = re.sub('File ".*?"', '<FILE>', e.output)
            return {'status': 'ERROR', 'message': out}

    return {
        'status': 'OK',
        'data': _parse_brilcalc_bx_output(r)
    }


def _parse_brilcalc_bx_output(output):
    lines = [l for l in output.splitlines() if
             len(l) and not l.startswith('#')]

    if len(lines) == 0:  # no data found
        raise ValueError('Empty result')

    items = lines[0].split(',')
    if items[0].find(':') == -1:  # output is an error message
        raise RuntimeError('/n'.join(lines))

    [runnum, fillnum] = [int(x) for x in items[0].split(':')]
    lsnum = items[1].split(':')[0]
    bxlumi_str = items[9][1:-1]
    bxlumi_list = list(bxlumi_str.split(" "))
    bxlumi_lists = [bxlumi_list[i * 3:(i + 1) * 3] for i in range((len(bxlumi_list) + 3 - 1) // 3 )] # splits each data point

    index_count = 3564 # the maximum number of bxindex

    # Create an array with zeroes and fill the known values
    result = [[str(bxindex), "0.0", "0.0"] for bxindex in range(1,index_count+1)]
    for datapoint in bxlumi_lists:
        result[int(datapoint[0])-1] = datapoint

    final_result = " ".join([" ".join(i) for i in result])

    final_result = np.fromstring(final_result, dtype='f4', sep=' ')

    delivereds = final_result[1::3].astype(float)
    recordeds = final_result[2::3].astype(float)
    return {
        'fillnum': fillnum,
        'runnum': runnum,
        'lsnum': lsnum,
        'tssec': int(items[2]),
        'delivered': delivereds.tolist(),
        'recorded': recordeds.tolist(),
    }


@utils.return_error_on_exception
def get_normtag_filenames():
    if (
            hasattr(bvconfig, 'brilcommandhandler') and
            'normtag_directory' in bvconfig.brilcommandhandler and
            bvconfig.brilcommandhandler['normtag_directory']
    ):
        normtag_directory = bvconfig.brilcommandhandler['normtag_directory']
    else:
        return {'status': 'OK', 'data': []}
    filenames = os.listdir(normtag_directory)
    jsons = [x for x in filenames if x.endswith('.json')]
    normtags = [x for x in jsons if x.startswith('normtag')]
    return {'status': 'OK', 'data': normtags}


def _make_normtag_filepath(normtag):
    if (
            hasattr(bvconfig, 'brilcommandhandler') and
            'normtag_directory' in bvconfig.brilcommandhandler and
            bvconfig.brilcommandhandler['normtag_directory']
    ):
        normtag_directory = bvconfig.brilcommandhandler['normtag_directory']
    else:
        return None
    if re.match(RE_FILENAME_ALLOWED_CHARS, normtag) is None:
        return None
    fpath = os.path.join(normtag_directory, normtag)
    fpath = os.path.normpath(fpath)
    if fpath.startswith(normtag_directory):
        return fpath
    else:
        return None


def _parse_brilcalc_output(result, byls, pileup, hltpath):
    lines = [l for l in result.splitlines() if
             len(l) and not l.startswith('#')]

    if not len(lines):  # no data found
        raise ValueError('Empty result')

    reader = csv.reader(lines)
    fillnums = []
    runnums = []
    lsnums = []
    tssecs = []
    delivereds = []
    recordeds = []
    pileups = []
    hltpathids = []
    hltpathid2name = {}
    hltpathname2id = {}
    allpaths = []
    for row in reader:
        if row[0].find(':') == -1:
            # output is an error - first data field always n:m
            raise RuntimeError('/n'.join(lines))

        [runnum, fillnum] = [int(x) for x in row[0].split(':')]
        fillnums.append(fillnum)
        runnums.append(runnum)

        if byls:
            # special treat hltpathname field
            if hltpath:
                pathname = row[3]
                if pathname not in allpaths:
                    allpaths.append(pathname)
                hltpathid = allpaths.index(pathname)
                hltpathids.append(hltpathid)
                hltpathid2name[hltpathid] = pathname
                hltpathname2id[pathname] = hltpathid
                # colbase = 4
                del row[3]  # delete hltpath field
            else:
                # colbase = 5
                del row[3:5]  # delete beamstatus, E fields
        else:
            # colbase = 4
            del row[2:4]  # delete nls,ncms or ncms,hltpath for hlt

        if byls:
            lsnums.append(int(row[1].split(':')[0]))
            del row[1]
        tssecs.append(int(row[1]))
        delivereds.append(float(row[2]))
        recordeds.append(float(row[3]))
        if pileup:
            pileups.append(float(row[4]))

    for index, value in enumerate(delivereds):
        if math.isnan(value):
            delivereds[index] = 0
            print("found nan in delivered")

    for index, value in enumerate(recordeds):
        if math.isnan(value):
            recordeds[index] = 0
            print("found nan in recorded")

    return {
        'fillnum': fillnums,
        'runnum': runnums,
        'lsnum': lsnums,
        'tssec': tssecs,
        'delivered': delivereds,
        'recorded': recordeds,
        'hltpathid': hltpathids,
        'hltpathid2name': hltpathid2name,
        'hltpathname2id': hltpathname2id,
        'pileup': pileups
    }


def _get_total_lumi_command_template():
    if (
            hasattr(bvconfig, 'brilcommandhandler') and
            'command' in bvconfig.brilcommandhandler and
            bvconfig.brilcommandhandler['command']
    ):
        cmd = bvconfig.brilcommandhandler['command']
    else:
        cmd = 'brilcalc'
    if (
            hasattr(bvconfig, 'brilcommandhandler') and
            'connection' in bvconfig.brilcommandhandler and
            bvconfig.brilcommandhandler['connection']
    ):
        connection = bvconfig.brilcommandhandler['connection']
    else:
        connection = 'offline'

    return [
        cmd, 'lumi', '--output-style', 'csv', '--without-checkjson', '--tssec', '-c', connection
    ]


def _parse_time_range_args(args):
    if 'selectjson' in args:
        return ['-i', args['selectjson']]
    elif 'begin' in args and 'end' in args:
        return ['--begin', str(args['begin']), '--end', str(args['end'])]
    else:
        raise KeyError(
            'Cannot parse time range. Missing "begin", "end" or "selectjson"')


def _parse_run_ls_args(args):
    if 'runnum' in args and 'lsnum' in args:
        run = args['runnum']
        ls = args['lsnum']
        if type(run) is int and type(ls) is int:
            inpstr = '{' + str(run) + ':[[' + str(ls) + ',' + str(ls) + ']]}'
            return ['-i', inpstr]
        else:
            raise TypeError('"runnum" and/or "lsnum" is not integer.')
    else:
        raise KeyError(
            'Missing "runnum" and/or "lsnum" in args.')


def _parse_normtag(normtag):
    if normtag == '':
        raise ValueError('Empty normtag')
    normtag_file = _make_normtag_filepath(normtag)
    if normtag_file is not None and os.path.isfile(normtag_file):
        normtag = normtag_file
    return ['--normtag', normtag]

def _parse_bxids(bxid_start, bxid_end):
    bxids_str = ''
    if bxid_start != None and bxid_end != None:
        bxids = list(range(bxid_start, bxid_end+1))
        bxids_str = ','.join(str(bxid) for bxid in bxids)
    elif bxid_start != None:
        bxids_str = str(bxid_start)
    elif bxid_end != None:
        bxids_str = str(bxid_end)

    return ['--xingId', bxids_str]


if __name__ == '__main__':
    print('normtag files', get_normtag_filenames())
