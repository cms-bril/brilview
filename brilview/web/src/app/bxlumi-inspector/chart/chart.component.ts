import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Observable, fromEvent as ObservableFromEvent } from 'rxjs';
import { debounceTime} from 'rxjs/operators';
import * as ChartDefaults from './chart-defaults';

declare var Plotly: any;


@Component({
  selector: 'bxli-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

    @ViewChild('chart') chart;
    chartData: any = [];

    chartType = ChartDefaults.seriesStyleName;
    seriesStyle = ChartDefaults.getSeriesStyle(this.chartType);
    chartHeightOptions = [300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400];
    chartHeight = 300;

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        Plotly.plot(this.chart.nativeElement,
                    this.chartData,
                    ChartDefaults.getChartLayout(),
                    ChartDefaults.getChartConfig());

        ObservableFromEvent(window, 'resize').pipe(
            debounceTime(500)
        ).subscribe(this.onResize);

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
              text: Array<string>, other: any) {
        const newSeries = {
            name: name,
            x: x,
            y: y,
            text: text,
            _other: other,
        };
        Object.assign(newSeries, this.seriesStyle);
        this.chartData.push(newSeries);
        Plotly.redraw(this.chart.nativeElement);
    }

    clearChart() {
        if (this.chartData.length > 0) {
            this.chartData.length = 0;
            Plotly.redraw(this.chart.nativeElement);
        }
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
            'yaxis.title': newTitle,
            'yaxis.autorange': true
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

    getNativeChartElement() {
        return this.chart.nativeElement;
    }

}
