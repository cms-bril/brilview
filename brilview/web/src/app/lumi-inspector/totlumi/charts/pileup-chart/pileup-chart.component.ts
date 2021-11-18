import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/debounceTime';
import { LumiDataService } from '../../../data.service';
import * as LumiUnits from '../../../../shared/lumi-utils/lumi-units';

@Component({
    selector: 'li-totlumi-pileup-chart',
    templateUrl: './pileup-chart.component.html',
    styleUrls: ['../../../lumi-inspector.css',
                './pileup-chart.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class PileupChartComponent implements OnInit, AfterViewInit {

    @ViewChild('alerts', {static : false}) alerts;
    @ViewChild('chart', {static : false}) chart;
    @ViewChild('lumiDataSelect1', {static : false}) lumiDataSelect1;
    lumiData: Array<Array<any>> = [[]];

    constructor(protected dataService: LumiDataService) {}

    ngOnInit() {
        this.lumiData = this.dataService.lumiData;
    }

    ngAfterViewInit() {
        this.chart.setTitle('Pileup');
    }


    addSeries(dataid) {
        const newLumiData = this.dataService.getLumiDataFromStorage(dataid);
        const newData = newLumiData.data;
        const params = newLumiData.params;

        if (!newData['pileup'] || !newData['pileup'].length) {
            this.alerts.alert({
                label: '',
                message: ('No pileup data in "' + newLumiData.name)
            });
            return;
        }

        const name = [
            (params['type'] === '-normtag-' ? params['normtag'] : params['type']),
            (params['without_correction'] ? 'raw' : null),
            params['beamstatus'],
            params['hltpath'], params['datatag'],
            'minbias' + params['minbiasxsec']
        ].filter(Boolean); // filter out null, undefined, 0, false, empty string

        this._addSeries(newData, name.join('_'), params);
    }

    protected _addSeries(data, name, params) {
        this.chart.addSeries(
            name,
            data['tssec'].map(t => t*1000),
            data['pileup'],
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

}
