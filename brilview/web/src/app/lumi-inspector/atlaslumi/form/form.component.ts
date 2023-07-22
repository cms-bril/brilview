import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LUMI_TYPES } from 'app/app.config';

@Component({
    selector: 'li-atlaslumi-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

    fillnum = null;
    brilLumiType = 'Online';
    brilNormtag = undefined;
    brilLumiTypeOptions = LUMI_TYPES.concat(['-normtag-']);
    connection = 'web';
    connectionOptions = ['web', 'offline'];
    @Output() onAtlasQuery = new EventEmitter<{}>();
    @Output() onBrilQuery = new EventEmitter<{}>();

    constructor() { }

    ngOnInit() {
    }

    clickAtlasQuery() {
        this.onAtlasQuery.emit({fillnum: this.fillnum});
    }

    clickBrilQuery() {
        this.onBrilQuery.emit({
            fillnum: this.fillnum,
            type: this.brilLumiType,
            normtag: this.brilNormtag,
            unit: 'hz/ub',
            byls: true,
            connection: this.connection
        });
    }

}
