import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { SettingComponent } from './setting/setting.component';
import { AppComponent } from './app.component';
import { MapsComponent } from './maps/maps.component';
const routes: Routes = [
  {path: 'registre', 
  component:SettingComponent},
  {
    path: 'mapa',
    component:MapsComponent,
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules, useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
