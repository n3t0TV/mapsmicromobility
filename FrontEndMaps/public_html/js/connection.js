

var idEst = 1

const centerMap = { lat: 37.41361589, lng: -122.07342005 }
var coordMap = { lat: 37.41361589, lng: -122.07342005}
var mapContainer = new LeafContainer()

const host = window.location.host
var numClick = 0
var keyPressed = null
var estaciones = []
var hybridMap
var streetMap
var trafficMap
var mapStyle = 0
var map = null
var marker = null
var connect = 1;
var color, pulsecolor;
var control0 = null;
var type = null;
var buffered  = null;
const select = document.getElementById('conecctions');
const ventana = document.getElementById('ventanaModal');
var start = document.getElementsByName('start');
var end = document.getElementsByName('end');
var fin = document.getElementsByName('fin');
var coordenada = document.getElementById('coordenadas');
const btn = document.getElementsByName('conexiones');
const tipomarker = document.getElementsByName('select-marker');
//Banderas para habilitar funciones 
var connect = false;
var point = false;
var markerPoit = false;
var polygon = false;
//Botones en el mapa
var btnWaypoint = null;
var btnConnection = null;
var btnBuffer = null;
var btnMarker = null;
var btnDelete = null;
var btnPoligono = null;
var btnSavePolygon = null;
var btnSaveMarker = null;
var btnGenerate = null;
var btnDeleteMarker = null;

//GeoJson para generar los buffers
var radio1, radio2, radio3 = null;

var editableLayers = new L.FeatureGroup();
var points = [];
var tMarkers = [];
var pointspolygon = [];
var valor = 0;
var id = null;
//Layers para generar los buffers
var rango1 = null;
var rango2 = null;
var rango3 = null;
//Layers para dibujar el poligono en mapa
var poligono = null;
var plg = null;

var typemarker = 0;
var MarkersGroupEdit = new L.LayerGroup();
var markerPoint = null;
var markerArray = [];
var valida = false;
var editbar = null;
function saveRoutePlan () {
  // idviaje s
  var idviaje = document.getElementById('idroute').value// sample route id
  console.log('Id route: ' + idviaje)
  if (routeContainer.routeResult.length == 0) {
    console.log('Empty route!')
    return
  }

  const requestStr = JSON.stringify({ idviaje: idviaje, routePoints: routeContainer.routeResult, start: routeContainer.pointStart, end: routeContainer.pointEnd })
  $.ajax({
    type: 'POST',
    url: '//' + host + '/saveRoutePlan',
    data: requestStr,
    // dataType: 'json',
    headers: {
      'Content-Type': 'application/json'
    },

    success: function (result) {
      console.log(result)
    },
    error: function () {

      //  recovery();
    }
  })
}

// Evaluate all points 3x3 miles around station
/*  function connectionsStation()
  {
    console.log("Retreviing all connections!!");
    graphContainer.evaluateRectWaypoints(0);
  } */

//Cambio de estacion
function estacionChanged () {
  var idStr = $('#select-estaciones').val()
  id = parseInt($('#select-estaciones').val())
  console.log('Estacion changed! ' + id)
  idEst = id
  console.log("id:"+ idEst);
  for (var i = 0; i < estaciones.length; i++) {
    if (estaciones[i].id == idStr) {
      console.log('Flying to: ', estaciones[i].lat, estaciones[i].lng)
      mapContainer.updateEstacion(id)
      mapContainer.map.setView(new L.LatLng(estaciones[i].lat, estaciones[i].lng))
      buffers(estaciones[i].lng, estaciones[i].lat)
      mapContainer.clearWaypointsAndConnections()
      mapContainer.getWaypoints(id)
      mapContainer.getPolygon(id)
      marker.setLatLng([estaciones[i].lat, estaciones[i].lng]);
      mapContainer.generateControlLayers([coordMap.lat = estaciones[i].lat, coordMap.lng = estaciones[i].lng]);
      if(connect == true)
      {
        console.log("connect");
        mapContainer.activeDrawConnection(false);
        connect = false;
        end.value = "";
        start.value = "";
        stiloactive(btnConnection);
        ocultar();
        btnConnection.state('Add-connection');
      }
      if(point == true)
      {
        mapContainer.stopCreateWaypoint();
        point = false;
        stiloactive(btnWaypoint);
        btnWaypoint.state('Add-waypoints');
      }
    }
    
  }

  
  
}

function changeTypeMarker()
{
  
  typemarker = parseInt($('#select-marker').val());
  console.log("Type :"+typemarker);
}

function generateGraph () {
  mapContainer.generateGraph()
}

function getEstaciones () {
  $.ajax({
    type: 'GET',
    url: '//' + host + '/api/estaciones/',
    success: function (result) {
      console.log('Success')

      estaciones = []
      for (var i = 0; i < result.length; i++) {
        estaciones.push({ id: result[i].id, lat: result[i].lat, lng: result[i].lng, nombre: result[i].nombre })
      }
      console.log(JSON.stringify(estaciones))

      for (var i = 0; i < result.length; i++) {
        $('#select-estaciones').append(`<option value="${result[i].id}">${result[i].nombre}</option>`)
      }
    },
    error: function () {
      /* document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>'; */
      console.log('Error request...')
    }
  })
}

//Obtener los tipos de marcadores
function TypeMarkers ()
{
   $.ajax({
    type: 'GET',
    url: '//' + host + '/api/tipoMarkers/',
     success: function (result) {
      console.log('Success')
       tMarkers = []
       for (var i = 0; i <result.length; i++)
       {
          tMarkers.push ({id: result[i].id, type: result[i].type})
          //$('#select-marker').append(`<option value="${result[i].id}">${result[i].type}</option>`)
       }
       console.log(tMarkers);
       for (var i = 0; i <result.length; i++)
       {
          $('#select-marker').append(`<option value="${result[i].id}">${result[i].type}</option>`)
       }
     }
   })
}


function initLeafMap () {

  
//Genera el array con los tipos de mapas base
var baseLayers = {
  'satelite' : new L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
      maxZoom: 22,
      subdomains:['mt0','mt1','mt2','mt3']
       }),
  'street':  L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
      maxZoom: 22,
      subdomains:['mt0','mt1','mt2','mt3']
      })
}

//Genera el mapa 
map = L.map('map',{
    center : [centerMap.lat, centerMap.lng],
    zoom: 14,
    layers: [
        baseLayers.satelite
      ]
});

//Generar marcador de posición
marker = L.marker([centerMap.lat, centerMap.lng]).addTo(map);
var styleControl = {
  position: 'bottomleft',
}

//invocar función que regresa array con las capas a utilizar en el mapa
var layers = mapContainer.generateControlLayers()
console.log(layers);

//Genera el componente de control de capas en el mapa
var ControlCapas = L.control.layers(baseLayers,layers, {position: 'topleft'}).addTo(map);

//Control de escala
L.control.scale({position: 'bottomleft', maxWidth: 100, metric: true, imperial: false}).addTo(map);

//Crear una capa de tipo LayerGroup
poligono = new L.LayerGroup().addTo(map);

//Agregar una capa de tipo LayerGroup 
MarkersGroupEdit.addTo(map);

//Agregar el componente de legenda en el mapa
var legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  //div.innerHTML += "<h4>Conecctions</h4>";
  div.innerHTML += '<i style="background: #0f4bec "></i><span>Sidewalk</span><br>';
  //div.innerHTML += '<i style="background: #17bd3c"></i><span>Bikewalk</span><br>';
  div.innerHTML += '<i style="background: #F0B04A"></i><span>Street</span><br>';
  div.innerHTML += '<i style="background: #6c3483"></i><span>Crosswalk</span><br>';
  div.innerHTML += '<i style="background: #e60f0f"></i><span>waypoints</span><br>';

  return div;
};

legend.addTo(map);



//Easy button wwaypoint
this.btnWaypoint = L.easyButton({
  states: [{
    stateName: 'Add-waypoints',   // name the state
    icon: '<img src="imagen/point.png">',          // and define its properties
    title: 'Add Waypoints', // like its title
    onClick: function (btn, map) {  // and its callback
      btn.state('Stop-waypoints'); // change state on click!
      map.on('click',function(event){
        console.log(event);
        tipo = 1;
        console.log(this.tipo);
        mapContainer.addWaypoint(mapContainer.idestacion, event.latlng.lat, event.latlng.lng, tipo);
      });
      stiloblock(btnWaypoint);
      point = true;
      ocultar();
    }
  }, {
      stateName: 'Stop-waypoints',
      icon: '<img src="imagen/point.png">',
      title: 'Stop waypoints',
      onClick: function (btn) {
        mapContainer.stopCreateWaypoint();
        btn.state('Add-waypoints');
        stiloactive(btnWaypoint);
        point = false;
      }
    }]
}).addTo(map);


//Easy button connections
btnConnection = L.easyButton({
states: [{
  stateName :'Add-connection',
  icon: '<img src="imagen/conexion.png">',
  title: 'Add connections',
  onClick: function(btn)
  {
    btn.state('End-connection');
     $(document).ready(function(){
       $("#conexiones").show();
       $("#typeConnection").show();
      });
      recorrerListacompras();
      stiloblock(btnConnection);
      mapContainer.activeDrawConnection(true);
      connect = true;
    }
    
  },
  {stateName :'End-connection',
  icon: '<img src="imagen/conexion.png">',
  title: 'Stop connections',
  onClick: function(btn){
    btn.state('Add-connection'),
    stiloactive(btnConnection);
    ocultar();
    mapContainer.activeDrawConnection(false);
    console.log(select);
    connect = false;
  }
}]
}).addTo(map);

//Easy button markers
btnMarker = L.easyButton({
states : [
  {stateName : 'add',
   icon : '<img src="imagen/buffer.png">',
   title: 'Add marker',
   onClick: function(btn,map)
      {
          btn.state('finish'),
          stiloblock(btnMarker);
          $(document).ready(function(){
            $("#tipo").show();
          });
          map.on('click', function(e){

          if(typemarker != 0)
          {
            markerPoint = L.circleMarker(e.latlng);
            markerPoint.addTo(MarkersGroupEdit);
            markerArray.push({"lat": e.latlng.lat, "lng": e.latlng.lng, "type": typemarker,"id": idEst});
          }
          else
          {
            alert("Select the type of marker");
          }
      });
        btnSaveMarker.enable()
        btnDeleteMarker.enable()
        markerPoit = true;
      }
  },
  { stateName : 'finish',
  icon : '<img src="imagen/buffer.png">',
  title: 'End operation',
  onClick : function(btn, map)
    {
      btn.state('add');
      $(document).ready(function(){
        $("#tipo").hide();
        let valor = $('#select-marker').val();
        console.log(valor);
        $('#select-marker').val(0);
       });
      map.off('click');
      stiloactive(btnMarker);
      btnSaveMarker.disable();
      btnDeleteMarker.disable()
      markerPoit = false;
    }
  }
]});
btnSaveMarker = L.easyButton({
  states :
  [
    {stateName: 'create',
     icon:'<img src="imagen/Saver.png">',
     title: 'Save marker',
      onClick : function(btn)
      {
        if(markerArray.length > 0)
        {
          console.log(markerArray);
          for(var i = 0; i < markerArray.length; i++)
          {
            mapContainer.addMarker(markerArray[i]);
          }
          markerArray = [];
        }
        else
        {
          alert("No marker to store");
        }
      }
    }
  ]
})
btnDeleteMarker = L.easyButton({
states:
 [
   {
         stateName:'delete',
         icon :'<img src="imagen/delete.png">',
         title:'Delete marker',
         onClick: function(btn){
          if (map.hasLayer(MarkersGroupEdit)){MarkersGroupEdit.clearLayers()};
          markerArray = [];
    
         }
   }
 ]

})

//Generar easyBar para poligono
var barMarker = L.easyBar([btnMarker,btnDeleteMarker.disable() ,btnSaveMarker.disable()],{position:'topleft'});
barMarker.addTo(map);


//Genera el poligono
btnPoligono = L.easyButton({
  states : [
    {
      stateName : 'create',
      icon : '<img src="imagen/poligono.png">',
      title : 'Draw polygon',
      onClick : function(btn, map)
      {
       btn.state('end'),
        map.on('click', function(e){
         let p =e.latlng;
         //console.log(p.lat, p.lng);
         let punto =  L.circleMarker([p.lat, p.lng]);
         punto.addTo(poligono);
         points.push([p.lng, p.lat]);
         pointspolygon.push([p.lat, p.lng]);
        }),
        stiloblock(btnPoligono);
        btnDelete.enable();
        btnSavePolygon.enable();
        btnGenerate.enable();
        polygon = true;
        ocultar();
      }
    },
    {
      stateName: 'end',
      icon : '<img src="imagen/poligono.png">',
      title : 'Finish polygon',
      onClick : function(btn)
      {
        map.off('click');
        btn.state('create');
        stiloactive(btnPoligono);
        btnGenerate.disable();
        btnDelete.disable();
        btnSavePolygon.disable();
      }
    }
  ]
});

btnDelete = L.easyButton({
  leafletClasses: true,
  type: 'replace', 
  states:
   [
     {
           stateName:'delete',
           icon :'<img src="imagen/erase.png">',
           title:'Delete polygon', 
           onClick: function(btn){
             if (map.hasLayer(poligono)){poligono.clearLayers()};
             if (map.hasLayer(plg)){plg.clearLayers()};
             points = [];
             pointspolygon = [];
             map.on('click', function(e){
               let p =e.latlng;
               //console.log(p.lat, p.lng);
               let punto =  L.circleMarker([p.lat, p.lng]);
               punto.addTo(poligono);
               points.push([p.lng, p.lat]);
               pointspolygon.push([p.lat, p.lng]);
             })
           }
     }
   ]
});
btnSavePolygon = L.easyButton({
 states :
 [
   {
     icon : '<img src="imagen/Guardar.png">',
     title : 'Save polygon',
     onClick: function(btn){
      console.log(pointspolygon,idEst);
      mapContainer.generapoligono(pointspolygon,idEst);
      points = [];
      pointspolygon = [];
    }
   }
 ]
});

btnGenerate = L.easyButton ({
  states:
  [
   {
     icon : '<img src="imagen/generate.png">',
     title: 'Generate polygon',
     onClick : function(btn)
     {
       map.off('click');
       console.log(points);
       var resultado = turf.multiPolygon([[points]]);
       
       plg = L.geoJSON(resultado,{fillColor: '#109fe2', fillOpacity: 0.2, color:'#109fe2', opacity:'1', weight:5});
       plg.addTo(map);
       console.log(pointspolygon);
     }
   }
  ]
})


//Generar easyBar para poligono
editbar = L.easyBar([btnPoligono,btnGenerate.disable(),btnDelete.disable(),btnSavePolygon.disable()],{position:'topleft'});
editbar.addTo(map);

//Easy button save graph
L.easyButton('<img src="imagen/save.svg">', function(btn){
 generateGraph()
 if(connect == true)
 {
   console.log("connect");
   mapContainer.activeDrawConnection(false);
   connect = false;
   end.value = "";
   start.value = "";
   stiloactive(btnConnection);
   ocultar();
   btnConnection.state('Add-connection');
 }
 if(point == true)
 {
   mapContainer.stopCreateWaypoint();
   point = false;
   stiloactive(btnWaypoint);
   btnWaypoint.state('Add-waypoints');
 }
},'Save graph',{position : 'topleft'}).addTo(map);

  mapContainer.cargaLayers(idEst);
  mapContainer.initializeMap(map, idEst)
  mapContainer.updateEstacion(idEst)
  mapContainer.getWaypoints(idEst)
  mapContainer.getMarkers(idEst)
  mapContainer.getPolygon(idEst)
 mapContainer.changePositionLayers()
 getEstaciones()
  TypeMarkers()
  

  if(id == null)
  {
  buffers(centerMap.lng, centerMap.lat)
  }
 
  
}

function Stopspinner()
{
  var layers = mapContainer.generateControlLayers()
  console.log(layers.Connections._layers)
  if (layers.Connections != null)
  {
    document.getElementById('spinner')
    .style.display = 'none';
  }
}

function typeChanged()
{
  valor = $("#select-marker").val()
  console.log('Type:'+ valor)
  if(valor != 0)
  {
      map.on('click',function(e)
      {
        let j = e.latlng;
        console.log(j);
      } )
  }

} 

function buffers(_lng, _lat)
{
  if (map.hasLayer(rango1)){rango1.clearLayers()};
  if (map.hasLayer(rango2)){rango2.clearLayers()};
  if (map.hasLayer(rango3)){rango3.clearLayers()};
  console.log("coordenadas:" + _lng, _lat);
  let punto = turf.point([_lng, _lat]);
  radio1 = turf.buffer(punto, 1,{units:'miles', steps: 8});
  radio2 = turf.buffer(punto, 2, {units:'miles', steps: 8});
  radio3 = turf.buffer(punto, 3, {units:'miles', steps: 8});
  rango1 = L.geoJSON(radio1, {fillColor: '#green', fillOpacity: 0,color:'green', opacity:'1',weight:5});
  rango2 = L.geoJSON(radio2,{fillColor: '#edd611', fillOpacity: 0,color:' #edd611 ', opacity:'1',weight:5});
  rango3 = L.geoJSON(radio3,{fillColor: '#ec7314', fillOpacity: 0,color:'#ec7314', opacity:'1',weight:5});
  rango1.addTo(map);
  rango2.addTo(map);
  rango3.addTo(map);
}


function refresch()
{
    if(connect == true)
    {
      console.log("connect");
      mapContainer.activeDrawConnection(false);
      connect = false;
      end.value = "";
      start.value = "";
      stiloactive(btnConnection);
      ocultar();
      btnConnection.state('Add-connection');
    }
    if(point == true)
    {
      mapContainer.stopCreateWaypoint();
      point = false;
      stiloactive(btnWaypoint);
      btnWaypoint.state('Add-waypoints');
    }
}



$(document).ready(function () {
  console.log('ready!')
  mapContainer.initializeMap(map, idEst)
  initLeafMap()
  Stopspinner()
})




    document.addEventListener('keypress', (event) =>{
      console.log(event);
      if(event.shiftKey == true){
          if(event.code == 'KeyP')
          {
            console.log(event.code);
            btnGenerate.enable(),btnDelete.enable(),btnSavePolygon.enable()
            btnPoligono.state('end');
            stiloblock(btnPoligono);
            map.on('click', function(e){
              let p =e.latlng;
              //console.log(p.lat, p.lng);
              let punto =  L.circleMarker([p.lat, p.lng]);
              punto.addTo(poligono);
              points.push([p.lng, p.lat]);
              pointspolygon.push([p.lat, p.lng]);
             })
          }
          if(event.code == 'KeyM')
          {
            btnMarker.state('finish'),
              stiloblock(btnMarker);
              $(document).ready(function(){
                $("#tipo").show();
              });
              map.on('click', function(e){
                    if(typemarker != 0)
                    {
                      markerPoint = L.circleMarker(e.latlng);
                      markerPoint.addTo(MarkersGroupEdit);
                      markerArray.push({"lat": e.latlng.lat, "lng": e.latlng.lng, "type": typemarker,"id": idEst});
                    }
                    else
                    {
                      alert("Select the type of marker");
                    }
              })
              btnSaveMarker.enable()
              btnDeleteMarker.enable()
              markerPoit = true;
            
          }

      }
      if(event.shiftKey == true)
      {
        console.log('Shift +'+event.code);
      }
    })


select.addEventListener('click', ({ target }) => { 
  if (target.getAttribute('name') === 'inlineRadioOptions') { 
 
   connect = target.value;
   console.log(connect);
  if(connect == 1)
   {

      color = "#0f4bec";
      pulsecolor = "#FFFFFF";
      type = "sidewalk";
      mapContainer.changetipe(color,type);

   }
   if(connect == 3)
   {
     color = "#F0B04A"; 
     pulsecolor = "#FFFFFF";
     type="street";
     mapContainer.changetipe(color,type);
   }
  }
  if(connect == 4)
   {
     color = "#6c3483"; 
     pulsecolor = "#FFFFFF";
     type="crosswalk";
     mapContainer.changetipe(color,type);
   }
});

function finaliza()
{
  mapContainer.stopCreateWaypoint();
  console.log("finalizar");
}

function ocultar()
{
  $(document).ready(function(){
    $("#conexiones").hide();
    $("#typeConnection").hide();
    $("#tipo").hide();
    $("#start").val("");
    $("#end").val("");
    //$('#select-marker').hide();
    mapContainer.clearPointsConnection();
  })
}


function recorrerListacompras(){
  var connect = 0;
  $("input[name=inlineRadioOptions]").each(function (index) {  
     if($(this).is(':checked')){
      connect = $(this).val();
      console.log(connect);
        if(connect == 1)
        {
    
          color = "#0f4bec";
          pulsecolor = "#FFFFFF";
          type = "sidewalk";
          mapContainer.changetipe(color,type);
        }
      if(connect == 3)
        {
          color = "#F0B04A"; 
          pulsecolor = "#FFFFFF";
          type="street";
          mapContainer.changetipe(color,type);
        }
      
        if(connect == 4)
        {
          color = "#6c3483"; 
          pulsecolor = "#FFFFFF";
          type="crosswalk";
          mapContainer.changetipe(color,type);
        }
     }
  });

}


function stiloblock(_btn)
{
  
  _btn.button.style.backgroundColor = '#bfbfbf'; // repeated line (note below)
  _btn.button.style.transitionDuration = '.5s';
  if(connect == true)
  {
    console.log("connect");
    mapContainer.activeDrawConnection(false);
    connect = false;
    end.value = "";
    start.value = "";
    stiloactive(btnConnection);
    ocultar();
    btnConnection.state('Add-connection');
  }
  if(point == true)
  {
    mapContainer.stopCreateWaypoint();
    point = false;
    stiloactive(btnWaypoint);
    btnWaypoint.state('Add-waypoints');
  }
  if(markerPoit == true)
  {
    console.log("marker");
    markerPoit = false;
    btnSaveMarker.disable();
    stiloactive(btnSaveMarker);
  }
}

function stiloactive(_btn)
  {
    _btn.button.style.backgroundColor = '#f1f2f5'; // repeated line (note below)
    _btn.button.style.transitionDuration = '.5s';
  }


//Change Station
function ChangeStation()
{
  var map = this.map;
  var mapContainer = this;
  id = parseInt($('#select-estaciones').val())
  console.log("Station!"+ id);
}
