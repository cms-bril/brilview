import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/do';

@Injectable()
export class BXLumiDataService {

    static postHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    static postOptions = { headers: BXLumiDataService.postHeaders };

    onNewLumiData$: Subject<any>;

    constructor(protected http: HttpClient) {
        this.onNewLumiData$ = new Subject<any>();

    }

    query(params) {
        let _params = null;
        try {
            _params = this.parseParameters(params);
        } catch (e) {
            return new Observable(subscriber => subscriber.error(e.message));
        }
        const request = this.http.post('/api/query', _params, BXLumiDataService.postOptions)
            .do(data => {
                if (!data || !data.hasOwnProperty('status') || data['status'] !== 'OK') {
                    if (data.hasOwnProperty('message')) {
                        throw data['message'];
                    }
                    throw data;
                }
                this.onNewLumiData$.next({
                    data: data['data'],
                    params: Object.assign({}, params)
                });
            });
        return request;
    }

    parseParameters(p) {
        const parsed = Object.assign({}, p);
        parsed['query_type'] = 'bxlumi';
        if (parsed.hasOwnProperty('type')) {
            const lumitype = parsed['type'].toLowerCase();
            if (lumitype === 'online' || lumitype === '-normtag-') {
                parsed['type'] = null;
            }
        }
        return parsed;
    }
}
