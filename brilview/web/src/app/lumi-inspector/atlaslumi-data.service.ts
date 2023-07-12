import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { LumiDataService } from './data.service';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/do';

export interface LumiDataEvent {
    type: string;
    data: Object;
}

@Injectable()
export class AtlaslumiDataService {

    static postHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    static postOptions = { headers: AtlaslumiDataService.postHeaders };


    constructor(private http: HttpClient, private lumiDataService: LumiDataService) {}

    query(params) {
        let _params = Object.assign({}, params, {
            'query_type': 'atlaslumi',
            'unit': 'hz/ub'
        });
        const request = this.http.post('/api/query', _params, AtlaslumiDataService.postOptions)
            .do(data => {
                if (!data) {
                    throw data;
                }
                if (!data.hasOwnProperty('status') || data['status'] !== 'OK') {
                    if (data.hasOwnProperty('message')) {
                        throw data['message'];
                    }
                    throw data;
                }
            }).share();
        request.subscribe(data => {
            const id = this.addToStorage(_params, data['data']);
            this.lumiDataService.onNewLumiData$.next({type: 'new', data: id});
        }, error => {});
        return request;
    }

    protected addToStorage(params, data) {
        const id = this.lumiDataService.lastStorageID = this.lumiDataService.lastStorageID + 1;
        const name = this.makeLumiDataName(params, data);
        let fill_array = new Array(data['timestamp'].length).fill(data['single_fillnum']);
        data['single_fillnum'] = fill_array;
        if (this.lumiDataService.storage.hasOwnProperty(id)) {
            throw Error('Cannot insert lumi data. ID already exists.');
        }
        this.lumiDataService.storage[id] = {
            name: name,
            params: Object.assign({}, params),
            data: data
        };
        this.lumiDataService.lumiData.push([id, name]);
        this.removeLumiDataOverLimit();
        return id;
    }

    makeLumiDataName(params, data) {
        return [
            data['single_fillnum'], params['query_type'],
            params['unit'], data['timestamp'].length + ' data points'
        ].filter(Boolean).join(', ');
    }

    removeLumiDataOverLimit() {
        let id;
        while (this.lumiDataService.lumiData.length > this.lumiDataService.lumiDataLimit) {
            id = this.lumiDataService.lumiData[0][0];
            this.removeLumiDataFromStorage(id);
        }
        this.lumiDataService.onRemoveLumiData$.next();
    }

    removeLumiDataFromStorage(id) {
        for (let i = 0; i < this.lumiDataService.lumiData.length; ++i) {
            if (this.lumiDataService.lumiData[i][0] === id) {
                this.lumiDataService.lumiData.splice(i, 1);
                break;
            }
        }
        delete this.lumiDataService.storage[id];
        this.lumiDataService.onRemoveLumiData$.next();
    }
}
