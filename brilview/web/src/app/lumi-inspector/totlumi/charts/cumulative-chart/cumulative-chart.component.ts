import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import * as utils from '../../../../shared/lumi-utils/lumi-chart-utils';
import { LumiChartComponent } from '../lumi-chart/lumi-chart.component';
import { LumiDataService } from '../../../data.service';

@Component({
    selector: 'li-totlumi-cumulative-chart',
    templateUrl: '../lumi-chart/lumi-chart.component.html',
    styleUrls: ['../../../lumi-inspector.css',
                '../lumi-chart/lumi-chart.component.css']
})
export class CumulativeChartComponent extends LumiChartComponent
implements OnInit, AfterViewInit {

    constructor(protected dataService: LumiDataService) {
        super(dataService);
    }

    ngOnInit() {
        console.log(this.dataService);
        this.lumiData = this.dataService.lumiData;
    }

    ngAfterViewInit() {
        this.chart.setTitle('Cumulative luminosity');
    }

    protected _addSeries(data, yfield, name, params) {
        const points = this.chart.makeDataPoints({
            x: data['tssec'].map(t => 1000 * t),
            y: data[yfield],
            text: this.makeTextLabels(data)
        }, {
            runnum: data['runnum'],
            fillnum: data['fillnum']
        });
        points.sort((a, b) => a.x - b.x);
        let sum = 0;
        let y = points.map(p => {
            sum += p.y;
            return sum;
        });
        y = utils.scaleLumiValues(y, params['unit'], this.chartUnit);
        this.chart.addSeries(
            name, points.map(p => p.x), y, points.map(p => p.text),
            points.map(p => p.other), false);
    }
}
