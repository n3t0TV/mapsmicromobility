import { Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import { MatOption } from '@angular/material/core/option/option';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import * as L from 'leaflet';
import { InformationService } from '../../services/information.service';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';
import { AnimationDurations } from '@angular/material/core';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";
import { InformationModel } from "src/models/information.model";







export interface CoordenadasPoint {
  Latitud: number;
  Longitud : number;
}

const ELEMENT_DATA : CoordenadasPoint[] = [];

const Estacion_element : InformationModel[] = [];

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})

export class SettingComponent implements OnInit, AfterViewInit {
  [x: string]: any;

  @ViewChild('matRef', { static: false }) matRef!: MatSelect;
  @ViewChild('matStation', { static: false }) matStation!: MatSelect;
  @ViewChild(MatTable) table!: MatTable<CoordenadasPoint>;
  @ViewChild('EditTabla', {static: false}) editTabla! : MatTable<InformationModel>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
 

  private map! : any;
  googleHybrid! : any;
  googleStreets! : any;
  googleTraffic! : any;
  hecho : boolean = false;
  pin! : any;
  lt! : any;
  lg! : any;
  vStation: boolean = true;
  vDatos : boolean = true;
  vStationEdit : boolean = true;
  estacion! : any[];
  Datos! : any[];
  tipo! : number;
  id : number = 0;
  //Value de formularios
  latitud : any = null;
  longitud : any = null;
  SoloLectura : boolean = false; //bloquear los componentes de lat y long
  point! : any; //Capa de mapa
  leaftletid! : number; //Id de la capa del marker
  renderobject : any;
  nombre! : string ; //Nombre de la estacion
  direccion! : string ; //Direccion de la estacion
  displayedColumns: string[]=['Latitud', 'Longitud', 'Action'];
  markers = new MatTableDataSource<CoordenadasPoint>(ELEMENT_DATA) ;//Array para almacenar las coordenadas generadas en mapa
  estaciones =  new MatTableDataSource<InformationModel>(Estacion_element); //Array para visualizar las estaciones
  estacionesColumns : string[]=['Nombre', 'Actions'];
  length! : number;
  pin_id : any[] = [];
  markerGroup = L.layerGroup(); 
  pointGroup = L.layerGroup();
  punto : any[] = [];
  marker! : any;
  objeto! : any;
  estacionid! : number; //Id de la estación a asociar con los waypoints
  ids: any[] = []; //Array de los waypoints insertados
  position! : any; //Nueva posición del pin de estaciones
  new_marker : any; //Nuevo pin en mapa de la estación
  vliststation : boolean = false; //Visible div lista estaciones en edición
  vStationEditForm : boolean = true; //Visible formulario de validación
  vStationDelete : boolean = true; //Visible lista para eliminar estaciones
  //variables en el formulario de actualización de las estaciones
  eNombre! : string;
  edireccion! : string;
  elatitud! : any;
  elongitud! : any;
  eid! : number;
  geografico! : any;
  //variables para eliminar relacion waypoints y estacion
  statuseliminar : any;
//Variables para obtener los waypoints
  Waypoints! : any[];
  vWaypointEdit : boolean = true;
  tempCircle : any;
  

  constructor(private InfService : InformationService, private mensaje : MatSnackBar, private matIconRegistry : MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.getDatosEstaciones();
    this.matIconRegistry.addSvgIcon(
      "add-point",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/waypoints.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "edit-point",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/waypoints_edit.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "edit-station",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/station-edit.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "add-station",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/station-add.svg")
    );
   }

   private configSucces : MatSnackBarConfig = 
   {
     panelClass:'green-snackbar',
     duration: 8 * 1000,
     horizontalPosition: 'center',
     verticalPosition: 'bottom'
   }
   private configError : MatSnackBarConfig =
   {
     panelClass: "red-snackbar",
     duration: 8 * 1000,
     horizontalPosition: 'center',
     verticalPosition: 'bottom'
   }

  //Inicializa el mapa
   private initMap():void 
   {
    
     /*var MapBase = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
     var Attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
     let Base = new L.TileLayer(MapBase,{maxZoom: 20, attribution: Attribution});
     this.map = new L.Map('map').addLayer(Base);*/


      //Crear mapa hibrido
     this.googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
       });

       //Crear mapa street
     this.googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
      maxZoom: 25,
      subdomains:['mt0','mt1','mt2','mt3']
      });

      //Crear mapa trafic
      this.googleTraffic = L.tileLayer('https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        minZoom: 2,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });

    this.map = new L.Map('map').addLayer(this.googleHybrid);



      this.map.on("click", (e: any)  => this.onMapClick(e));
    
     
   }

   
   //Cambia el tipo de mapa
   cambia(e: any)
   {
      let valor = e.value;
      if(valor == 1)
      {
        this.map.removeLayer(this.googleStreets);
        this.map.removeLayer(this.googleTraffic);
        this.map.addLayer(this.googleHybrid);
      }
      if (valor == 2)
      {
        this.map.removeLayer(this.googleHybrid);
        this.map.removeLayer(this.googleTraffic);
        this.map.addLayer(this.googleStreets);
      }
      if(valor == 3)
      {
        this.map.removeLayer(this.googleHybrid);
        this.map.addLayer(this.googleTraffic);
        this.map.removeLayer(this.googleStreets);
      }
   }
   
   //Obten la ubicación actual
   LocateUser(){
     this.map.locate({
       enableHighAccuracy: true,
       setView: true,
       maxZoom: 10
     });  
   }
 

   //Visualiza formulario estaciones
   ViewEstaciones()
   {
    this.vStation = true;
    this.vStationEdit = true;
    this.vDatos = false;
    this.vStationDelete = true;
    this.vWaypointEdit = true;
    this.objeto = "estaciones";
    this.clear();
    console.log(this.objeto);
   }

   //Visualiza Waypoints
   ViewPoints()
   {
    this.getDatosEstaciones();
    this.vStation = false;
    this.vStationEdit = true;
    this.vDatos = true;
    this.vStationDelete = true;
    this.vWaypointEdit = true;
    this.objeto = "waypoints";
    this.clear();
    console.log(this.objeto);
   }

   //Visualiza la edicion de las estaciones
   ViewEditEstacion()
   {
    this.getDatosEstaciones();
    this.vStation = true;
    this.vStationEdit = false;
    this.vDatos = true;
    this.vStationDelete = true;
    this.vWaypointEdit = true;
    this.objeto = "estaciones_e";
    this.clear();
    console.log(this.objeto);
   }

   //Visualiza la eliminacion de las estaciones
   viewDeleteEstaciones()
   {
    this.getDatosEstaciones();
    this.vStation = true;
    this.vStationEdit = true;
    this.vDatos = true;
    this.vStationDelete = false;
    this.vWaypointEdit = true;
    this.objeto = "estaciones_d";
    this.clear();
    console.log(this.objeto);
   }

   //Visualiza eliminacion de waypoints
   viewDeletePoints()
   {
      this.getDatosEstaciones();
      this.vStation = true;
      this.vStationEdit = true;
      this.vDatos = true;
      this.vStationDelete = true;
      this.vWaypointEdit = false;
      this.objeto = "waypoint_e";
      this.clear();
      console.log(this.objeto);     
   }

   //Limpia formulario
   clear()
   {
     //Waypoints
     if(this.vDatos == true)
     {
        this.map.removeLayer(this.markerGroup);
        this.markerGroup.clearLayers();
        let l = this.markers.data.length;
        this.markers.data.splice(0, l);
        this.table.renderRows();
        this.markers.paginator = this.paginator;
        this.matRef.options.forEach((data: MatOption) => data.deselect());
        if (this.map.hasLayer(this.pin)) this.map.removeLayer(this.pin);
        if (this.map.hasLayer(this.marker)) this.map.removeLayer(this.marker);
        if (this.map.hasLayer(this.pointGroup)) this.map.removeLayer(this.pointGroup);
       this.pointGroup.clearLayers();
     }

     //Edit waypoints
     if(this.vWaypointEdit == true)
     {
      this.matStation.options.forEach((data: MatOption) => data.deselect());
      if (this.map.hasLayer(this.pin)) this.map.removeLayer(this.pin);
      if (this.map.hasLayer(this.marker)) this.map.removeLayer(this.marker);
      if (this.map.hasLayer(this.pointGroup)) this.map.removeLayer(this.pointGroup);
     this.pointGroup.clearLayers();
     }
     //Estaciones
     if(this.vStation == true)
     {
      this.latitud = null;
      this.longitud = null;
      this.nombre = "";
      this.direccion = "";
      if (this.map.hasLayer(this.pin)) this.map.removeLayer(this.pin);
      if (this.map.hasLayer(this.marker)) this.map.removeLayer(this.marker);
      if (this.map.hasLayer(this.pointGroup)) this.map.removeLayer(this.pointGroup);
     this.pointGroup.clearLayers();
     }

     //EditEstaciones
     if(this.vStationEditForm == true)
     {
       this.elatitud = null;
       this.elongitud = null;
       this.edireccion = "";
       this.eNombre = "";
       if (this.map.hasLayer(this.pin)) this.map.removeLayer(this.pin);
       if (this.map.hasLayer(this.marker)) this.map.removeLayer(this.marker);
       if (this.map.hasLayer(this.pointGroup)) this.map.removeLayer(this.pointGroup);
      this.pointGroup.clearLayers();     
     }
    
   }


   //Elimina marker especifico
   DeleteMarker(e:any)
   {
     if(this.objeto=="waypoints")
     {
        console.log("agrega");
        let index : any = 0;
        let elemento = this.markers.data.findIndex(p => p.Latitud == e.Latitud && p.Longitud == e.Longitud);
        let dato = this.punto[elemento];
        if(elemento != 0){
          index = elemento;
        }
        
        let cantidad = 1;
        //console.log("dato:", dato, "index:", index, "elemento:", elemento);
        this.markerGroup.removeLayer(dato);
        this.markers.data.splice(index,cantidad);
        this.punto.splice(index,cantidad);
        this.table.renderRows();
        this.markers.paginator = this.paginator;
     }

   }

   
   //Evento click para generar objetos en mapa
   onMapClick(e : any) {

        //Waypoints
        if(this.objeto == "waypoints")
        {  
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;
        let lm = parseFloat(lat).toFixed(7);
        let lnm = parseFloat(lng).toFixed(7);
        let marcador : any;
        marcador = L.marker([parseFloat(lm), parseFloat(lnm)]);
        marcador.addTo(this.markerGroup);
        this.punto.push(marcador._leaflet_id);
        ELEMENT_DATA.push({'Latitud': parseFloat(lm), 'Longitud': parseFloat(lnm)});
        this.table.renderRows();
        this.markers.paginator = this.paginator; 
        this.map.addLayer(this.markerGroup);
        //console.log(this.punto);
        }

        //Estaciones
        
        if(this.objeto == "estaciones")
        {

          let marcador = L.icon({
            iconUrl : 'assets/pin_marker.png',
            iconSize: [45, 50],
            popupAnchor:  [-3, -76]
          });

          this.latitud = parseFloat(e.latlng.lat).toFixed(7);
          this.longitud =  parseFloat( e.latlng.lng).toFixed(7);
          let lm = parseFloat(this.latitud).toFixed(7);
          let lnm = parseFloat(this.longitud).toFixed(7);
          this.marker = L.marker([parseFloat(lm), parseFloat(lnm)], {icon: marcador});
          this.map.addLayer(this.marker);
        }


}


 //Obten datos generales de estaciones
 getDatosEstaciones()
 {
   this.InfService.getDatosEstaciones().subscribe((result : any) => 
     {
       this.Datos = result;
       console.log(result);
       this.estaciones = result;
     });
 }
 

//Centrar el mapa en la ubicacion
 CenterEstacion(e : any)
 {

  let marcador = L.icon({
    iconUrl : 'assets/pin_marker.png',
    iconSize: [45, 50],
    popupAnchor:  [-3, -76]
  });
  

   let id = e.value;
   console.log(id);
   if(id == undefined)
  {
      console.log(id);
  }
  else
  {
    this.estacionid = e.value;
    this.InfService.getEstacionesByID(id).subscribe((result : any)=>
    {
        this.estacion = result;
        this.lt = parseFloat(this.estacion[0].lat).toFixed(7);
        this.lg = parseFloat(this.estacion[0].lng).toFixed(7);
        console.log(this.lg, this.lt);
        this.map.flyTo([this.lt, this.lg], 20);
        if(this.hecho == true)
        {
          console.log(this.hecho);
         this.map.removeLayer(this.pin);
         this.hecho = false;
        }
        this.pin = new L.Marker([this.lt, this.lg], {icon: marcador});
        this.map.addLayer(this.pin);
        this.hecho = true;
        
    });

    if(this.objeto =="waypoint_e")
    {
      if (this.map.hasLayer(this.pointGroup)) this.map.removeLayer(this.pointGroup);
      this.getWaypoints(this.estacionid);
    }
  }
  
 }

 //Inserta estacion
 InsertEstacion(estacion : any)
  {
    
   if(this.objeto == "estaciones")
   {
      if(this.nombre == null || this.direccion== null || this.latitud == null|| this.longitud == null)
      {
        let message = "Todos los datos son obligatorios";
        this.mensaje.open(message, '', this.configError);
      }
      else
      {
        let nom = this.nombre;
        let largo = this.Datos.length -1;
        let storeid = (this.Datos[largo].id) + 1;
        let direccion = this.direccion;
        let geografico = "st_PointFromText('POINT(" + this.longitud + " " + this.latitud +  ")',4326)";
        let lat = this.latitud;
        let lng = this.longitud;
        estacion = {nom, storeid, direccion, geografico, lat, lng};
        let result = this.InfService.saveEstaciones(estacion).subscribe((result : any) =>{
          let mensaje = result.message;
          this.mensaje.open(mensaje, '', this.configSucces);
          this.clear();
        });
      }
   }

 }

 //Insertar waypoints
 InsertWaypoints (point : any)
 {
   
  if(this.objeto =="waypoints")
  {
    if(this.estacionid == null || this.markers.data.length == null)
    {
      console.log(this.estacionid, this.markers.data.length);
      let message = "Datos faltantes";
      this.mensaje.open(message,'',this.configError);
    }
  
    for(var i = 0; i< this.markers.data.length; i++)
    {
           
        let dato = this.markers.data[i];
        let lat = dato.Latitud;
        let lng = dato.Longitud;
        point = {lat, lng};
        this.InfService.saveWaypoint(point).subscribe((result : any) =>{
        });
    }

    let total = this.markers.data.length;
    console.log(total);
    this.InfService.retornaid(total).subscribe((result : any) => {
      this.ids = result;
      this.relateestacion(this.bind);
    });
  
  }
 }

//relaciona estacion y waypoints
relateestacion(relacion : any)
{
  for (var i = 0; i< this.ids.length; i++)
  {
    let estacion = this.estacionid;
    let waypoint = this.ids[i].id;
    let fecha = new Date;
    relacion = {fecha, estacion, waypoint};
    let result = this.InfService.relacionawaypoint(relacion).subscribe((result : any) =>{
      let mensaje = result.message;
      this.mensaje.open(mensaje, '', this.configSucces);
      this.clear();
    });
  }
}


//click sobre la fila y mover el pin
getRecord(e : any)
{
  console.log(e);
  let rowlat = e.latitud;
  let rowlng = e.longitud;
 
        //Asigna valores
        this.eNombre = e.nombre;
        this.elatitud = e.latitud;
        this.elongitud = e.longitud;
        this.edireccion = e.direccion;
        this.geografico = e.geografico;
        this.estacionid = e.id;
  let marcador = L.icon({
    iconUrl : 'assets/pin_marker.png',
    iconSize: [45, 50],
    popupAnchor:  [-3, -76] 
  });
  
  this.map.flyTo([rowlat, rowlng], 20);
        if(this.hecho == true)
        {
          console.log(this.geografico);
         this.map.removeLayer(this.pin);
         this.hecho = false;
        }
        this.pin = new L.Marker([rowlat, rowlng], {icon: marcador, draggable: true});
        this.map.addLayer(this.pin);
        this.hecho = true;
        
        this.pin.on('drag', (e : any) =>{
          this.new_marker = e.target;
          this.position = this.new_marker.getLatLng();
          ;
          this.elongitud = this.position.lng;
         this.elatitud = this.position.lat;

        });
        
        this.vliststation = true;
        this.vStationEditForm = false;
}

//Obtiene los waypoints por estacion
getWaypoints(idestacion : number)
{


  let id = idestacion;
  this.InfService.getWaypointId(id).subscribe((result : any)=>{
    this.Waypoints = result;
    for (var i = 0; i<this.Waypoints.length; i++ )
    {
        let point = this.Waypoints[i];
        
          this.tempCircle = L.circleMarker([point.lat, point.lng],{
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.35,
           radius: 5
        }).addTo(this.pointGroup);
        //console.log(this.tempCircle._leaflet_id);
        this.map.addLayer( this.pointGroup,{draggable: true});  

        this.tempCircle.on('click',(e : any) =>{          
          let punto = e.target;
          let idlt= punto._leaflet_id;
          let coordenadas = punto.getLatLng();
          let lat = coordenadas.lat;
          let lng = coordenadas.lng;
          let valor : any;
          valor = this.Waypoints.filter(p => p.lat == lat && p.lng == lng);
          let id = valor[0].id;
          this.deleteWaypointsConnections(id);
          this.deleteWaypointStation(id);
          this.deleteWaypoints(id);
          this.pointGroup.removeLayer(idlt);
        });

   
    }
  });


}

//Elimina relaciones
deleteWaypointsConnections(id: number)
{
  this.InfService.deleteWaypointConnection(id).subscribe((result : any) =>{
    console.log(result);
  });
}

deleteWaypointStation(id: number)
{
  this.InfService.deleteWaypointEstacion(id).subscribe((result : any) =>{
    console.log(result);
  });
}

deleteWaypoints(id : number)
{
  this.InfService.deleteWaypoint(id).subscribe((result : any) =>{
    console.log(result);
  });
}

//Retroceso para las estaciones
gotoEstationCancel()
{
  this.clear();
  this.ViewEditEstacion();
  this.vliststation = false;
  this.vStationEditForm = true;
}

//Actualiza estacion
updataestacion(estacion : any)
{
  let nombre = this.eNombre;
  let latitud =this.elatitud; 
  let longitud = this.elongitud;
  let direccion =this.edireccion;
  let coordenadas = "st_PointFromText('POINT(" + this.elongitud + " " + this.elatitud +  ")',4326)";
  let id = this.estacionid;
    estacion = {id, nombre, direccion, coordenadas, latitud, longitud};
    this.InfService.updateestacion(estacion).subscribe((result : any) =>{
      let mensaje = result.message;
      this.mensaje.open(mensaje, '', this.configSucces);
    });
} 
//Elimina relacion estacion y waypoins
deletewaypointestacion(e : any)
{
  let id = e.id;
  this.InfService.deleterealacionestacion(id).subscribe((result : any) =>{
    let mensaje = result.message;
    if (result.status == 200)
    {
      this.mensaje.open(mensaje, '', this.configSucces);
      this.deleteestacion(id);
    }

  });

}

//Elimina estaciones
deleteestacion (id : number)
{
  console.log(id);
  this.InfService.deleteestacion(id).subscribe((result : any) =>{
    let mensaje = result.message;
    if (result.status == 200)
    {
      this.mensaje.open(mensaje, '', this.configSucces);
    }

  });
}

//ejecuta los inserts
ejecutainsert()
{
 if(this.objeto == "estaciones")
 {
   this.InsertEstacion(this.bind);
 }
 if(this.objeto =="waypoints")
 {
   this.InsertWaypoints(this.bind);
 
 }
}

  ngAfterViewInit(): void {


 
   
  }

  ngOnInit(): void {
    
    this.initMap();
    this.LocateUser();
  }

}



