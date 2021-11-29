import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
//import { NguiDatetimePickerModule } from '@ngui/datetime-picker';
import { AlertsModule } from '../alerts/alerts.module';
import { LumiInspectorRouting } from './lumi-inspector.routing';
import { LumiDataService } from './data.service';
import { LiveLumiDataService } from './live-lumi-data.service';
import { AtlaslumiDataService } from './atlaslumi-data.service';
import { SharedModule } from '../shared/shared.module';

import { FormComponent as TotlumiFormComponent } from './totlumi/form/form.component';
import { TotlumiComponent } from './totlumi/totlumi.component';
import { ChartsComponent } from './totlumi/charts/charts.component';
import { StorageComponent } from './storage/storage.component';
import { ChartComponent } from './chart/chart.component';
import { LumiChartComponent } from './totlumi/charts/lumi-chart/lumi-chart.component';
import { CumulativeChartComponent } from './totlumi/charts/cumulative-chart/cumulative-chart.component';
import { RatioChartComponent } from './totlumi/charts/ratio-chart/ratio-chart.component';
import { PileupChartComponent } from './totlumi/charts/pileup-chart/pileup-chart.component';
import { LiveBestlumiComponent } from './live-bestlumi/live-bestlumi.component';
import { AtlaslumiComponent } from './atlaslumi/atlaslumi.component';
import { FormComponent as AtlaslumiFormComponent } from './atlaslumi/form/form.component';


@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        LumiInspectorRouting,
        AlertsModule,
        ClarityModule,
  //      NguiDatetimePickerModule,
        SharedModule
    ],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
        TotlumiFormComponent,
        AtlaslumiFormComponent,
        TotlumiComponent,
        ChartsComponent,
        StorageComponent,
        ChartComponent,
        ChartComponent,
        LumiChartComponent,
        CumulativeChartComponent,
        RatioChartComponent,
        PileupChartComponent,
        LiveBestlumiComponent,
        AtlaslumiComponent
    ],
    providers: [
        LumiDataService,
        LiveLumiDataService,
        AtlaslumiDataService
    ]
})
export class LumiInspectorModule { }
