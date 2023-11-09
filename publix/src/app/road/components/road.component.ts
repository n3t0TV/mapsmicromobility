import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as geojson from 'geojson';
import * as turf from '@turf/turf';

@Component({
  selector: 'app-road',
  templateUrl: './road.component.html',
  styleUrls: ['./road.component.css']
})
export class RoadComponent implements OnInit {
  private map! : any;
  stores! : any[];
  vehicles! : any[];
  houses! : any[];
  LayerStores! : any;
  constructor() { }



  private initMap(): void
  {
    let lat = 33.731855;
    let lng = -84.3823628;
  
  
    //Mapas base
    var baseLayers = {
      'Satelite' : L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
          maxZoom: 22,
          subdomains:['mt0','mt1','mt2','mt3']
           }),
      'Street':  L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
          maxZoom: 22,
          subdomains:['mt0','mt1','mt2','mt3']
          })
    };
     //Genera el mapa
     this.map = L.map('map',{
      center : [lat, lng],
      zoom: 10,
      layers: [baseLayers.Satelite]
  });
    var controlLayerOptions = {position : 'topleft'};

      //Agregar el control de capas al mapa
  L.control.layers(baseLayers).addTo(this.map);

  //Agregar el control de escala al mapa
  L.control.scale({position: 'topright', maxWidth: 100, metric: true, imperial: false}).addTo(this.map);

this.stores = [
turf.point([-84.3884205 , 33.7802477],{"store": "950 W. Peachtree St, Atlanta"}),
turf.point([-84.5083402 , 33.7249784],{"store": "3695 Cascade Rd, Atlanta"}),
turf.point([-84.381632 , 33.7698002],{"store": "595 Piedmont Ave NE, Atlanta"}),
turf.point([-84.6685333 , 33.7334332],{"store": "2675 Lee Rd, Lithia Springs"}),
turf.point([-84.5045192 , 33.8433943],{"store":"4480 S Cobb Dr SE, Smyrna"})
]


this.vehicles = [
  turf.point([-84.4075408, 33.7817359],{"vehicle": "992 Hampton St, Atlanta"}),
  turf.point ([-84.4953032, 33.7216373],{"vehicle": "3288 Cascade Rd, Atlanta"}),
  turf.point ([-84.3958444, 33.7689611],{"vehicle": "523 Luckie St. NW, Atlanta"}),
  turf.point ([-84.647444, 33.7095533],{"vehicle": "2170 Riverside Pkwy, Douglasville"}),
  turf.point ([-84.5342564, 33.8417077],{"vehicle": "4300 Jameson Ln, Smyrna"}),
  turf.point ([-84.4056966, 33.7769987],{"vehicle": "501 6th St NW, Atlanta"}),
  turf.point ([-84.5206473, 33.7079703],{"vehicle": "4024 Melvin Dr SW, Atlanta"}),
  turf.point ([-84.4050689, 33.7695441],{"vehicle": "548 Northside Dr NW, Atlanta"}),
  turf.point ([-84.7014507, 33.7470598],{"vehicle": "2111 Hwy 92, Douglasville"}),
  turf.point ([-84.5311015, 33.873367], {"vehicle": "3300 S Cobb Dr SE, Smyrna"})

]


this.houses = [
turf.point([-84.4265573, 33.7827916],	{"adress": "1195 Niles Ave NW, Atlanta"}),
turf.point([-84.4780294,	33.7236411],	{"adress": "2735 Veltre Terrace SW, Atlanta"}),
turf.point([-84.4131165,	33.7599892],	{"adress": "783 Spencer St NW, Atlanta"}),
turf.point([-84.5972339,	33.7302341],	{"adress": "9087 Hanover St, Lithia Springs"}),
turf.point([-84.5394987,	33.8280416],	{"adress": "5170 Fawn Trail, Mableton"}), 
turf.point([-84.424178,	33.7736566],	{"adress": "697 Law St NW, Atlanta"}),
turf.point([-84.5372253,	33.6928743],	{"adress": "4565 Santa Fe Trail SW, Atlanta"}),
turf.point([-84.4219477,	33.7723724],	{"adress": "643 Finley Ave NW, Atlanta"}),
turf.point([-84.7182154,	33.7417845],	{"adress": "8726 Danley Dr, Douglasville"}),
turf.point([-84.5589157,	33.8587405],	{"adress": "88 Geraldine Dr SE, Smyrna"})
]

let points = turf.featureCollection(this.stores);

let v = turf.featureCollection(this.vehicles);

let h = turf.featureCollection(this.houses);


var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "red",
  color: "red",
  weight: 1,
  opacity: 1,
  fillOpacity: 1
};


var geojsonVehiclesOptions = {
  radius: 8,
  fillColor: "orange",
  color: "orange",
  weight: 1,
  opacity: 1,
  fillOpacity: 1
};

var geojsonHousesOptions = {
  radius: 8,
  fillColor: "#0C9EF2",
  color: "#0C9EF2",
  weight: 1,
  opacity: 1,
  fillOpacity: 1
};


L.geoJSON(points, {
  pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup(feature.properties.store);
  }
}).addTo(this.map);

L.geoJSON(v, {
  pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonVehiclesOptions).bindPopup(feature.properties.vehicle);
  }
}).addTo(this.map);

L.geoJSON(h, {
  pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonHousesOptions).bindPopup(feature.properties.adress);
  }
}).addTo(this.map);



}  

  ngOnInit(): void {

    this.initMap();
  }

}
