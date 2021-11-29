import { Component, OnInit, Input } from '@angular/core';
import * as ArrStat from '../../utils/arr-stat';

@Component({
    selector: 'bv-chart-stats',
    templateUrl: './chart-stats.component.html',
    styleUrls: ['./chart-stats.component.css']
})
export class ChartStatsComponent implements OnInit {

    @Input('chart') chart;
    stats = [];
    visibleRanges = {
        x: [-Infinity, Infinity],
        y: [-Infinity, Infinity]
    };

    constructor() { }

    ngOnInit() {
    }

    protected getSeries() {
        return this.chart.getNativeChartElement().data;
    }

    protected getVisibleRanges() {
        const layout = this.chart.getNativeChartElement().layout;
        // x - array of two Date objects or infinities. If xrange from chart
        // comes as strings, then they need to be treated as UTC
        return {
            x: (layout.xaxis && layout.xaxis.range
                ? layout.xaxis.range
                : [-Infinity, Infinity]
               ).map(x => {
                   return typeof x === 'string' && !x.endsWith('Z')
                       ? new Date(x + 'Z')
                       : x;
               }),
            y: layout.yaxis && layout.yaxis.range
                ? layout.yaxis.range.slice()
                : [-Infinity, Infinity]
        }
    }

    toISOStringNoThrow(date) {
        try {
            return date.toISOString();
        } catch (any) {
            return date;
        }
    }

    recalculate() {
        const series = this.getSeries();
        const visibleRanges = this.getVisibleRanges();
        const visible = series.map(s => {
            return {
                name: s.name + ' * in view',
                y: s.y.filter((y, idx) => {
                    return (new Date(s.x[idx]) >= visibleRanges.x[0] &&
                            new Date(s.x[idx]) <= visibleRanges.x[1]);
                }).filter(y => {
                    return y >= visibleRanges.y[0] && y <= visibleRanges.y[1];
                })
            };
        });
        const new_stats = [];
        let values = null;
        for (const s of series.concat(visible)) {
            values = s.y.filter(Number.isFinite);
            new_stats.push({
                name: s.name,
                min: ArrStat.min(values),
                max: ArrStat.max(values),
                mean: ArrStat.mean(values),
                variance: ArrStat.variance(values),
                std: ArrStat.standardDeviation(values),
                rms: ArrStat.rms(values)
            });
        }
        this.stats = new_stats;
        this.visibleRanges = visibleRanges;
    }
}
