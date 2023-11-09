import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoadComponent } from './components/road.component'
import { RoadRoutingModule } from './road-routing.module'


@NgModule({
  declarations: [
    RoadComponent
  ],
  imports: [
    CommonModule,
    RoadRoutingModule
  ]
})
export class RoadModule { }
