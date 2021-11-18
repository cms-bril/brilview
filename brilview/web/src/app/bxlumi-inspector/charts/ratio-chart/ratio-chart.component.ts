import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ChartComponent } from '../../chart/chart.component';
import * as LumiUnits from '../../../shared/lumi-utils/lumi-units';
import * as utils from '../../../shared/lumi-utils/lumi-chart-utils';
import { DataCache } from '../../../shared/data-cache/data-cache';

@Component({
    selector: 'bxli-ratio-chart',
    templateUrl: './ratio-chart.component.html',
    styleUrls: ['./ratio-chart.component.css']
})
export class RatioChartComponent implements OnInit {

    @Input('cache') cache: DataCache;
    @ViewChild('chart', {static : false}) chart: ChartComponent;

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.chart.setTitle('Per bunch ratios');
    }

    addSeriesFromCache(key1, yfield1, key2, yfield2) {
        const newData1 = this.cache.getData(key1);
        const newData2 = this.cache.getData(key2);
        const lumi1 = newData1.data;
        const lumi2 = newData2.data;
        const params1 = newData1.params;
        const params2 = newData2.params;
        const name = this.make_name(params1, yfield1, params2, yfield2);
        const y = lumi1[yfield1].map((el, i) => el/lumi2[yfield2][i]);
        const x = y.map((el, i) => i+1);
        this.chart.addSeries(name, x, y, [], []);
    }

    protected make_name(params1, yfield1, params2, yfield2) {
        const name = [];
        [[params1, yfield1], [params2, yfield2]].forEach(pair => {
            const p = pair[0];
            const y = pair[1];
            const current_name = [
                p['runnum'], p['lsnum'],
                (p['type'] === '-normtag-' ? null : p['type']),
                (p['type'] === '-normtag-' ? p['normtag'] : null),
                y,
                (p['without_correction'] ? 'raw' : null)
            ];
            name.push(current_name.filter(Boolean).join('_'));
        });
        return name.join('/');
    }

}
