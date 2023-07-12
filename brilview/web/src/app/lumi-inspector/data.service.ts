import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/do';

export interface LumiDataEvent {
    type: string;
    data: Object;
}

@Injectable()
export class LumiDataService {

    static postHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    static postOptions = { headers: LumiDataService.postHeaders };


    onNewLumiData$: Subject<LumiDataEvent>;
    onRemoveLumiData$: Subject<void>;
    lumiDataLimit = 10;
    lumiData = [];
    storage = {};
    lastStorageID = -1;


    constructor(private http: HttpClient) {
        this.onNewLumiData$ = new Subject();
        this.onRemoveLumiData$ = new Subject<void>();
    }

    query(params) {
        let _params = null;
        try {
            _params = this.normalizeQueryParams(params);
        } catch (e) {
            return Observable.throw(e.message);
        }
        const request = this.http.post('/api/query', _params, LumiDataService.postOptions)
            .do(data => {
                if (!data || !data.hasOwnProperty('status') || data['status'] !== 'OK') {
                    if (data.hasOwnProperty('message')) {
                        throw data['message'];
                    }
                    throw data;
                }
            }).share();
        request.subscribe(data => {
            const id = this.addToStorage(params, data['data']);
            this.onNewLumiData$.next({type: 'new', data: id});
        }, error => {});
        return request;
    }

    protected normalizeQueryParams(params) {
        const _params = Object.assign({}, params);
        _params['query_type'] = 'timelumi';
        if (_params['type']) {
            const lumitype = _params['type'].toLowerCase() || null;
            if (lumitype === 'online' || lumitype === '-normtag-') {
                _params['type'] = null;
            }
            if (lumitype === '-normtag-') {
                if (!_params['normtag']) {
                    throw Error('Normtag cannot be none when luminosity source is set to -normtag-');
                }
            } else {
                _params['normtag'] = null;
            }
            if (lumitype === 'online') {
                delete _params['minbiasxsec'];
            }
        }
        if (_params['beamstatus']) {
            if (_params['beamstatus'].toLowerCase() === '-anybeams-') {
                _params['beamstatus'] = null;
            }
        }
        return _params;
    }

    protected addToStorage(params, data) {
        const id = this.lastStorageID = this.lastStorageID + 1;
        const name = this.makeLumiDataName(params, data);
        if (this.storage.hasOwnProperty(id)) {
            throw Error('Cannot insert lumi data. ID already exists.');
        }
        this.storage[id] = {
            name: name,
            params: Object.assign({}, params),
            data: data
        };
        this.lumiData.push([id, name]);
        this.removeLumiDataOverLimit();
        return id;
    }

    makeLumiDataName(params, data) {
        return [
            params['begin'], params['end'], params['type'],
            (params['byls'] ? 'byLS' : 'byRUN'), params['beamstatus'],
            (params['without_correction'] ? 'raw' : null),
            params['normtag'], params['hltpath'], data['datatagname'],
            (params['pileup'] ? 'minbiasxsec' + params['minbiasxsec'] : null),
            params['unit'], data['tssec'].length + ' data points'
        ].filter(Boolean).join(', ');
    }

    getLumiDataFromStorage(id) {
        // TODO: better be return clone, not reference
        return this.storage[id];
    }

    removeLumiDataFromStorage(id) {
        for (let i = 0; i < this.lumiData.length; ++i) {
            if (this.lumiData[i][0] === id) {
                this.lumiData.splice(i, 1);
                break;
            }
        }
        delete this.storage[id];
        this.onRemoveLumiData$.next();
    }

    clearLumiDataStorage() {
        this.lumiData.length = 0;
        const ids = Object.keys(this.storage);
        for (const id of ids) {
            delete this.storage[id];
        }
        this.onRemoveLumiData$.next();
    }

    removeLumiDataOverLimit() {
        let id;
        while (this.lumiData.length > this.lumiDataLimit) {
            id = this.lumiData[0][0];
            this.removeLumiDataFromStorage(id);
        }
        this.onRemoveLumiData$.next();
    }

    getDatatagNames(params) {
        const _params = Object.assign({}, params);
        const request = this.http.post('/api/query', _params, LumiDataService.postOptions)
            .do(data => {
                if (!data || !data.hasOwnProperty('status') || data['status'] !== 'OK') {
                    if (data.hasOwnProperty('message')) {
                        throw data['message'];
                    }

                    throw data;
                }
            }).share();

        return request;
    }

}
