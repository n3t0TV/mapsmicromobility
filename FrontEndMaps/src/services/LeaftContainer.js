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
    // this.routeList=[];

    this.clickPoint = []
    this.graph = null
  }

  initializeMap (_map) {
    this.map = _map
    //  this.directionsService=_directionsService;
  }

  removeRoute (routeDraw) {
    this.map.removeOverlay(routeDraw)
  }
  /*  addConnectionRoute(points,indexOrigin,indexDestination)
  {
    this.routeList.push({indexOrigin:indexOrigin,indexDestination:indexDestination,points:points});
    //this.connectionPolylineList
  } */

  drawRoute (routePoints, color, id) {
    const map = this.map
    const gmapContainer = this

    var routePath = L.polyline(routePoints, { color: color, weight: 3 }).addTo(map)

    routePath.on('mouseover', function () {
      console.log('Connection ID: ' + id)
    })

    routePath.on('click', function () {
      console.log('Clicked conexion ID: ' + id)
      gmapContainer.deleteConnection(id, routePath)
    })
    // routePath.setMap(map);
    /*  const routePath = new google.maps.Polyline({
     path: routePoints,
     geodesic: true,
     strokeColor: color,
     strokeOpacity: 1.0,
     strokeWeight: 4,
   });

   google.maps.event.addListener(routePath,"mouseover",function(){
    console.log("Connection ID: "+id);
   });

   google.maps.event.addListener(routePath,"rightclick",function(){
    console.log("Clicked conexion ID: "+id);
    gmapContainer.deleteConnection(id,routePath);
   });

   routePath.setMap(map); */

    this.routeDict = []

    return routePath
  }

  clearCirclesFromMap () {
    for (var i = 0; i < this.waypointCircleList.length; i++) {
      this.waypointCircleList[i].setMap(null)
    }
  }

  drawStartPoint (lat, lng) {
    const map = this.map

    const circle = L.circle([lat, lng], { radius: 3, color: 'green' })
    circle.addTo(map)

    /* const circle = new google.maps.Circle({
      strokeColor: "#00FF00",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#00FF00",
      fillOpacity: 0.35,
      map,
      center: {lat:lat,lng:lng},
      radius: 5,
    }); */

    this.startCircle = circle
  }

  drawEndPoint (lat, lng) {
    const map = this.map

    const circle = L.circle([lat, lng], { radius: 3, color: 'blue' })
    circle.addTo(map)

    /*  const circle = new google.maps.Circle({
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#0000FF",
      fillOpacity: 0.35,
      map,
      center: {lat:lat,lng:lng},
      radius: 5,
    });
*/
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

  drawConnections (connections) {
    var cid
    this.connectionPolylineList = []
    for (var i = 0; i < connections.length; i++) {
      var json = connections[i].puntos
      var points = []
      for (var k = 0; k < json.length; k++) {
      //  points[k]=new google.maps.LatLng(json[k].lat,json[k].lng);
        points[k] = L.latLng(json[k].lat, json[k].lng)
      }
      var routeDraw = gmapContainer.drawRoute(points, '#FF0000', connections[i].id)
      this.connectionPolylineList[i] = routeDraw
    }
  }

  deleteConnection (idconexion, routePath) {
    var map = this.map
    $.ajax({
      type: 'GET',
      url: '//' + host + '/deleteConnection',
      data: { idconexion: idconexion },
      // dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      },

      success: function (result) {
        console.log(result)
        map.removeLayer(routePath)
        // routePath.setMap(null);
      },
      error: function () {
        console.log('***Error request...***')
      }
    })
  }

  drawWaypoints (points) {
    var map = this.map
    var gmapContainer = this

    this.waypointCircleList = []
    for (var i = 0; i < points.length; i++) {
      // console.log(L);
      const circle = L.circle([points[i].lat, points[i].lng], { radius: 3, color: 'red' })
      circle.idWaypoint = points[i].id

      circle.addTo(map)
      // console.log(circle.idWaypoint);
      circle.on('mouseover', function (e) {
        console.log('ID: ' + circle.idWaypoint)
      })

      circle.on('click', function (e) {
        console.log('Clicked ID: ' + circle.idWaypoint)
        if (gmapContainer.clickPoint.length >= 2) { gmapContainer.clickPoint = [] }
        gmapContainer.clickPoint.push(circle.idWaypoint)
        if (gmapContainer.clickPoint.length == 2) {
          if (gmapContainer.graph != null) { gmapContainer.graph.singleConnection(gmapContainer.clickPoint[0], gmapContainer.clickPoint[1]) }
        }
      })

      /* const circle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map,
        center: points[i],
        radius: 3,
        });
        circle.idWaypoint=points[i].id;
        google.maps.event.addListener(circle,"mouseover",function(){
         console.log("ID: "+circle.idWaypoint);
        });

       google.maps.event.addListener(circle,"click",function(){
        console.log("Clicked ID: "+circle.idWaypoint);
        if(gmapContainer.clickPoint.length>=2)
          gmapContainer.clickPoint=[];
        gmapContainer.clickPoint.push(circle.idWaypoint);
        if(gmapContainer.clickPoint.length==2)
        {
          if(gmapContainer.graph!=null)
              gmapContainer.graph.singleConnection(gmapContainer.clickPoint[0],gmapContainer.clickPoint[1]);
        }

      }); */

      this.waypointCircleList[i] = circle
    }

  /*  for(var i=0;i<this.waypointCircleList.length;i++)
    {
      console.log(this.waypointCircleList[i].idWaypoint);
    }
*/
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

  drawPointArray (points, color, size) {
    const map = this.map
    for (var i = 0; i < this.routeCircleList.length; i++) {
      // this.routeCircleList[i].setMap(null);
      map.removeLayer(this.routeCircleList[i])
    }

    this.routeCircleList = []
    for (var i = 0; i < points.length; i++) {
      const circle = L.circle([points[i].lat, points[i].lng], { radius: size, color: color })
      circle.addTo(map)
      /* const circle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map,
        center: points[i],
        radius: size
      }); */
      this.routeCircleList[i] = circle
    }
  }

  /*
  drawRectArray(rectArray,rectDim)
  {
    var i=0;
    var map = this.map;

      for(i=0;i<this.rectList.length;i++)
      {
        //this.rectList[i].setMap(null);
        map.removeMarker(this.rectList[i]);
      }
      this.rectList=[];
      for(i=0;i<rectArray.length;i++)
      {
        var rectCoords = [
           { lat:rectArray[i][0]-rectDim, lng: rectArray[i][1]-rectDim },
           { lat: rectArray[i][0]-rectDim, lng: rectArray[i][1]+rectDim  },
           { lat: rectArray[i][0]+rectDim, lng:  rectArray[i][1]+rectDim },
           { lat: rectArray[i][0]+rectDim, lng:  rectArray[i][1]-rectDim },
         ];

          var rectangle = new google.maps.Polygon({
            paths: rectCoords,
            strokeColor: "#FF0000",
            strokeOpacity: 0.2,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35
          });
          rectangle.setMap(map);
          this.rectList.push(rectangle);
        }

  } */
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

      /* const circle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map,
        center: points[i],
        radius: size
      }); */
      this.trailCircleList[i] = circle
    }
  }
}

module.exports = { LeafContainer }
