import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MarkerService {
    baseUrl = environment.base.apiUrl + '/layers/waypoints.geojson';

  constructor(private http: HttpClient) { }

  makePointsMarkers(map: L.Map): void {
    this.http.get(this.baseUrl).subscribe((res: any) => {
        for (const c of res.features) {
          const lon = c.geometry.coordinates[1];
          const lat = c.geometry.coordinates[0];
          const marker = L.marker([lat, lon]);
  
          marker.addTo(map);
          console.log(c.geometry.coordinates);
        }
      });
   }
}