import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import * as LumiUnits from '../../../../shared/lumi-utils/lumi-units';
import * as utils from '../../../../shared/lumi-utils/lumi-chart-utils';
import { LumiDataService } from '../../../data.service';

@Component({
    selector: 'li-totlumi-values-chart',
    templateUrl: './lumi-chart.component.html',
    styleUrls: ['../../../lumi-inspector.css',
                './lumi-chart.component.css']
})
export class LumiChartComponent implements OnInit, AfterViewInit {

    @ViewChild('alerts') alerts;
    @ViewChild('chart') chart;
    lumiData: Array<Array<any>>;
    chartUnit = null;

    constructor(protected dataService: LumiDataService) {}

    ngOnInit() {
        this.dataService.onNewLumiData$.subscribe(this.onNewData.bind(this));
        this.lumiData = this.dataService.lumiData;
        this.chart.afterRemoveData = this.rescaleChartValues.bind(this);
    }

    ngAfterViewInit() {
        this.chart.setTitle('Luminosity values');
    }

    onNewData(event) {
        this.addSeriesFromMemory(event.data, 'delivered');
    }

    addSeriesFromMemory(dataid, yfield) {
        const newLumiData = this.dataService.getLumiDataFromStorage(dataid);
        const newData = newLumiData.data;
        const params = newLumiData.params;

        if (this.chart.chartData.length <= 0) {
            this.chartUnit = params['unit'];
        } else if (LumiUnits.unitsConflict(this.chartUnit, params['unit'])) {
            this.alerts.alert({
                label: '',
                message: 'Cannot add series from data "' + newLumiData.name +
                    '". Conflicting data units.'
            });
            return;
        }

        const name = [
            (params['type'] === '-normtag-' ? null : params['type']),
            (params['type'] === '-normtag-' ? params['normtag'] : null),
            yfield,
            (params['without_correction'] ? 'raw' : null),
            params['beamstatus'],
            params['hltpath'], params['datatag'],
            (params['byls'] ? 'byLS' : 'byRUN')
        ].filter(Boolean); // filter out null, undefined, 0, false, empty string

        this._addSeries(newData, yfield, name.join('_'), params);
        this.rescaleChartValues();
    }

    protected _addSeries(data, yfield, name, params) {
        this.chart.addSeries(
            name,
            data['tssec'].map(t => t*1000),
            utils.scaleLumiValues(data[yfield], params['unit'], this.chartUnit),
            this.makeTextLabels(data),
            {runnum: data['runnum'], fillnum: data['fillnum']}
        );
    }

    makeTextLabels(data) {
        const text = [];
        for (let i = 0; i < data['runnum'].length; ++i) {
            text.push(data['fillnum'][i] + ':' + data['runnum'][i] + ':' +
                      data['lsnum'][i]);
        }
        return text;
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
        this.updateYAxisTitle();
    }

}
