import {
    Component, OnInit, Input, OnDestroy, ViewChild
} from '@angular/core';
import { BXLumiChartComponent } from './bxlumi-chart/bxlumi-chart.component';
import { DataCache } from '../../shared/data-cache/data-cache';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';


@Component({
    selector: 'bxli-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {

    protected ngUnsubscribe$ = new Subject<void>();
    @Input('cache') cache: DataCache;
    @ViewChild('bxlumiChart', {static : false}) bxlumiChart: BXLumiChartComponent;
    lumiChartVisible = true;
    ratioChartVisible = false;

    constructor() {
    }

    ngOnInit() {
        this.cache.onSetData$.takeUntil(this.ngUnsubscribe$).subscribe(key => {
            if (this.lumiChartVisible) {
                this.bxlumiChart.addSeriesFromCache(key, 'delivered');
            }
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    dispatchResize() {
        window.dispatchEvent(new Event('resize'));
    }

}
