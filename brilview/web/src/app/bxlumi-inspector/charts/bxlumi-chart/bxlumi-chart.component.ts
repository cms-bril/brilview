import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import * as LumiUnits from '../../../shared/lumi-utils/lumi-units';
import * as utils from '../../../shared/lumi-utils/lumi-chart-utils';
import { DataCache } from '../../../shared/data-cache/data-cache';

@Component({
    selector: 'bxli-bxlumi-chart',
    templateUrl: './bxlumi-chart.component.html',
    styleUrls: ['./bxlumi-chart.component.css']
})
export class BXLumiChartComponent implements OnInit {

    @Input('cache') cache: DataCache;
    @ViewChild('alerts') alerts;
    @ViewChild('chart') chart;
    chartUnit = null;

    constructor() { }

    ngOnInit() {
        this.chart.afterRemoveData = this.rescaleChartValues.bind(this);
    }

    ngAfterViewInit() {
        this.chart.setTitle('Per bunch luminosity');
    }

    addSeriesFromCache(key, yfield) {
        const newData = this.cache.getData(key);
        const lumi = newData.data;
        const params = newData.params;

        if (this.chart.chartData.length <= 0) {
            this.chartUnit = params['unit'];
        } else if (LumiUnits.unitsConflict(this.chartUnit, params['unit'])) {
            this.alerts.alert({
                label: '',
                message: 'Cannot add series from data "' + newData.name +
                    '". Conflicting data units.'
            });
            return;
        }

        const name = [
            params['runnum'], params['lsnum'],
            (params['type'] === '-normtag-' ? null : params['type']),
            (params['type'] === '-normtag-' ? params['normtag'] : null),
            yfield,
            (params['without_correction'] ? 'raw' : null)
        ].filter(Boolean); // filter out null, undefined, 0, false, empty string

        this._addSeries(lumi, yfield, name.join('_'), params);
        this.rescaleChartValues();
    }

    protected _addSeries(data, yfield, name, params) {
        const x = [];
        for (let i = 0; i < data[yfield].length; ++i) {
            x.push(i+1);
        }
        this.chart.addSeries(
            name,
            x,
            utils.scaleLumiValues(data[yfield], params['unit'], this.chartUnit),
        );
        this.rescaleChartValues();
    }

    updateYAxisTitle() {
        const newTitle = (LumiUnits.isInstantaneousUnit(this.chartUnit) ?
                          'Instantaneous' :
                          'Integrated')
            + ' luminosity (' + this.chartUnit + ')';
        const currentTitle = this.chart.getYAxisTitle();
        if (currentTitle !== newTitle) {
            this.chart.setYAxisTitle(newTitle);
        }
    }

    protected rescaleChartValues() {
        this.chartUnit = utils.rescaleChartLumiValues(this.chart, this.chartUnit);
        this.chart.setYAxisTitle(this.chartUnit);
    }

}
