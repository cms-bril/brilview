import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LumiDataService } from '../../data.service';
import { Observable as ObservabeFrom } from 'rxjs/Observable'; // useful?
import { concatMap } from 'rxjs/operators';
import { LUMI_TYPES, BEAMS } from 'app/app.config';

@Component({
    selector: 'li-totlumi-form',
    templateUrl: './form.component.html',
    styleUrls: [
        '../../lumi-inspector.css',
        './form.component.css'
    ]
})
export class FormComponent implements OnInit {

    message = '';
    loadingStatus = '';
    loadingProgress = 100;
    datePipe: DatePipe;
    beginFieldIsDate = false;
    endFieldIsDate = false;
    params = {
        begin: null,
        end: null,
        timeunit: null,
        beamstatus: '-anybeams-',
        normtag: null,
        datatag: null,
        datatagname: null,
        hltpath: null,
        unit: 'hz/mb',
        type: 'Online',
        byls: true,
        without_correction: false,
        pileup: false,
        minbiasxsec: 80000,
        connection: 'web'
    };
    paramOptions = {
        timeunit: ['RUN/FILL', 'DATE'],
        type: LUMI_TYPES.concat(['-normtag-']),
        unit: [['hz/mb', 'Instantaneous'], ['/mb', 'Integrated']],
        beamstatus: ['-anybeams-'].concat(BEAMS),
        normtag: null,
        datatagnames: null,
        connection: ['web', 'offline']
    };
    paramOptionsLoading = {
        normtag: false
    };
    protected paramOptionsShouldLoad = {
        normtag: true
    };

    validators = {
        unit: () =>  true
    };
    errors = {
        unit: null
    };

    constructor(protected lumiDataService: LumiDataService) {
    }

    ngOnInit() {
        this.datePipe = new DatePipe('en-US');
    }

    query() {
        this.parseDates();
        if (!this.formIsValid()) {
            this.loadingStatus = 'WILL NOT QUERY';
            this.message = 'Form is invalid';
            return;
        }
        this.loadingStatus = 'WAITING';
        this.message = null;
        this.loadingProgress = 0;
        let requests = null;
        if (this.params.normtag && this.params.type === '-normtag-') {
            let norm_params = this.params.normtag
            norm_params = norm_params.split(',')
            norm_params = norm_params.filter(function(str) {     //delete white spaces elements
                return /\S/.test(str);
            });
            norm_params = norm_params.map(function (val) { /// delete white spaces for each string
                return val.trim();
              });
            this.params['normtag']= norm_params.toString()
            const params = Object.assign({}, this.params);
            console.log(params)
            requests =  this.lumiDataService.query(params);
            /*new ObservabeFrom(
                this.params.normtag.split(',')).pipe(
                concatMap((val: string) => {
                    const params = Object.assign({}, this.params);
                    params['normtag'] = val.trim();
                    console.log("param:")
                    console.log(params)
                    return this.lumiDataService.query(params);
                })
            );*/
        } else {
            const params = Object.assign({}, this.params);
            requests = this.lumiDataService.query(params);
            console.log(params)
        }
        requests.finally(() => this.loadingProgress = 100)
            .subscribe(
                this.handleQuerySuccess.bind(this),
                this.handleQueryFailure.bind(this)
            );
    }

    parseDates() {
        if (this.params.begin instanceof Date) {
            this.params.begin = this.datePipe.transform(this.params.begin, 'MM/dd/yy HH:mm:ss');
        }
        if (this.params.end instanceof Date) {
            this.params.end = this.datePipe.transform(this.params.end, 'MM/dd/yy HH:mm:ss');
        }
    }

    handleQuerySuccess(data) {
        this.message = null;
        this.loadingStatus = data.status;
    }

    handleQueryFailure(error) {
        this.loadingStatus = 'REQUEST FAILED';
        this.message = JSON.stringify(error);
    }

    formIsValid() {
        for (const validator of Object.keys(this.validators)) {
            if (!this.validators[validator]()) {
                return false;
            }
        }
        return true;
    }

    timeoutFocus(element, interval: number) {
        setTimeout(() => {
            element.focus();
        }, interval);
    }

    autoFillParamsEnd() {
        if (!this.params.end) {
            this.endFieldIsDate = this.beginFieldIsDate;
            this.params.end = this.params.begin;
        }
    }

    getDatatagNames(event) {
        if (event.target.checked) {
            let query_type = {query_type: 'datatags'};
            let response =  this.lumiDataService.getDatatagNames(query_type);

            response.subscribe(data => {
                console.log('subscribe data');
                console.log(data);
                this.paramOptions.datatagnames = data['data'];
                this.params.datatagname = data['data'][0];
            }, error => {});
        }
       
    }

    // checkNormtags() {
    //     if (!this.paramOptionsShouldLoad.normtag) {
    //         return;
    //     }
    //     this.paramOptionsLoading.normtag = true;
    //     this.normtagService.getAllTags()
    //         .finally(() => {
    //             this.paramOptionsLoading.normtag = false;
    //             this.paramOptionsShouldLoad.normtag = false;
    //         })
    //             .subscribe((result) => this.paramOptions.normtag.data(result));
    // }

}
