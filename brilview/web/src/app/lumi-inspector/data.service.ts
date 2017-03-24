import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

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
export class DataService {

    static postHeaders = new Headers({'Content-Type': 'application/json'});
    static postOptions = new RequestOptions({ headers: DataService.postHeaders });


    onNewLumiData: Subject<LumiDataEvent>;
    lumiDataLimit = 10;
    lumiData = [];
    protected storage = {};
    protected lastStorageID = -1;


    constructor(private http: Http) {
        this.onNewLumiData = new Subject();
    }

    query(params) {
        let _params = null;
        try {
            _params = this.normalizeQueryParams(params);
        } catch (e) {
            return Observable.throw(e.message);
        }
        const request = this.http.post('/api/query', _params, DataService.postOptions)
            .map((data) => {
                return data.json();
            })
            .do(data => {
                if (!data || !data.hasOwnProperty('status') || data['status'] !== 'OK') {
                    if (data.hasOwnProperty('message')) {
                        throw data.message;
                    }
                    throw data;
                }
            }).share();
        request.subscribe(data => {
            const id = this.addToStorage(params, data.data);
            this.onNewLumiData.next({type: 'new', data: id});
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
            params['normtag'], params['hltpath'], params['datatag'],
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
    }

    clearLumiDataStorage() {
        this.lumiData.length = 0;
        const ids = Object.keys(this.storage);
        for (const id of ids) {
            delete this.storage[id];
        }
    }

    removeLumiDataOverLimit() {
        let id;
        while (this.lumiData.length > this.lumiDataLimit) {
            id = this.lumiData[0][0];
            this.removeLumiDataFromStorage(id);
        }
    }

}