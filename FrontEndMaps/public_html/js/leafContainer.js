
class LeafContainer {
  constructor () {
    this.map = null
    this.directionsService = null
    this.waypointCircleList = []
    this.routeCircleList = []
    this.connectionPolylineList = []
    this.startCircle = null
    this.endCircle = null
    this.rectList = []
    this.trailCircleList = []
    this.idestacion
    this.tipo = 0
    this.circulo
    this.clickPoint = []
    this.marker = null;
    this.markerPoint = null;
    this.line = null;
    this.linereverse = null;
    this.PointGroup = new L.layerGroup() ;
    this.lineGroup = new L.layerGroup() ;
    this.MarkersGroup = new L.layerGroup() ;
    this.PolygonLayer = new L.featureGroup() ;
   this.points = [];
   this.color = null;
   this.type = null;
   this.pointsId = [];
   this.active = false;
   this.btnWaypoint = null;
   this.btnConnection = null;
  this.icoLampost = L.icon(
    {
      iconUrl: './imagen/lampost.png'
    } 
  )

  }



  initializeMap (_map, _idEst) {
    var mapContainer = this;
    this.map = _map;
    this.idestacion = _idEst;

  }

  updateEstacion (_idestacion) {
    this.idestacion = _idestacion
  }

//Get Station
getEstaciones () {
  $.ajax({
    type: 'GET',
    url: '//' + host + '/api/estaciones/',
    success: function (result) {
      console.log('Success')

      estaciones = []
      for (var i = 0; i < result.length; i++) {
        estaciones.push({ id: result[i].id, lat: result[i].lat, lng: result[i].lng, nombre: result[i].nombre })
      }
      for (var i = 0; i < result.length; i++) {
        $('#select-estaciones').append(`<option value="${result[i].id}">${result[i].nombre}</option>`)
      }
    },
    error: function () {
      console.log('Error request...')
    }
  })

 }


//Charge layers
cargaLayers(_idEst)
{
  var mapContainer = this;
  mapContainer.getWaypoints(_idEst);


}


  //api agregar nuevo waypoint
  addWaypoint (idestacion, lat, lng, tipo) {
    var map=this.map;
    var t = tipo;
    var mapContainer = this
    this.idestacion = idestacion
    console.log('Agregando waypoint!')
    $.ajax({
      type: 'GET',
      url: '//' + host + '/api/creawaypoint',
      data: {
        idestacion: idestacion,
        lat: lat,
        lng: lng

      },
      success: function (result) {
        // isRecovering = false;
        console.log('Success')

        console.log(result[0])
        //  graphContainer.addWaypoint(result[0].id,lat,lng);
        //mapContainer.waypointCircleList.push(mapContainer.createWaypoint({ id: result[0].id, lat: lat, lng: lng },t))
        // mapContainer.drawWaypoints([]);
        // console.log(result);

        //this.map.remove(this.PointGroup);
        mapContainer.getWaypoints(idestacion);
        //map.off('click');
      },
      error: function () {
        /* document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>'; */
        console.log('Error request...')
        // recovery();
      }
    })
  }

//Save markers
  addMarker(marcador)
  {
      var map = this.map;
      var mapContainer = this;
      console.log(marcador);
      var dato = JSON.stringify(marcador)
      console.log("dato:"+dato);
      $.ajax({
        type: 'POST',
        url: '//' + host + '/api/newMarkers',
        data: dato,
        headers: {
          'Content-Type': 'application/json'
        },  
        success: function(result){
          console.log('Success')
          console.log(result)
        },
        error: function () {
          console.log('Error request...')
        }
      })

  }

//Save poligono
  generapoligono(_puntos, _idestacion)
  {
    var mapContainer = this;
    var polygon = [{puntos: _puntos, idestacion : _idestacion}];
    let p = JSON.stringify(polygon);
    console.log(p);
    $.ajax({
      type: 'POST',
      url: '//' + host + '/newpolygon',
      data: p,
      headers: {
        'Content-Type': 'application/json'
      },  
      success: function(result){
        console.log('Success')
        console.log(result)
      },
      error: function () {
        console.log('Error request...')
      }
    })
  }



  //Obtener los marcadores por estacion
  getMarkers(_idestacion)
  {
    var map=this.map;
    var mapContainer = this
    this.idestacion = _idestacion
    console.log('Getmarkers!'+ this.idestacion)
    $.ajax({
      type: 'GET',
      url: '//' + host + '/api/markers/'+ _idestacion,
      success: function (result) {
        console.log('Success'),
        mapContainer.DrawMarkers(result)
        //console.log(result)

      },
      error: function () {
        console.log('Error request...')
 
      }
    })
  }


  //Obtener los puntos del poligono por estacion
  getPolygon (_idestacion)
  {
    var map=this.map;
    var mapContainer = this
    this.idestacion = _idestacion
    console.log('Getpolygon!'+ this.idestacion)
    $.ajax({
      type: 'GET',
      url: '//' + host + '/api/poligono/'+ _idestacion,
      success: function (result) {
        console.log('Success'),
        mapContainer.DrawPolygon(result);
        //console.log(result)

      },
      error: function () {
        console.log('Error request...')
 
      }
    })
  }

//Dibuja marcadores
  DrawMarkers(_markers)
{
  var map = this.map;
  var mapContainer=this;
  if (this.map.hasLayer(this.MarkersGroup)){this.MarkersGroup.clearLayers()};
  for(var i = 0; i<_markers.length; i++)
  {
    let p = [_markers[i].lat, _markers[i].lng];
    this.markerPoint = L.circle(p, {
      draggable : true,
      radius: 3,
      fillColor: _markers[i].color,
      color: _markers[i].color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.75,
    }).addTo(this.MarkersGroup);
    this.markerPoint.idmarker = _markers[i].id;
     var idest = this.idestacion;

  };
  this.MarkersGroup.addTo(map);
}

//Dibuja poligono
DrawPolygon(_polygon)
{
  var map = this.map;
  var mapContainer=this;
  if (this.map.hasLayer(this.Polygon)){this.Polygon.clearLayers()};
    let puntos = JSON.stringify(_polygon)
    for (var i = 0; i < _polygon.length; i++)
    {
      console.log(_polygon[i].puntos);
       let d = L.polygon(_polygon[i].puntos,{
        fillColor: "#c87805",
        color: "#c87805",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.50,
        }).addTo(this.PolygonLayer);
    }
    this.PolygonLayer.addTo(this.map);

}


  removeRoute (routeDraw) {
    this.map.removeOverlay(routeDraw)
  }



  timeFromSeconds (time) {
    var timestamp = ''
    var hours = Math.floor(time / 3600)
    time = time - hours * 3600
    var minutes = Math.floor(time / 60)
    var seconds = time - minutes * 60

    /* if(hours<10)
        timestamp+='0'

      timestamp+=(hours+':'); */

    if (minutes < 10) { timestamp += '0' }
    // if(minutes>0)
    timestamp += (minutes + ':')

    if (seconds < 10) { timestamp += '0' }
    timestamp += seconds
    return timestamp
  }

  actualizaTiempo (routePath, idconexion, tiempo) {
    console.log('Actualizando tiempo!')
    var mapContainer = this
    $.ajax({
      type: 'GET',
      url: '//' + host + '/api/actualizatiempo',
      data: {
        idconexion: idconexion,
        tiempo: tiempo

      },
      success: function (result) {
        // isRecovering = false;
        console.log('Success')
        routePath.tiempo = tiempo
        var timestamp = mapContainer.timeFromSeconds(tiempo)
        var newpopupContent = mapContainer.getContent(timestamp)
        routePath.setPopupContent(newpopupContent)
      },
      error: function () {
        /* document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>'; */
        console.log('Error request...')
        // recovery();
      }
    })
  }




  getContent (timestamp) {
    var popupContent = `
             <form class="popup-form">
               <div class="form-group">
                 <input type="text"  id="conTime" name="appt" step="1" placeholder="MM:SS" value="${timestamp}">
               </div>
               <div class="d-flex">
                 <button class="save-button btn btn-outline-primary btn-sm">Save</button>
                 <button class="delete-button btn btn-outline-danger btn-sm ml-auto">
                    Delete
                 </button>
                 <button class="default-button btn btn-outline-info btn-sm ml-auto">
                    Default
                 </button>
               </div>
             </form>
             `
    return popupContent
  }

  drawRoute (id, tiempo, distancia) {
    const map = this.map
    const mapContainer = this
    // console.log('Draw route!',routePoints);
    const routePath = null; //L.polyline(routePoints, { color: color, weight: 6 }).addTo(map)
    routePath.idConnection = id;
    routePath.tiempo = tiempo;
    routePath.distancia = distancia;
    var timestamp = this.timeFromSeconds(tiempo)
    // console.log(timestamp);
    const popupContent = this.getContent(timestamp)
    // console.log(`<input type="time" id="conTime" name="appt" step="1"  value="${timestamp}">`);

    /* if (routePath.properties && routePath.properties.popupContent) {
             popupContent += routePath.properties.popupContent;
           } */

    routePath.bindPopup(popupContent).on('popupopen', () => {
      $('.save-button').on('click', e => {
        e.preventDefault()
        // console.log('Saving time!!'+$("#saveTime").value);
        console.log('Value: ' + document.getElementById('conTime').value)
        var timeStr = document.getElementById('conTime').value
        if (timeStr.match(/\d+:[0-5]\d/)) {
          console.log('Valid!!' + timeStr)

          var tiempoArr = timeStr.split(':')
          if (tiempoArr != 'undefined' && tiempoArr.length == 2) {
            var mins = parseInt(tiempoArr[0])
            var secs = parseInt(tiempoArr[1])

            if (!isNaN(mins) && !isNaN(secs) && mins >= 0 && mins < 60 && secs >= 0 && secs < 60) {
              var tiempo = mins * 60 + secs

              console.log('total segundos: ' + tiempo)
              mapContainer.actualizaTiempo(routePath, routePath.idConnection, tiempo)

              map.removeLayer(routePath)
              routePath.addTo(map)
            }
          }
        }
      })

      $('.delete-button').on('click', e => {
        e.preventDefault()
        mapContainer.deleteConnection(routePath.idConnection, routePath)
        map.removeLayer(routePath)
        routePath.addTo(map)
        // alert(`now delete layer with id ${routePath.idConnection}`);
      })

      $('.default-button').on('click', e => {
        console.log('Default!' + routePath.distancia)
        e.preventDefault()
        var speed = 1.0
        var timestamp = mapContainer.timeFromSeconds(routePath.distancia / speed)
        // console.log('Default!'+timestamp);
        var newpopupContent = mapContainer.getContent(timestamp)
        // console.log(newpopupContent);
        routePath.setPopupContent(newpopupContent)
        // console.log(timestamp);
      })
    })

    //  console.log("New route connection ID: "+id);

    routePath.on('mouseover', function () {
      console.log('Connection ID: ' + routePath.idConnection)
    })

    routePath.on('contextmenu', function () {
      console.log('Clicked conexion ID: ' + routePath.idConnection)
      mapContainer.deleteConnection(routePath.idConnection, routePath)
    })

    // this.routeDict=[];

    return routePath
  }

  drawStartPoint (lat, lng) {
    const map = this.map

    var circle = L.circle([lat, lng], { radius: 3, color: 'green' })
    circle.addTo(map)

    this.startCircle = circle
  }

  drawEndPoint (lat, lng) {
    const map = this.map

    var circle = L.circle([lat, lng], { radius: 3, color: 'blue' })
    circle.addTo(map)

    this.endCircle = circle
  }

  clearStartEndPoints () {
    if (this.startCircle != null) { this.map.removeLayer(this.startCircle) }
    // this.startCircle.setMap(null);
    if (this.endCircle != null) { this.map.removeLayer(this.endCircle) }
    //  this.endCircle.setMap(null);
    for (var i = 0; i < this.connectionPolylineList.length; i++) {
      this.updateConnectionColor(i, 'red')
    }
  }

  updateConnectionColor (index, color) {
    this.connectionPolylineList[index].setStyle({ color: color })
  }

  clearConnections () {
    console.log('Clearing connections' + this.connectionPolylineList.length)
    for (var i = 0; i < this.connectionPolylineList.length; i++) {
      this.map.removeMarker(this.connectionPolylineList[i])
      // this.connectionPolylineList[i].setMap(null);
    }
    this.connectionPolylineList = []
  }



  deleteConnectionPolyline (idconexion) {
    for (var i = 0; i < this.connectionPolylineList; i++) {
      if (this.connectionPolylineList[i].id === idconexion) {
        // graph.connections.splice(i,1);
        this.connectionPolylineList.splice(i, 1)
      }
    }
  }

  deleteConnection (idconexion, routePath) {
    var leafContainer = this
    //  console.log("Total connections (prev): "+leafContainer.graph.connections.length);
    var map = this.map
    $.ajax({
      type: 'GET',
      url: '//' + host + '/api/eliminaconexion',
      data: { idconexion: idconexion },
      // dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      },

      success: function (result) {
        console.log(result)
        map.removeLayer(routePath)

        // leafContainer.graph.deleteConnection(idconexion);
        leafContainer.deleteConnectionPolyline(idconexion)

        //  console.log("Total connections (after): "+leafContainer.graph.connections.length);

        // routePath.setMap(null);
      },
      error: function () {
        console.log('***Error request...***')
      }
    })
  }

  removeConnection (index) {
    this.deleteConnection(index, this.connectionPolylineList[index])
  }

  saveConnection (pointArray, origin, destination, distance, tipo,idestacion) {
    var mapContainer = this
    var est = idestacion
    console.log(tipo);
    var connection = [{ idBegin: origin, idEnd: destination, connectionPoints: pointArray, distanceMeters: distance, conexiontipo: tipo}]//, routeDraw:routeDraw});

    var connectionStr = JSON.stringify(connection)
    console.log('***Saving connection***! (mapServer)')
    console.log(connectionStr)

   $.ajax({
      type: 'POST',
      url: '//' + host + '/saveConnections',
      data: connectionStr,
      // dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      },

      success: function (result) {
        // isRecovering = false;
        // console.log("Success");
        console.log(result)
        var idConexion = result[0].id
        var tiempo = result[0].tiempo
        //var routeDraw = mapContainer.drawRoute(pointArray, '#FF0000', idConexion, tiempo, distance)
        //routeDraw.idBegin = origin.id
        //routeDraw.idEnd = destination.id
        //mapContainer.connectionPolylineList.push(routeDraw)
        mapContainer.getConnections(est);
        mapContainer.clearPointsConnection();
        mapContainer.clearTypeConnection();

      },
      error: function () {
        console.log('***Error request...***')
      }
    })
  }

  routeCallback (origin, destination, pointArray, distance) {
    // connectionCallback=true;
    if (pointArray.length > 0) {
      console.log('Adding connection route!')

      // this.addConnection(origin.idWaypoint,destination.idWaypoint,pointArray,distance,routeDraw);

      //this.saveConnection(pointArray, origin, destination, distance)
    }
  }

  requestRoute (origin, destination,idorigin, iddestination,idestacion, tipo) {
    var org = {lat:origin[0].lat,lng:origin[0].lng};
    var dest = {lat:destination[0].lat,lng:destination[0].lng};
    var idstar = idorigin;
    var idend = iddestination;
    var est = idestacion;
    var t = tipo;
    console.log(org, dest);

   $.ajax({
      type: 'GET',
      url: '/api/requestRoute',
      data: { origin: org, destination: dest }
    }).then(result => {
      console.log(result)
     if (result.points.length > 0) {
        var routeArray = result.points
        var pointArray = []
        pointArray.push(L.latLng(org.lat, org.lng))
        for (var i = 0; i < routeArray.length; i++) {
          pointArray.push(L.latLng(routeArray[i].lat, routeArray[i].lng))
        }
        pointArray.push(L.latLng(dest.lat, dest.lng))

        var distanceMaps = result.distance
        var distance = 0
        if (distanceMaps.includes(' m')) {
          distanceMaps = distanceMaps.slice(0, distanceMaps.length - 2)
          distanceMaps = distanceMaps.replace(',', '')
          distance = parseFloat(distanceMaps)
        } else if (distanceMaps.includes(' km')) {
          distanceMaps = distanceMaps.slice(0, distanceMaps.length - 3)
          distanceMaps = distanceMaps.replace(',', '')
          distance = parseFloat(distanceMaps) * 1000.0
        }

        console.log('Route callback:')
        //pointArray, origin, destination, distance, tipo,idestacion
        mapContainer.saveConnection(pointArray, idstar, idend, distance,t, est)
      } else {
        console.log('Unable to retreive route')
        var pointArray = []
        var distance = 0
        //this.routeCallback(origin, destination, pointArray, distance)
      }
    })
  }

  clearWaypointsAndConnections () {
    for (var i = 0; i < this.waypointCircleList.length; i++) {
      this.map.removeLayer(this.waypointCircleList[i])
    }

    for (var i = 0; i < this.connectionPolylineList.length; i++) {
      this.map.removeLayer(this.connectionPolylineList[i])
    }
  }

  deleteWaypointMarkers (id) {
    // var index=null;

    for (var i = 0; i < this.waypointCircleList.length; i++) {
      // console.log(this.waypointCircleList[i].idWaypoint);
      if (this.waypointCircleList[i].idWaypoint == id) {
        console.log('Found waypoint!' + id)
        this.map.removeLayer(this.waypointCircleList[i])
        // this.waypointCircleList.splice(i,1);
      }
    }

    for (var i = 0; i < this.connectionPolylineList.length; i++) {
      // console.log();
      if (this.connectionPolylineList[i].idBegin == id || this.connectionPolylineList[i].idEnd == id) {
        // console.log("Found connection!!!"+this.connectionPolylineList[i].id);
        this.map.removeLayer(this.connectionPolylineList[i])
        // this.connectionPolylineList.splice(i,1);
      }
    }
  }


  //Get conecctions
  getConnections (idestacion) {
    var mapContainer = this
    $.ajax({
      type: 'GET',
      url: '//' + host + '/api/conexiones/' + idestacion,
      success: function (result) {
        console.log('Success')

        mapContainer.drawConnections(result, idestacion)
      },
      error: function () {
        /* document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>'; */
        console.log('Error request...')
      }
    })
  }

  generateGraph () {
    var mapContainer = this
    $.ajax({
      type: 'GET',
      url: '//' + host + '/api/generateGraph',
      data: {

        idestacion: mapContainer.idestacion
      },
      success: function (result) {
        // isRecovering = false;
        console.log('Success')
        alert('Se guardaron los cambios!')
        location.reload()
        // console.log(result);
      },
      error: function () {
        /* document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>'; */
        console.log('Error request...')
        // recovery();
      }
    })
  }

  //Api para consultar los waypoints
     getWaypoints(idestacion)
     {
       var mapContainer=this;
       this.idestacion = idestacion;
       $.ajax({
           type: "GET",
           url: '//' + host + "/api/waypoints",
           data: {
             idestacion:idestacion

           },
           success: function (result) {
               //isRecovering = false;
               //console.log(result);

              mapContainer.DrawPoints(result, idestacion);
              mapContainer.getConnections(idestacion);




           },
           error:   function () {
                 /*document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>';*/
                 console.log("Error request...");
                 //recovery();
             }
       });

       }


     deleteWaypoint(idwaypoint, idestacion)
     {
       var mapContainer= this;
       var id = idestacion;
       console.log('Eliminando waypoint!'+idwaypoint);
       $.ajax({
           type: "GET",
           url: '//' + host + "/api/removewaypoint",
           data: {
             idwaypoint:idwaypoint
           },
           success: function (result) {
               //isRecovering = false;
               console.log("Success");

               //location.reload();

              mapContainer.getWaypoints(id);
           },
           error:   function () {
                 /*document.getElementById("backgroundDiv").innerHTML = '<h3 style="color:white;">Conexión perdida. Reconectando...</h3>';*/
                 console.log("Error request...");
                 //recovery();
             }
       });
     }


  changetipe(_color, _type)
  {
    var map = this.map;
    var mapContainer=this;
    this.color = _color;
    this.type = _type;
    console.log("Nuevo color:",this.color,"Nuevo tipo:", this.type);
  }

  activeDrawConnection(_active)
  {
    var map = this.map;
    var mapContainer=this;
    this.active = _active;
    console.log(this.active);
  }

//Draw layer group of waypoints
DrawPoints(points, idestacion)
{
  {if (this.map.hasLayer(this.PointGroup)){this.PointGroup.clearLayers()};}
  this.idestacion = idestacion;
  console.log(this.idestacion);
  var map = this.map;
  var mapContainer=this;
  for(var i = 0; i<points.length; i++)
  {
    let p = [points[i].lat, points[i].lng];
    this.marker = L.circle(p, {
      draggable : true,
      radius: 7,
      fillColor: "#e60f0f",
      color: "red",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.35,
    }).addTo(this.PointGroup);
    this.marker.idWaypoint = points[i].id;
     var idest = this.idestacion;

      this.marker.on("contextmenu",function(e){
        var id = e.target.idWaypoint;
        mapContainer.deleteWaypoint(id, idest);
      });
      this.marker.on("click",function(e, ){
        console.log(this.active);
          var coordinate = e.target._latlng;
          var id = e.target.idWaypoint;
          console.log(coordinate);
          mapContainer.DrawConnection(coordinate, id, idest);
      });

  };
  this.PointGroup.addTo(map);
}

//Get the points to use at the connect
DrawConnection(_coordinate, _id, _idestacion)
{
  console.log(this.active);
  if(this.active == true)
  {
      var map = this.map;
      var mapContainer=this;
      var latlng = _coordinate;
      var start = document.getElementsByName('start');
      var end = document.getElementsByName('end');
      this.points.push([latlng]);
      this.pointsId.push(_id);
      var estacion = _idestacion;
      console.log(this.points.length);
      if(this.points.length == 2)
      {

            if(start.val == null)
            {
              $("#start").val(this.points[0]);

            }
            if(end.val == null)
            {
              $("#end").val(this.points[1]);
            }
          mapContainer.getConecctionPoints(this.points, this.pointsId, estacion);
      }
  }

}

clearPointsConnection()
{
  var mapContainer=this;
  this.points = [];
  this.pointsId = [];
  console.log("points",this.points);
}

clearTypeConnection()
{
  var mapContainer=this;
  var tipo =document. getElementById('conecctions');
  //document. getElementById('conecctions'). onclick = function() {
    var radio = tipo. querySelector('input[type=radio][name=inlineRadioOptions]:checked');
    //radio. checked = false;
}

DeleteConnection(idconexion, idestacion)
{
  var leafContainer = this
  var id = idestacion
  console.log(id);
  //  console.log("Total connections (prev): "+leafContainer.graph.connections.length);
  var map = this.map
$.ajax({
    type: 'GET',
    url: '//' + host + '/api/eliminaconexion',
    data: { idconexion: idconexion },
    // dataType: 'json',
    headers: {
      'Content-Type': 'application/json'
    },

    success: function (result) {
      console.log(result)
      //map.removeLayer(routePath)

      // leafContainer.graph.deleteConnection(idconexion);
      //leafContainer.deleteConnectionPolyline(idconexion)
      mapContainer.getConnections(id);
      //  console.log("Total connections (after): "+leafContainer.graph.connections.length);

      // routePath.setMap(null);
    },
    error: function () {
      console.log('***Error request...***')
    }
  })
}


//Draw layer group of Connections
drawConnections (connections, _idestacion ) {
  var map = this.map;
  var mapContainer=this;
  var color = 0;
  var pulsecolor = "#FFFFFF";
  var estacion = _idestacion;
  if (this.map.hasLayer(this.lineGroup)){this.lineGroup.clearLayers()};
  for(var i = 0; i<connections.length; i++)
  {
    var pointStart = ({"lat": connections[i].startlat, "lng": connections[i].startlng}) ;
    var pointEnd = ({"lat": connections[i].endlat, "lng": connections[i].endlng}) ;
    var tipeConnection = connections[i].conexiontipo;
    if (tipeConnection == 'street'){color = "#F0B04A"};
    if (tipeConnection == 'sidewalk'){color = "#0f4bec"};
    if (tipeConnection == 'bikewalk'){color = "#17bd3c"};
    if (tipeConnection == 'crosswalk'){color = "#6c3483"};
    this.line = L.polyline(connections[i].puntos, {
      "weight": 8,　　　　
      "opacity": 0.8,　　
      "color": color　
      }).addTo(this.lineGroup);
     this.line.idConnection = connections[i].id;

     var timestamp = this.timeFromSeconds(connections[i].tiempo)
     const popupContent = this.getContent(timestamp)
     this.line.bindPopup(popupContent).on('popupopen', () => {
      $('.save-button').on('click', e => {
        e.preventDefault()
        // console.log('Saving time!!'+$("#saveTime").value);
        console.log('Value: ' + document.getElementById('conTime').value)
        var timeStr = document.getElementById('conTime').value
        if (timeStr.match(/\d+:[0-5]\d/)) {
          console.log('Valid!!' + timeStr)

          var tiempoArr = timeStr.split(':')
          if (tiempoArr != 'undefined' && tiempoArr.length == 2) {
            var mins = parseInt(tiempoArr[0])
            var secs = parseInt(tiempoArr[1])

            if (!isNaN(mins) && !isNaN(secs) && mins >= 0 && mins < 60 && secs >= 0 && secs < 60) {
              var tiempo = mins * 60 + secs

              console.log('total segundos: ' + tiempo)
              mapContainer.actualizaTiempo(routePath, routePath.idConnection, tiempo)

            }
          }
        }
      })


    })

      this.line.on("contextmenu", function(e){
        console.log("idConnection:",e.target.idConnection);
        var id = e.target.idConnection;
        mapContainer.DeleteConnection(id, estacion);
      });
  }
  this.lineGroup.addTo(map);

}

//Genera los puntos de una nueva conexión
getConecctionPoints(_points, _ids)
{
  var map = this.map;
  var mapContainer = this;
  console.log("_points",_points);
  var startpoint = _points[0];
  var endpoint = _points[1];
  var idstar = _ids[0];
  var idend = _ids[1];
  var tipo = this.type;
  var distancia = turf.distance([startpoint[0].lng, startpoint[0].lat], [endpoint[0].lng, endpoint[0].lat], 'meters');
  console.log(distancia*1000);
  var dist = distancia*1000;
  var pointLine = [];
  if(this.type == "crosswalk")
  {

    var middlepoint = turf.midpoint([startpoint[0].lng, startpoint[0].lat], [endpoint[0].lng, endpoint[0].lat]);
    console.log(middlepoint.geometry.coordinates);
    pointLine.push({"lat": startpoint[0].lat, "lng" : startpoint[0].lng});
    pointLine.push({"lat":middlepoint.geometry.coordinates[1], "lng":middlepoint.geometry.coordinates[0] });
    pointLine.push({"lat": endpoint[0].lat, "lng" : endpoint[0].lng});
    console.log(pointLine);
    mapContainer.saveConnection(pointLine,idstar,idend,dist, this.type,this.idestacion);
  }
  if(this.type == "sidewalk")
  {
   var d = distancia / 9;
   var p1 = turf.point([startpoint[0].lng, startpoint[0].lat]);
   var p2 = turf.point([endpoint[0].lng, endpoint[0].lat]);
   var angulo = turf.bearing(p1,p2);
   pointLine.push({"lat": startpoint[0].lat, "lng" : startpoint[0].lng});
    for(var i = 1; i<9; i++)
    {
      var c = i-1;
      var point = turf.point([pointLine[c].lng, pointLine[c].lat]);
      var distance = d; //distancia
      var bearing = angulo;
      var options = {units: 'meters'}; //unidad de medida
      var destination = turf.destination(point, distance, bearing, options);
      pointLine.push({"lat":destination.geometry.coordinates[1], "lng":destination.geometry.coordinates[0] });
      //L.geoJSON(destination).addTo(map);
      if(i== 8)
      {
        pointLine.push({"lat": endpoint[0].lat, "lng" : endpoint[0].lng});
      }
    }
    mapContainer.saveConnection(pointLine,idstar,idend,dist, this.type,this.idestacion);
  }
  if(this.type == "street")
  {
    mapContainer.requestRoute(startpoint, endpoint, idstar, idend, this.idestacion, this.type);
  }

  //console.log("tipo getConecctionPoints:",tipo);
  //mapContainer.saveConnection(pointLine,idstar,idend,dist, this.type,this.idestacion);
  this.points = [];
}


//Clear layers
clearMap(e){
  var map = this.map;
  var mapContainer=this;
  if (this.map.hasLayer(this.PointGroup)){this.PointGroup.clearLayers()};
}



//Draw waypoints layer
  drawWaypoints(points)
  {
    var map = this.map;
    var mapContainer=this;
    let t = 1;
  createWaypoint (punto, t)

    var map = this.map
    var mapContainer = this

    var circle = L.circle([punto.lat, punto.lng], { draggable : true, radius: 4, color: 'red' })
    circle.idWaypoint = punto.id
    circle.addTo(map);
    console.log(circle.idWaypoint);


    circle.on('mouseover', function (e) {
      // for(var i=0;i<this.waypointCircleList.length;i++)
      //  {
      // if(this.waypointCircleList[i].id==circle.idWaypoint)
      console.log('Mouse over: ' + this.circulo.idWaypoint)
      // }
    })




    circle.on('click', function (e) {
      console.log('Clicked ID: ' + circle.idWaypoint)
      // if(mapContainer.clickPoint.length>=2)
      L.DomEvent.stopPropagation(e)

      mapContainer.clickPoint.push(circle)
      if (mapContainer.clickPoint.length > 1) {
        var origin = { id: mapContainer.clickPoint[0].idWaypoint, lat: mapContainer.clickPoint[0].getLatLng().lat, lng: mapContainer.clickPoint[0].getLatLng().lng }
        var destination = { id: mapContainer.clickPoint[1].idWaypoint, lat: mapContainer.clickPoint[1].getLatLng().lat, lng: mapContainer.clickPoint[1].getLatLng().lng }

        if (origin.id != destination.id) {
          mapContainer.requestRoute(origin, destination)
          // this.singleConnection(mapContainer.clickPoint[0],mapContainer.clickPoint[1]);
        }
        mapContainer.clickPoint = []
      }
    })
    // Right click
    circle.on('contextmenu', (e) => {
      console.log('Id, Lat, Lon:', circle.idWaypoint, ',', e.latlng.lat + ',' + e.latlng.lng)
      mapContainer.deleteWaypoint(circle.idWaypoint)
      // graph.deleteW
    })

    return circle
  }



  drawWaypoints (points) {
    var map = this.map
    var mapContainer = this
    var t = this.tipo
    this.waypointCircleList = []
    for (var i = 0; i < points.length; i++) {
      // console.log(L);

      this.waypointCircleList[i] = this.createWaypoint(points[i], t)
    }
  }

 //Stop create waypoint
 stopCreateWaypoint()
 {
   var map = this.map;
   var mapContainer = this;
   map.off('click');
   console.log("Finaliza");
 }


  getDistanceFromLatLon (lat1, lon1, lat2, lon2) {
    const R = 6378.137 // Radio de la tierra en km
    const dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180
    const dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d * 1000 // metros
  }





//Generate map
generateControlLayers()
{
  var map = this.map;
  var mapContainer = this;

  var overLay = {
    "Waypoints" : this.PointGroup,
    "Connections" : this.lineGroup,
    "Markers" : this.MarkersGroup,
    "Polygon" : this.PolygonLayer 
  }

 return overLay;
 
}

changePositionLayers()
{
  var map = this.map;
  var mapContainer = this;
  this.PolygonLayer.bringToBack();
}

  clearTrail () {
    for (var i = 0; i < this.trailCircleList.length; i++) {
      this.map.removeLayer(this.trailCircleList[i])
    }
  }

  drawTrail (trailArray) {
    var map = this.map
    //  if(trailArray.length==0)
    //    return;
    var point
    // var points = trailArray[0].recorridopuntos;
    var points = trailArray

    var size = 1.5
    var color = '#CCCC00'

    this.clearTrail()
    this.trailCircleList = []
    for (var i = 0; i < points.length; i++) {
      const circle = L.circle([points[i].lat, points[i].lng], { radius: size, color: color })
      circle.addTo(map)
      this.trailCircleList[i] = circle
    }
  }



  }
