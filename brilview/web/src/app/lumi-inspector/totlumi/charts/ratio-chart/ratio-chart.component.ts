import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/debounceTime';
import { LumiDataService } from '../../../data.service';
import * as LumiUnits from '../../../../shared/lumi-utils/lumi-units';

@Component({
    selector: 'li-totlumi-ratio-chart',
    templateUrl: './ratio-chart.component.html',
    styleUrls: ['../../../lumi-inspector.css',
                './ratio-chart.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatioChartComponent implements OnInit, AfterViewInit {

    @ViewChild('alerts', {static: false} ) alerts;
    @ViewChild('chart', {static: false}) chart;
    @ViewChild('lumiDataSelect1', {static: false}) lumiDataSelect1;
    @ViewChild('lumiDataSelect2', {static: false}) lumiDataSelect2;
    lumiData: Array<Array<any>> = [[]];
    lumiDataStorageUpdates$: Observable<any>;
    currentPermutationIdx = 0;
    permutations = [];

    constructor(protected dataService: LumiDataService) {
        this.lumiDataStorageUpdates$ = this.dataService.onNewLumiData$
            .merge(this.dataService.onRemoveLumiData$)
            .debounceTime(100);
    }

    ngOnInit() {
        this.lumiDataStorageUpdates$
            .subscribe(() => {
                this.makePermutations();
            });
        this.lumiData = this.dataService.lumiData;
    }

    ngAfterViewInit() {
        this.chart.setTitle('Luminosity ratios');
    }

    addRatio(dataid1, yfield1, dataid2, yfield2) {
        const lumiData1 = this.dataService.getLumiDataFromStorage(dataid1);
        const lumiData2 = this.dataService.getLumiDataFromStorage(dataid2);
        const data1 = lumiData1.data;
        const data2 = lumiData2.data;
        const name = this.makeSeriesName(
            lumiData1.params, yfield1, lumiData2.params, yfield2);

        console.log(name);

        const data1TimeIndex = {};
        for (let i = 0; i < data1['runnum'].length; ++i) {
            data1TimeIndex[data1['runnum'][i] * 10000 + data1['lsnum'][i]] = i;
        }
        const text = [];
        const x = [];
        const y = [];
        const meta = {runnum: [], fillnum: []};
        for (let j = 0; j < data2['runnum'].length; ++j) {
            const data1Index = data1TimeIndex[
                data2['runnum'][j] * 10000 + data2['lsnum'][j]
            ];
            if (!Number.isInteger(data1Index)) {
                continue;
            }
            x.push(data1['tssec'][data1Index] * 1000);
            y.push(data1[yfield1][data1Index] / data2[yfield2][j]);
            text.push(data1['fillnum'][data1Index] + ':' +
                      data1['runnum'][data1Index] + ':' +
                      data1['lsnum'][data1Index]);
            meta.runnum.push(data1['runnum'][data1Index]);
            meta.fillnum.push(data1['fillnum'][data1Index]);
        }
        if (x.length <= 0) {
            this.alerts.alert({
                label: '',
                message: ('Intersection empty. "' + lumiData1.name + '" and "' +
                          lumiData2.name + '"')
            });
            return;
        }
        this.chart.addSeries(name, x, y, text, meta);
        this.chart.setYAxisTitle('Ratio');
    }

    makeSeriesName(params1, yfield1, params2, yfield2) {
        const series = [[params1, yfield1], [params2, yfield2]];
        const name = [];
        for (const s of series) {
            // 1) put relevant field,
            // 2) filter out null, undefined, 0, false, empty string
            // 3) join with '_'
            name.push([
                (s[0]['type'] === '-normtag-' ? null : s[0]['type']),
                (s[0]['type'] === '-normtag-' ? s[0]['normtag'] : null),
                s[1],
                (s[0]['without_correction'] ? 'raw' : null),
                s[0]['hltpath'], s[0]['datatag'],
                (s[0]['byls'] ? 'byLS' : 'byRUN'),
                (LumiUnits.isInstantaneousUnit(s[0]['unit']) ? 'inst.' : 'integr.')
            ].filter(Boolean).join('_'));
        }
        return name.join('/');
    }

    makePermutations() {
        const newPermutations = [];
        this.lumiData.forEach((a, idxa) => {
            this.lumiData.forEach((b, idxb) => {
                newPermutations.push([idxa, idxb]);
            });
        });
        this.currentPermutationIdx = 0;
        this.permutations = newPermutations;
    }

    permute(step) {
        const s1 = this.lumiDataSelect1.nativeElement;
        const s2 = this.lumiDataSelect2.nativeElement;
        if (!this.permutations.length) {
            s1.selectedIndex = s2.selectedIndex = -1;
            return;
        }
        if (this.permutations.length == 1) {
            s1.selectedIndex = s2.selectedIndex = 0;
            return;
        }
        const n = this.permutations.length;
        const i = this.currentPermutationIdx + step;
        this.currentPermutationIdx = ((i % n) + n) % n;
        s1.selectedIndex = this.permutations[this.currentPermutationIdx][0];
        s2.selectedIndex = this.permutations[this.currentPermutationIdx][1];
    }

}
