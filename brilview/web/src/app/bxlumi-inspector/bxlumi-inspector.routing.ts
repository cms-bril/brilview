import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BXLumiInspectorComponent } from './bxlumi-inspector.component';

const bxlumiInspectorRoutes: Routes = [
    { path: '', component: BXLumiInspectorComponent},
];

export const BXLumiInspectorRouting: ModuleWithProviders <any> = RouterModule.forChild(bxlumiInspectorRoutes);
