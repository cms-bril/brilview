docstr = """Usage: brilview [options]

Options:
     -h, --help                          Show this screen
     --debug                             Debug mode
     --daemon                            Daemon mode
     --without-browser                   Run application server only
     --config CONFIG                     Server config file
     --host HOST                         host name
     --port PORT                         port
     --pidfile PIDFILE                   pidfile
     --user USER                         user
     --group GROUP                       group

"""
import sys
import os
import docopt
import webbrowser
import yaml
import cherrypy as cp
import brilview
from cherrypy.process import plugins
from brilview import brilview_flask_app, bvlogging, bvconfig
import site

BRILVIEW_PYTHONPATH = (
#    os.path.dirname(sys.executable) + '/../lib/python2.7/site-packages/'
    site.getsitepackages()[0]
)
# ignore other PYTHONPATH
sys.path.insert(0, BRILVIEW_PYTHONPATH)

THISPATH = os.path.abspath(os.path.dirname(__file__))

log = bvlogging.get_logger()


def run_in_cp_tree(app, after_start=None):

    cpconfig = {
        'engine.autoreload.on': False
    }
    if hasattr(bvconfig, 'host') and bvconfig.host is not None:
        cpconfig['server.socket_host'] = bvconfig.host
    if hasattr(bvconfig, 'port') and bvconfig.port is not None:
        cpconfig['server.socket_port'] = bvconfig.port
    if hasattr(bvconfig, 'log_to_screen'):
        cpconfig['log.screen'] = bvconfig.log_to_screen
    if hasattr(bvconfig, 'log_file') and bvconfig.log_file is not None:
        cpconfig['log.error_file'] = bvconfig.log_file

    cp.config.update(cpconfig)

    if hasattr(bvconfig, 'daemon') and bvconfig.daemon:
        cpconfig['log.screen'] = False
        cp.config.update(cpconfig)
        plugins.Daemonizer(cp.engine).subscribe()
    cp.engine.signals.subscribe()
    if hasattr(bvconfig, 'user') or hasattr(bvconfig, 'group'):
        user = bvconfig.user if hasattr(bvconfig, 'user') else None
        group = bvconfig.group if hasattr(bvconfig, 'group') else None
        plugins.DropPrivileges(cp.engine, uid=user, gid=group).subscribe()
    if hasattr(bvconfig, 'pid_file') and bvconfig.pid_file is not None:
        plugins.PIDFile(cp.engine, bvconfig.pid_file).subscribe()

    cp.tree.graft(app, script_name='/')
    try:
        cp.engine.start()
    except:
        sys.exit(1)
    else:
        if after_start is not None:
            after_start()
        cp.engine.block()


def brilview_main(progname=sys.argv[0]):
    argv = sys.argv[1:]
    args = docopt.docopt(
        docstr, argv, help=True,
        version=brilview.__version__, options_first=True)
    log.debug('global arguments: {}'.format(str(args)))

    # if no config file is specified, use the default one in directory ../data
    if args['--config']:
        configfile = os.path.abspath(args['--config'])
    else:
        configfile = os.path.abspath(
            os.path.join(THISPATH, '..', 'data', 'brilview_user.yaml'))

    config = {}
    with open(configfile, 'r') as f:
        try:
            config = yaml.safe_load(f)
        except yaml.YAMLError as exc:
            log.error(exc)

    if args['--debug']:
        config['log_level'] = 'DEBUG'
    if args['--daemon']:
        config['daemon'] = True
    if args['--without-browser']:
        config['open_browser'] = False
    if args['--host']:
        config['host'] = args['--host']
    if args['--port']:
        config['port'] = int(args['--port'])
    if args['--pidfile']:
        config['pid_file'] = args['--pidfile']
    if args['--user']:
        config['user'] = args['--user']
    if args['--group']:
        config['group'] = args['--group']
    if 'host' not in config:
        config['host'] = '127.0.0.1'
    if 'instance_path' in config and config['instance_path'] is not None:
        if not os.path.isabs(config['instance_path']):
            raise ValueError('instance_path attribute must be absolute path')
    else:
        config['instance_path'] = os.path.join(THISPATH, '..')

    if 'log_file' in config and config['log_file'] is not None:
        if not os.path.isabs(config['log_file']):
            config['log_file'] = os.path.join(
                config['instance_path'], config['log_file'])
    if 'pid_file' in config and config['pid_file'] is not None:
        if not os.path.isabs(config['pid_file']):
            config['pid_file'] = os.path.join(
                config['instance_path'], config['pid_file'])

    bvconfig.update(config)
    bvlogging.update(config)
    log.debug(str(bvconfig.get_dict()))

    app = brilview_flask_app.init_app()

    if 'open_browser' in config and config['open_browser']:
        def after_start():
            url = 'http://'+config['host'] + ':' + str(config['port'])
            log.debug('Opening default browser at {}'.format(url))
            webbrowser.open(url)
    else:
        def after_start():
            pass
        
    if 'use_cherrypy' in config and config['use_cherrypy']:
        run_in_cp_tree(app, after_start=after_start)
    else:
        brilview_flask_app.run(after_start=after_start)

    return
