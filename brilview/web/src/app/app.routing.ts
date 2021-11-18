import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { RouteNotFoundComponent } from './route-not-found/route-not-found.component';

const appRoutes: Routes = [{
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
}, {
    path: 'home',
    component: HomeComponent
}, {
    path: 'avglumi',
    redirectTo: 'totlumi',
    pathMatch: 'full'
}, {
    path: 'totlumi',
    loadChildren: () => import('app/lumi-inspector/lumi-inspector.module').then(m => m.LumiInspectorModule)
}, {
    path: 'bxlumi',
    loadChildren: () => import('app/bxlumi-inspector/bxlumi-inspector.module').then(m => m.BXLumiInspectorModule)
}, {
    path: '**', component: RouteNotFoundComponent
}];

export const AppRouting: ModuleWithProviders = RouterModule.forRoot(appRoutes);
