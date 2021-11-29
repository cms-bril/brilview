import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CompleterService } from 'ng2-completer';
import { NormtagService } from '../normtag.service';
import 'rxjs/add/operator/finally';

@Component({
    selector: 'bv-normtag-select',
    templateUrl: './normtag-select.component.html',
    styleUrls: ['./normtag-select.component.css']
})
export class NormtagSelectComponent implements OnInit {

    @Input('tagTypes') tagTypes: ('alltags' | 'normtags' | 'iovtags') = 'alltags';
    value: string;
    @Output('valueChange') valueChange = new EventEmitter<string>();
    @Output('blur') blur = new EventEmitter();
    @Output('focus') focus = new EventEmitter();

    shouldLoad = true;
    loading = false;
    normtags = undefined;


    constructor(
        protected normtagService: NormtagService,
        protected completerService: CompleterService) {
        this.normtags = completerService.local([]);
    }

    ngOnInit() {
    }

    onFocus() {
        this.focus.emit();
        if (!this.shouldLoad) {
            return;
        }
        let subs;
        if (this.tagTypes === 'iovtags') {
            subs = this.normtagService.getIOVTags();
        } else if (this.tagTypes === 'normtags') {
            subs = this.normtagService.getNormtags();
        } else if (this.tagTypes === 'alltags') {
            subs = this.normtagService.getAllTags();
        } else {
            return;
        }
        this.loading = true;
        console.log(this.tagTypes, subs);
        subs.finally(() => {
            this.loading = false;
            this.shouldLoad = false;
        })
            .subscribe((result) => this.normtags.data(result));
    }

    onBlur() {
        this.blur.emit();
    }

    onValueChange(event) {
        this.value = event;
        this.valueChange.emit(event);
    }

}
