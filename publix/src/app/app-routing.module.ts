import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/trip',
        pathMatch: 'full'
      },
      {
        path: 'trip',
        loadChildren: () => import ('./road/road.module').then(m => m.RoadModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules, useHash: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
