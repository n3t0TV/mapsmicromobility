// intialization modules
const Pool = require('pg').Pool
const GeoJSON = require('geojson')

// Connection to DB
const client = require('../config')

// New pool object
const pool = new Pool
({
  user: client.user,
  host: client.host,
  database: client.database,
  password: client.password,
  port: client.port
})

const fetch = require('node-fetch')

// Get all connections for the station
const GetConexion = (request, response) => {
  const idestacion = parseInt(request.params.id)
  const sql = `

    with wpestacion as
    (
        select w.id from waypoints w,estacionwaypoints ew
        where ew.fkestacionid=${idestacion} and fkwaypointid=w.id
    ),
    constart as
    (
        select con.id,con.distancia,con.tiempo,con.puntos,con.inicioid,con.conexiontipo,w.lat,w.lng
        from conexion con,waypoints w,wpestacion
        where con.inicioid=w.id and w.id=wpestacion.id
    ),
    conend as
    (
        select con.id,con.finalid,w.lat,w.lng from conexion con,waypoints w,wpestacion
        where con.finalid=w.id and w.id=wpestacion.id
    )
    select constart.id,constart.distancia,constart.tiempo,constart.puntos,constart.inicioid,constart.conexiontipo,conend.finalid,constart.lat as startlat,constart.lng as startlng,conend.lat as endlat, conend.lng as endlng
    from constart,conend
    where constart.id=conend.id;
    `
  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    // console.log(resquery);
    response.send(resquery.rows)
    // let geojson = GeoJSON.parse(resquery.rows,{:['lat', 'lng']});
    // console.log(res.rows);
    // response.json(geojson);
  })
}

// request route to gmap
async function requestRoute (origin, destination) {
  // Gmap api key
  const maps_key = 'AIzaSyCJyy0QydbY2IV2kJDxtOS_T1yiDA-V0cw'
  try {
    directionPromise = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${maps_key}&units=metric`)

    return directionPromise
  } catch (error) {
    console.log(error)
  }
}

const ActualizaTiempo = (req, res) => {
  const idconexion = req.query.idconexion
  const tiempo = req.query.tiempo

  const sql = `
    update conexion set tiempo=${tiempo} where id=${idconexion};

  `
  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    // console.log(resquery);
    res.send(resquery.rows)
    // let geojson = GeoJSON.parse(resquery.rows,{:['lat', 'lng']});
  // console.log(res.rows);
    // response.json(geojson);
  })
}

// Generate the new connection
const Getnewconnection = (req, res) => {
  const origin = ({ lat: req.params.originlat, lng: req.params.originlng })
  const destination = ({ lat: req.params.destinationlat, lng: req.params.destinationlng })
  console.log(origin, destination)
  const prom = requestRoute(origin, destination)
  prom.then(res => res.json())
    .then(json => {
      const decodePolyline = require('decode-google-map-polyline')
      // var polyline = 'neuaEejkbUEGc@j@PXl@p@P\\a@f@GHyDtEgC`DoCfDzHbQp@rAbH`JdBtBrCjDn@p@dDbDfIvHfD~CrK~Jo@z@uCrDmJnL}^ld@mVjZmQrTgArAFJ';
      console.log(json)
      if (json.status == 'OK') {
        if (json.routes.length > 0) {
          const polylineencoded = json.routes[0].overview_polyline.points
          const routeArray = decodePolyline(polylineencoded)
          const dist = json.routes[0].legs[0].distance.text

          const jsonResult = { distance: dist, points: routeArray }
          console.log(jsonResult)
          // result.routes[0].legs[0].distance.text
          res.send(jsonResult)
        } else {
          res.send([])
        }
      } else {
        res.send([])
      }
    })
}

// Insert the new connection into the BD
/*
const saveConnections= (req, resp) =>{

  //  const{idBegin, idEnd, distanceMeters, pointsString}= req.query;
  console.log('body: '+JSON.stringify(req));
//  console.log('query: '+ JSON.stringify(req.query));
  var params = JSON.parse(req.query);
  const idBegin = params.idBegin;
  const idEnd = params.idEnd;
  const distanceMeters = params.distanceMeters;
  const pointsString =params.points;

    var p = JSON.stringify(pointsString);
    console.log(p);
    var sql =  `
    insert into conexion(inicioid, finalid,distancia,puntos)
    select ${idBegin},${idEnd},${distanceMeters},'${p}'
    where not exists
    (
      select id from conexion where inicioid=${idBegin} and finalid=${idEnd}
    )
    and not exists
    (
      select id from conexion where inicioid=${idEnd} and finalid=${idBegin}
    ) `;
    console.log(sql);
    pool.query(sql,(err,resquery)=>
    {
        if(err)
        {
            return console.error("Error al ejecutar la consulta",err.stack)
        }
        resp.send("Success");

    })
} */

// Delete connection
const deleteConnection = (req, res) => {
  const idconexion = req.query.idconexion

  const sql = `

    delete from edge_table where fkconnectionid=${idconexion};
    delete from conexion where id=${idconexion}`
  console.log(sql)
  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    console.log(resquery)
    res.send(resquery.rows)
  })
}

module.exports = { GetConexion, Getnewconnection, deleteConnection, ActualizaTiempo }
