import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Ng2CompleterModule } from 'ng2-completer';
import { ProgressComponent } from './progress/progress.component';
import { StatusComponent } from './status/status.component';
import { CacheTableComponent } from './cache-table/cache-table.component';
import { ChartStatsComponent } from './chart-stats/chart-stats.component';
import { NormtagSelectComponent } from './normtag-select/normtag-select.component';
import { CompleterPatchDirective } from '../utils/completer-patch.directive';
import { NormtagService } from './normtag.service';

@NgModule({
    imports: [
        CommonModule,
        ClarityModule,
        FormsModule,
        Ng2CompleterModule,
    ],
    declarations: [
        ProgressComponent,
        StatusComponent,
        CacheTableComponent,
        ChartStatsComponent,
        NormtagSelectComponent,
        CompleterPatchDirective
    ],
    exports: [
        ProgressComponent,
        StatusComponent,
        CacheTableComponent,
        ChartStatsComponent,
        NormtagSelectComponent
    ],
    providers: [
        NormtagService
    ]
})
export class SharedModule { }
