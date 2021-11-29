import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'bv-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

    @Input() status: string;
    @Input() message: string;
    @Input() overrideStatusClass: string | boolean;

    constructor() { }

    ngOnInit() {
    }

    getStatusClass() {
        if (this.overrideStatusClass) {
            return this.overrideStatusClass;
        } else if (this.status) {
            const status = this.status.toUpperCase();
            if (status === 'OK' || status === 'SUCCESS') {
                return 'success';
            } else if (status === 'ERROR' || status === 'FAIL') {
                return 'danger';
            }
        }
        return 'info';
    }
}
