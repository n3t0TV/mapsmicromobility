import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { MaterialModule } from './material.module';
import { SettingComponent } from './setting/setting.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { RoutesComponent } from './routes/routes.component';

//Services
import { InformationService } from '../services/information.service';
import { MapsComponent } from './maps/maps.component';



@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    SettingComponent,
    RoutesComponent,
    MapsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    LeafletModule,
    HttpClientModule,
  ],
  providers: [InformationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
