import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/do';

@Injectable()
export class LiveLumiDataService {

    static postHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    static postOptions = { headers: LiveLumiDataService.postHeaders };


    constructor(private http: HttpClient) {}

    query(params) {
        const _params = Object.assign({}, params, {
            'query_type': 'livebestlumi',
        });
        const request = this.http.post('/api/query', _params, LiveLumiDataService.postOptions)
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
        return request;
    }

}
