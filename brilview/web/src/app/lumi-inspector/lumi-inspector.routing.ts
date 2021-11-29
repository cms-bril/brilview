import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TotlumiComponent } from './totlumi/totlumi.component';
import { LiveBestlumiComponent } from './live-bestlumi/live-bestlumi.component';
import { AtlaslumiComponent } from './atlaslumi/atlaslumi.component';

const lumiInspectorRoutes: Routes = [
    { path: '', component: TotlumiComponent},
    { path: 'live-bestlumi', component: LiveBestlumiComponent},
    { path: 'atlaslumi', component: AtlaslumiComponent},
];

export const LumiInspectorRouting: ModuleWithProviders<any> = RouterModule.forChild(lumiInspectorRoutes);
