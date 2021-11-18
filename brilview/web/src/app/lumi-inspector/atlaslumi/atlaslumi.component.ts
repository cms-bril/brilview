import {
    Component, OnInit, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import 'rxjs/observable/timer';
import 'rxjs/add/operator/takeUntil';

import { AtlaslumiDataService } from '../atlaslumi-data.service';
import { LumiDataService as BrillumiDataService } from '../data.service';
import { ChartComponent } from '../chart/chart.component';
import * as utils from '../../shared/lumi-utils/lumi-chart-utils';

@Component({
    selector: 'li-atlaslumi',
    templateUrl: './atlaslumi.component.html',
    styleUrls: ['./atlaslumi.component.css']
})
export class AtlaslumiComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('chart', {static : false}) chart: ChartComponent;
    @ViewChild('alerts', {static : false}) alerts;
    chartUnit = 'Hz/ub';
    fillnum = null;
    $ngUnsubscribe = new Subject<void>();
    loadingStatus: string;
    loadingProgress = 0;
    responseMessage = null;

    constructor(
        protected atlasDataService: AtlaslumiDataService,
        protected brilDataService: BrillumiDataService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        setTimeout(this.queryInitialData.bind(this), 500);
    }

    ngOnDestroy() {
        this.$ngUnsubscribe.next();
        this.$ngUnsubscribe.complete();
    }

    queryInitialData() {
        this.queryAtlasLumi({});
    }

    queryAtlasLumi(event) {
        this.chart.clearChart();
        this.onQueryStart();
        const obs = this.atlasDataService.query(event)
            .finally(() => this.loadingProgress = 100);
        obs.subscribe(resp => {
            const d = resp['data'];
            this.fillnum = d['single_fillnum'];
            this.chart.setTitle('Instantaneous luminosity. Fill: ' + d['single_fillnum']);
            this.chartUnit = 'Hz/ub';
            this.chart.addSeries('ATLAS', d['timestamp'], d['lumi_totinst'], [], {});
            this.rescaleChartValues();
            this.chart.autoZoom();
            this.onQuerySuccess(resp);
        }, this.onQueryError.bind(this));
        return obs;
    }

    queryBrilLumi(event) {
        this.onQueryStart();
        const query = Object.assign(event, {
            begin: this.fillnum,
            end: this.fillnum
        });
        const obs = this.brilDataService.query(query)
            .finally(() => this.loadingProgress = 100);
        obs.subscribe(resp => {
            const d = resp['data'];
            const x = d['tssec'].map(x => x * 1000);
            const y = utils.scaleLumiValues(d['delivered'], event['unit'], this.chartUnit);
            console.log(event, d['delivered'], this.chartUnit, y);
            const nameParts = [
                'BRIL',
                (event['type'] === '-normtag-' ? null : event['type']),
                (event['type'] === '-normtag-' ? event['normtag'] : null)
            ].filter(Boolean);
            this.chart.addSeries(nameParts.join('_'), x, y, [], {});
            this.rescaleChartValues();
            this.onQuerySuccess(resp);
        }, this.onQueryError.bind(this));
        return obs;
    }

    protected onQueryError(err) {
        this.loadingProgress = 100;
        this.loadingStatus = 'ERROR';
        this.responseMessage = err;
    }

    protected onQuerySuccess(resp) {
        this.loadingProgress = 100;
        this.loadingStatus = 'OK';
        this.responseMessage = null;
    }

    protected onQueryStart() {
        this.loadingProgress = 0;
        this.loadingStatus = 'WAITING';
        this.responseMessage = null;
    }

    protected rescaleChartValues() {
        this.chartUnit = utils.rescaleChartLumiValues(this.chart, this.chartUnit);
        this.chart.setYAxisTitle(this.chartUnit);
    }

}
