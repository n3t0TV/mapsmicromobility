import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { InformationService } from 'src/services/information.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


const iconUrl = 'assets/pin_waypoint.png';
const conexiones = '../../assets/prueba.js' ;
const iconDefault = L.icon({

  iconUrl,
  iconSize: [15, 15],
  iconAnchor: [12, 30],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})


export class MapsComponent implements OnInit, AfterViewInit {
  @ViewChild('frameMap',{static: true}) frame : ElementRef | undefined; 

  [x: string]: any;
  private map! : any;
  Wvisible : boolean = false;

  googleHybrid! : any;
  googleStreets! : any;
  googleTraffic! : any;

  Datos! : any[];
  ID!  : number;
  lat! : number;
  lng! : number;
  pin! : any;
  hecho : boolean = false;
  titulo! : any;
  //Waypoints
  Waypoints! : any[];
  tempCircle : any;
  pointGroup = L.layerGroup();
  newpoints : any[] = [];
  pointId : any[] = [];
  ultimoid! : number;
  deleteid! : number;
  idlt! : number;
  //Cargar capa de Connections
  Connections! : any[];
  points! : any[];
  tempLine : any;
  coordenadas : any[] = [];
  lineGroup = L.layerGroup();
  relacionids : any[] = [];
  idt : any;
  idlt2! : any;
//Center point
  estacion! : any[];
  lt! : any;
  lg! : any;
//Generar nuevas conexiones
pointStart : any = 0;
pointEnd : any = 0;
originlat! : any[] ;
originlng! : any[] ;
destinationlat!: any[];
destinationlng!: any[];
resultConnection! : any[];
pointers : any[] = [];
objeto! : any;
//Grafo
starGraph : boolean = false;
endGraph : boolean = true;
src! : any;
//iframe

  constructor(private InfService : InformationService, private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {
    //this.GetEstaciones();
     // localStorage.setItem('idestacion', '1');
     
   }




    //Inicializa el mapa
    private initMap():void 
    {
     
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
      //this.map.on('keypress',(e: any)  => this.onMapKeypress(e));
     // this.map.on("mouseover", (e: any)  => this.onMouse(e));
      //this.map.on("contextmenu",(e: any)  => this.onMapContextMenu(e));
      
    }

    //Cambio de mapas
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
        maxZoom: 8
      });  
    }

    //Genera la lista de estaciones
    GetEstaciones()
    {
      this.InfService.getDatosEstaciones().subscribe((result : any) => 
      {
        this.Datos = result;
      });
    }

    //Evento del drop de estaciones
    GetValor(e : any)
    {
        this.ID = e.value;
        console.log(this.ID);
        let  registros = this.Datos.filter(dato =>{return dato.id === this.ID});
        this.lat = registros[0].latitud;
        this.lng = registros[0].longitud;
        this.titulo = registros[0].nombre + '</p>' +registros[0].direccion ;
        console.log(this.titulo );
    }

   //Obtiene los waypoints por estacion
  getWaypoints(idestacion : number)
  {
    let point1 : any[];
    let point2 : any[];
    let id = idestacion;
    let distanceMeters : any;
    let puntos : any[];
    let addConnection : any;
    let pointsString : any[];

    //Llamada de API para obtener los waypoints
    this.InfService.getWaypointId(id).subscribe((result : any)=>{
      this.Waypoints = result;

    //Recorre el array para agregarlos en el array del LayerGroup
      for (var i = 0; i<this.Waypoints.length; i++ )
      {
          let point = this.Waypoints[i];
          
            this.tempCircle = L.circleMarker([point.lat, point.lng],{
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.35,
            radius: 7
      }).addTo(this.pointGroup);

      //Agregar el layerGroup al mapa
      this.map.addLayer( this.pointGroup,{draggable: true});  
          
      //Habilitar el evento mouseover sobre la capa
      this.tempCircle.on('mouseover', (e: any)=>{
        let punto = e.target;
        this.idlt= punto._leaflet_id;
        let coordenadas = punto.getLatLng();
        let lat = coordenadas.lat;
        let lng = coordenadas.lng;
        console.log(coordenadas);
        let valor : any;
        valor = this.Waypoints.filter(p => p.lat == lat && p.lng == lng);
        this.deleteid = valor[0].id;
        console.log(this.deleteid);
      this.map.on('keypress',(e: any)  => this.onMapKeypress(e));
      });


     //Habiliatar el evento del menu contextual(clic derecho)
     this.tempCircle.on('contextmenu',(e : any) =>{ 
                    
            let punto = e.target;
            let coordenadas = punto.getLatLng();
            let lat = coordenadas.lat;
            let lng = coordenadas.lng;
            let valor : any;
            valor = this.Waypoints.filter(p => p.lat == lat && p.lng == lng);
            let id = valor[0].id;
            if(this.pointStart == 0)
            {
              this.pointStart = id;
              console.log("start",this.pointStart)
            }
            else
            {
              this.pointEnd = id;
              console.log("end", this.pointEnd); 
            }
            if(this.pointStart != 0 && this.pointEnd != 0)
            {
              point1 = this.Waypoints.filter(p => p.id == this.pointStart);
              point2 = this.Waypoints.filter(p => p.id == this.pointEnd);
              this.originlat = point1[0].lat;
              this.originlng = point1[0].lng;
              this.destinationlat = point2[0].lat;
              this.destinationlng = point2[0].lng;
              puntos = [];
              this.InfService.getNewConnection(this.originlat,this.originlng,this.destinationlat,this.destinationlng).subscribe((result : any)=>{
                this.objeto = "new";
                this.resultConnection = result;
                let distancia = result.distance;
                distanceMeters = distancia.replace('m', '').replace('k','');
                this.pointers = result.points;
                pointsString = result.points;
                let idBegin = this.pointStart;
                let idEnd = this.pointEnd;
                addConnection = { idBegin, idEnd, distanceMeters, pointsString};
              this.InfService.insertConnection(addConnection).subscribe((result : any)=>{
                  console.log(result);
                  this.clearconecction();
                })
                this.pointStart = 0;
                this.pointEnd = 0;
              });
            }
            
          }); 


      }
    });

  }

//Obtener las conexiones
  getConnection(id : number)
  {

    this.InfService.getConecction(id).subscribe((result : any)=>{
      this.Connections = result;
      for(var i = 0; i<this.Connections.length; i++)
      {
        this.idt = this.Connections[i].id;
        this.points = this.Connections[i].puntos;
        this.coordenadas = [];
          for(var j = 0; j<this.points.length; j++)
        {
          this.coordenadas.push([this.points[j].lat,this.points[j].lng]);
          
        }
        this.tempLine = L.polyline(this.coordenadas,{color: 'red', fillColor: 'red', weight:5}).addTo(this.lineGroup);
        this.idlt2 = this.tempLine._leaflet_id;
        this.relacionids.push({"idt": this.idt, "idlt": this.idlt});
        this.map.addLayer( this.lineGroup,{draggable: true}); 
        
        
        this.tempLine.on('click',(e : any) =>{          
          let punto = e.target;
          let valor  = this.relacionids.filter(p => p.idlt == punto._leaflet_id );
          let idconexion = valor[0].idt;
          console.log(idconexion);
          this.InfService.deleteConnection(idconexion).subscribe((result : any)=>{
            console.log(result);
            this.lineGroup.removeLayer(valor[0].idlt);
          });
          
        });
      }

    });
  }

  //Evento click en mapa
  onMapClick(e : any) {
    let point : any;
          //Waypoints 
          this.tempCircle = L.circleMarker([e.latlng.lat, e.latlng.lng],{
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.35,
            radius: 7
          }).addTo(this.pointGroup);
          this.map.addLayer(this.pointGroup);
          console.log(this.ID);
          this.newpoints.push(this.tempCircle._leaflet_id);
          let lat = e.latlng.lat;
          let lng = e.latlng.lng;
          point = {lat, lng};
          this.InfService.saveWaypoint(point).subscribe((result : any)=>{
            console.log(result);
            this.relateestacion();
            this.clearwaypoint();
          });
          
          

  }

  //Relaciona estacion con waypoint
  relateestacion()
  {
    let relacion : any;
    this.InfService.lastid().subscribe((result : any)=>{
      this.pointId = result;
      let estacion = this.ID;
      let fecha = new Date;
      let waypoint = this.pointId[0].id;
      relacion = {fecha, estacion, waypoint};
      console.log(relacion);
      this.saverelacion(relacion);
      this.clearwaypoint();
    });
   
  }

  //Inserta la relacion 
  saverelacion(relacion : any)
  {
    this.InfService.relacionawaypoint(relacion).subscribe((result : any)=>{
      console.log(result);
    });
  }

  onMapKeypress(e : any)
  {
    let letra = e.originalEvent.key;
    if(letra == 'd' || letra =='D')
    {
      console.log("Delete");
      this.deleteWaypointStation(this.deleteid);
      this.deleteWaypointsConnections(this.deleteid);
      this.deleteWaypoints(this.deleteid);
      if (this.map.hasLayer(this.pointGroup))this.pointGroup.removeLayer(this.idlt);
    }
      
  }
clearwaypoint()
{
  if (this.map.hasLayer(this.pointGroup)) this.map.removeLayer(this.pointGroup);
  this.getWaypoints(this.ID);
}

clearconecction()
{
  if (this.map.hasLayer(this.lineGroup)) this.map.removeLayer(this.lineGroup);
  this.getConnection(this.ID);
}

  //Centrar el mapa en la ubicacion
  CenterEstacion(e : any)
  {

  let marcador = L.icon({
    iconUrl : 'assets/pin_marker.png',
    iconSize: [45, 50],
    popupAnchor:  [-3, -76]
  });
  

    let id = this.ID;
    console.log(id);
    if(id == undefined)
  {
      console.log(id);
  }
  else
  {
    
    this.InfService.getEstacionesByID(id).subscribe((result : any)=>
    {
        this.estacion = result;
        this.lt = parseFloat(this.estacion[0].lat).toFixed(7);
        this.lg = parseFloat(this.estacion[0].lng).toFixed(7);
        console.log(this.lg, this.lt);
        this.map.flyTo([this.lt, this.lg], 15);
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
    this.getWaypoints(this.ID);
    this.getConnection(this.ID);
    this.starGraph = true;
    this.endGraph = false;

  }
  
  }

prueba()
{
  this.InfService.getHost();
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
    this.clearwaypoint();
  });
}

ready() {
  //let element = (document.getElementById('frameMapa') as HTMLImageElement);//.src =window.location.hostname +":4000"+ "/connections.html";
  
  //let id = (localStorage.getItem('idestacion')); 
  this.src = window.location.hostname +":4000"+ "/connections.html";
  
}

  ngOnInit(): void {
    this.src =window.location.hostname +":4000"+ "/connections.html";
  }

  ngAfterViewInit() : void {
    this.initMap();
   //this.map.fitWorld();
   this.LocateUser();
   //this.ready();
   
  }
}
