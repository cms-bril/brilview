import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { BXLumiDataService } from './data.service';
import { DataCache } from '../shared/data-cache/data-cache';


@Component({
    selector: 'bv-bxlumi-inspector',
    templateUrl: './bxlumi-inspector.component.html',
    styleUrls: ['./bxlumi-inspector.component.css']
})
export class BXLumiInspectorComponent implements OnInit, OnDestroy {

    private ngUnsubscribe$ = new Subject<void>();
    cache: DataCache;
    cacheTableActions = {
        exportCSV: function(key, value) {
            console.log('exportCSV', key, value);
        }
    }

    constructor(protected dataService: BXLumiDataService) {
        this.cache = new DataCache();
        this.dataService.onNewLumiData$
            .takeUntil(this.ngUnsubscribe$)
            .subscribe(newData => {
                const cacheKey = Date.now().toString();
                const cacheValue = {
                    data: newData.data,
                    params: newData.params,
                    name: this.makeResultName(newData)
                };
                this.cache.setData(cacheKey, cacheValue);
                if (this.cache.getSize() > 10) {
                    const timestamps = this.cache.getKeys()
                        .map(key => {return parseInt(key, 10);  })
                        .sort((a: number, b: number) => (a - b));
                    this.cache.removeData(timestamps[0].toString());
                }
            });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    makeResultName(queryResult) {
        const p = queryResult.params;
        const nameFields = [
            p['runnum'], p['lsnum'], p['type'], p['normtag'], p['unit'],
            (p['without_correction'] ? 'raw' : 'result')
        ];
        return nameFields.filter(Boolean).join(',');
    }

    nameGetter(key, value) {
        return value.name;
    }

}
