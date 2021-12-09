import {
    Component, OnInit, Input, AfterViewInit, ViewChild
} from '@angular/core';
import { Observable, fromEvent as ObservableFromEvent} from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as ChartDefaults from './chart-defaults';
import {MatCheckboxModule} from '@angular/material/checkbox';

declare var Plotly: any;

@Component({
    selector: 'li-chart',
    templateUrl: './chart.component.html',
    styleUrls: [
        '../lumi-inspector.css',
        './chart.component.css'
    ]
})
export class ChartComponent implements OnInit, AfterViewInit {

    @ViewChild('chart') chart;
    @Input('noRemoveButtons') noRemoveButtons = false;
    @Input('noSeparators') noSeparators = false;
    chartData: any = [];

    beforeRemoveData = null;
    afterRemoveData = null;

    chartType = ChartDefaults.seriesStyleName;
    seriesStyle = ChartDefaults.getSeriesStyle(this.chartType);
    chartTypeOptions = ChartDefaults.seriesStyleNames;
    showRunLines = false;
    showFillLines = false;
    logarithmicY = false;
    chartHeightOptions = [300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400];
    chartHeight = 400;

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        Plotly.plot(this.chart.nativeElement,
                    this.chartData,
                    ChartDefaults.getChartLayout(),
                    ChartDefaults.getChartConfig());

        ObservableFromEvent(window, 'resize')
            .debounceTime(500)
            .subscribe(this.onResize);

        this.onResize(null);
    }

    redraw() {
        Plotly.redraw(this.chart.nativeElement);
    }

    onResize = (event) => {
        const update = {
            autosize: true,
            width: null,
            height: this.chartHeight
        };
        Plotly.relayout(this.chart.nativeElement, update);
    }

    addSeries(name: string, x: Array<number>, y: Array<number>,
              text: Array<string>, other: any, sort = true) {

        const newSeries = {
            name: name,
            line: {width: 1}
        };
        if (sort) {
            const points = this.makeDataPoints(
                {x: x, y: y, text: text},
                other);
            points.sort((a, b) => a.x - b.x);
            newSeries['x'] = points.map(p => p.x);
            newSeries['y'] = points.map(p => p.y);
            newSeries['text'] = points.map(p => p.text);
            newSeries['_other'] = {};
            Object.keys(points[0]['other']).forEach(k => {
                newSeries['_other'][k] = points.map(p => p.other).map(o => o[k]);
            });
        } else {
            newSeries['x'] = x;
            newSeries['y'] = y;
            newSeries['text'] = text;
            newSeries['_other'] = other;
        }
        newSeries['x'] = newSeries['x'].map(t => new Date(t).toISOString());
        Object.assign(newSeries, this.seriesStyle);
        this.chartData.push(newSeries);
        this.updateFillRunLines();
        Plotly.redraw(this.chart.nativeElement);
    }

    makeDataPoints(arrays, other) {
        const points = [];
        const fields = Object.keys(arrays);
        arrays[fields[0]].forEach((_, idx) => {
            const oth = {};
            Object.keys(other).forEach(othKey => {
                oth[othKey] = other[othKey][idx];
            });
            const point = {};
            fields.forEach(field => {
                point[field] = arrays[field][idx];
            });
            point['other'] = oth;
            points.push(point);
        });
        return points;
    }

    redrawChart() {
        this.updateFillRunLines();
        Plotly.redraw(this.chart.nativeElement);
    }

    clearChart() {
        if (typeof this.beforeRemoveData === 'function') {
            this.beforeRemoveData();
        }
        if (this.chartData.length > 0) {
            this.chartData.length = 0;
            Plotly.redraw(this.chart.nativeElement);
        }
        if (typeof this.afterRemoveData === 'function') {
            this.afterRemoveData();
        }
    }

    popSeries() {
        if (typeof this.beforeRemoveData === 'function') {
            this.beforeRemoveData();
        }
        if (this.chartData.length > 0) {
            this.chartData.pop();
            Plotly.redraw(this.chart.nativeElement);
        }
        if (typeof this.afterRemoveData === 'function') {
            this.afterRemoveData();
        }
    }

    autoZoom() {
        Plotly.relayout(this.chart.nativeElement, {
            'xaxis.autorange': true,
            'yaxis.autorange': true
        });
    }

    getTitle() {
        return this.chart.nativeElement.layout.title;
    }

    setTitle(newTitle) {
        Plotly.relayout(this.chart.nativeElement, {
            'title': newTitle
        });
    }

    setYAxisTitle(newTitle) {
        Plotly.relayout(this.chart.nativeElement, {
            'yaxis.title': newTitle
        });
    }

    getYAxisTitle() {
        return this.chart.nativeElement.layout.yaxis.title;
    }

    setXAxisTitle(newTitle) {
        Plotly.relayout(this.chart.nativeElement, {
            'xaxis.title': newTitle,
            'xaxis.autorange': true
        });
    }

    getXAxisTitle() {
        return this.chart.nativeElement.layout.xaxis.title;
    }

    onLogarithmicYChange() {
        const layout: any = {
            'yaxis.type': 'lin',
            'yaxis.autorange': true
        };
        if (this.logarithmicY) {
            layout['yaxis.type'] = 'log';
        }
        Plotly.relayout(this.chart.nativeElement, layout);
    }

    onChartTypeChange() {
        this.seriesStyle = ChartDefaults.getSeriesStyle(this.chartType);
        const layout = ChartDefaults.getLayoutSettings(this.chartType);
        for (const series of this.chartData) {
            Object.assign(series, this.seriesStyle);
        }
        Plotly.redraw(this.chart.nativeElement);
        if (layout) {
            Plotly.relayout(this.chart.nativeElement, layout);
        }
    }

    getNativeChartElement() {
        return this.chart.nativeElement;
    }

    updateFillRunLines() {
        const layout = this.chart.nativeElement.layout;
        let annotations = [];
        let shapes = [];
        if (this.showRunLines) {
            const runChange = this.makeRUNChangeShapesAndAnnotations();
            annotations = annotations.concat(runChange['annotations']);
            shapes = shapes.concat(runChange['shapes']);
        }
        if (this.showFillLines) {
            const fillChange = this.makeFILLChangeShapesAndAnnotations();
            annotations = annotations.concat(fillChange['annotations']);
            shapes = shapes.concat(fillChange['shapes']);
        }
        layout['annotations'] = annotations;
        layout['shapes'] = shapes;
        Plotly.relayout(this.chart.nativeElement, layout);
    }

    getFieldChangeTime(field) {
        const changes = {};
        for (const series of this.chartData) {
            let last = null;
            let current = null;
            if (!series['_other'].hasOwnProperty(field)) {
                continue;
            }
            for (let i = 0; i < series['_other'][field].length; ++i) {
                current = series['_other'][field][i];
                if (last === current) {
                    continue;
                }
                if (!changes.hasOwnProperty(current) || (changes[current] > series.x[i])) {
                    if (last !== null) {
                        changes[current] = series.x[i];
                    }
                }
                last = series['_other'][field][i];
            }
        }
        return changes;
    }

    makeRUNChangeShapesAndAnnotations() {
        const changes = this.getFieldChangeTime('runnum');
        const shapes = [];
        const annotations = [];
        for (const run of Object.keys(changes)) {
            shapes.push({
                type: 'line',
                xref: 'x',
                yref: 'paper',
                x0: changes[run],
                y0: 0,
                x1: changes[run],
                y1: 1,
                line: {
                    color: '#000000',
                    width: 2,
                    dash: 'dot'
                }
            });
            annotations.push({
                xref: 'x',
                yref: 'paper',
                x: changes[run],
                xanchor: 'left',
                y: 1,
                yanchor: 'top',
                text: 'RUN ' + run,
                textangle: -90,
                showarrow: false
            });
        }
        return {shapes: shapes, annotations: annotations};
    }

    makeFILLChangeShapesAndAnnotations() {
        const changes = this.getFieldChangeTime('fillnum');
        const shapes = [];
        const annotations = [];
        for (const fill of Object.keys(changes)) {
            shapes.push({
                type: 'line',
                xref: 'x',
                yref: 'paper',
                x0: changes[fill],
                y0: 0,
                x1: changes[fill],
                y1: 1,
                line: {
                    color: '#660092',
                    width: 3,
                    dash: 'dash'
                }
            });
            annotations.push({
                xref: 'x',
                yref: 'paper',
                x: changes[fill],
                xanchor: 'left',
                y: 0.6,
                yanchor: 'top',
                text: 'FILL<br>' + fill,
                showarrow: false
            });
        }
        return {shapes: shapes, annotations: annotations};
    }
}
