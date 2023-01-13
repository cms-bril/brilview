import { Component, OnInit } from '@angular/core';
import { BXLumiDataService } from '../data.service';
import { LUMI_TYPES } from 'app/app.config';

@Component({
    selector: 'bxli-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

    public resultStatusText: string;
    public resultMessage: string;
    public progress = 0;
    public progressStatus: string;

    public params = {
        runnum: null,
        lsnum: null,
        type: 'Online',
        unit: 'hz/mb',
        normtag: null,
        without_correction: false,
        bxthreshold: null,
        xingmin: null,
        bxid_start: null,
        bxid_end: null
    }

    paramOptions = {
        type: LUMI_TYPES.concat(['-normtag-']),
        unit: [['hz/mb', 'Instantaneous'], ['/mb', 'Integrated']],
        normtag: null
    };

    constructor(protected dataService: BXLumiDataService) {
    }

    ngOnInit() {
    }

    query() {
        this.resultStatusText = 'WAITING';
        this.resultMessage = null;
        this.progress = 1;
        this.progressStatus = 'info';
        this.dataService.query(this.params) .subscribe(result => {
            this.resultStatusText = 'OK';
            this.resultMessage = null;
            this.progress = 100;
            this.progressStatus = 'success';
        }, error => {
            this.resultStatusText = 'ERROR';
            this.resultMessage = error;
            this.progress = 100;
            this.progressStatus = 'danger';
        });
    }

}
