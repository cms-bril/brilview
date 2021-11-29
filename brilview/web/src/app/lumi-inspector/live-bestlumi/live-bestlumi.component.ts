import {
    Component, OnInit, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { Observable, Subscription, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

import { LiveLumiDataService } from '../live-lumi-data.service';
import { ChartComponent } from '../chart/chart.component';

@Component({
    selector: 'li-live-bestlumi',
    templateUrl: './live-bestlumi.component.html',
    styleUrls: ['./live-bestlumi.component.css']
})
export class LiveBestlumiComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('chart') chart: ChartComponent;
    @ViewChild('alerts') alerts;
    $ngUnsubscribe = new Subject<void>();
    $timer: Observable<number>;
    timerSubs: Subscription;
    live = true;
    liveWindow = 7200000;
    liveUpdateInterval = 9000;
    success = true;
    isNowLoading = false;

    constructor(protected dataService: LiveLumiDataService) { }

    ngOnInit() {
        this.chart.showRunLines = true;
        this.chart.chartHeight = 400;
    }

    ngAfterViewInit() {
        this.queryInitialData();
        this.afterLiveChange();
        this.chart.setYAxisTitle('Hz/ub');
    }

    ngOnDestroy() {
        this.$ngUnsubscribe.next();
        this.$ngUnsubscribe.complete();
    }

    toggleLive() {
        this.live = !this.live;
        this.afterLiveChange();
    }

    afterLiveChange() {
        if (this.live) {
            this.$timer = timer(1000, this.liveUpdateInterval).pipe(takeUntil(this.$ngUnsubscribe));
            this.timerSubs = this.$timer.subscribe(
                this.queryUpdateData.bind(this));
            this.chart.setTitle('Instantaneous luminosity (Live)');
        } else {
            try {
                this.timerSubs.unsubscribe();
            } catch (Exception) {}
            this.chart.setTitle('Instantaneous luminosity (Stopped)');
        }
    }

    queryInitialData() {
        this.isNowLoading = true;
        const obs = this.dataService.query({latest: this.liveWindow})
            .finally(() => this.isNowLoading = false);
        obs.subscribe(resp => {
            const d = resp['data'];
            const texts = [];
            for (let i = 0; i <= d['runnum'].length; ++i) {
                texts.push(
                    'RUN:LS - ' + d['runnum'][i] + ':' + d['lsnum'][i]);
            }
            this.chart.addSeries(
                'bestlumi', d['timestamp'], d['avg'], texts,
                {fillnum: d['fillnum'], runnum: d['runnum']});
            this.success = true;
        }, this.onQueryError.bind(this));
        return obs;
    }

    queryUpdateData() {
        const series = this.chart.chartData[0];
        if (!series) {
            return this.queryInitialData();
        }
        const x = series['x'];
        const lastx = this.tsFromLocalISOString(x[x.length - 1] + 1);
        this.isNowLoading = true;
        const obs = this.dataService.query({since: lastx})
            .finally(() => this.isNowLoading = false);
        obs.subscribe(resp => {
            const d = resp['data'];
            for (let i = 0; i < d['timestamp'].length; ++i) {
                if (d['timestamp'][i] <= lastx) {
                    continue;
                }
                this.pushSeriesPoint(series, d, i);
            }
            if (x.length === 0) {
                return;
            }
            while (x[0] < x[x.length - 1] - this.liveWindow) {
                this.shiftSeriesPoint(series);
            }
            this.chart.redrawChart();
            this.success = true;
        }, this.onQueryError.bind(this));
        return obs;
    }

    protected onQueryError(error) {
        this.success = false;
        this.alerts.alerts.length = 0;
        this.alerts.alert({
            label: '',
            message: 'Query failed. ' + (new Date()).toTimeString() + '. ' + error
        });
    }

    protected pushSeriesPoint(series, values, index) {
        // TODO: fix inconsistency of 'x' for pushSeriesPoint and addSeries
        series['x'].push(new Date(values['timestamp'][index]).toISOString());
        series['y'].push(values['avg'][index]);
        const run = values['runnum'][index];
        const fill = values['fillnum'][index];
        const ls = values['lsnum'][index];
        series['text'].push('RUN:LS - ' + run + ':' + ls);
        series._other['fillnum'].push(fill);
        series._other['runnum'].push(run);
    }

    protected shiftSeriesPoint(series) {
        series['x'].shift();
        series['y'].shift();
        series['text'].shift();
        series._other['fillnum'].shift();
        series._other['runnum'].shift();
    }

    protected tsFromLocalISOString(str) {
        const d = new Date(str.substring(0, 23));
        const offset = d.getTimezoneOffset() * 60 * 1000;
        return d.getTime() - offset;
    }

}
