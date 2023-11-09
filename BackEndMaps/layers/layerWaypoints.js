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





// Get all Waypoints
const GetWaypoints = (request, response, next) => {
  // Capa waypoints
  const queryWaypoint = 'select waypoints.id, estacionwaypoints.fkestacionid, lat, lng from waypoints inner join estacionwaypoints  on waypoints.id = estacionwaypoints.fkwaypointid;'

  // retorna la consulta
  pool.query(queryWaypoint, (err, res) => {
    if (err) {
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    const geojson = GeoJSON.parse(res.rows, { Point: ['lat', 'lng'] })
    response.json(geojson)
  })
}

// Waypoints by station
const GetWaypointsByID = (request, response) => {
  const id = parseInt(request.params.id)

  const texto = `select row_number() over(order by w.lat,w.lng) as num,w.id,w.lat,w.lng from waypoints w,estacionwaypoints t,estacion e
    where w.id = t.fkwaypointid
    and e.id=t.fkestacionid
    and e.id=${id}
      order by w.lat,w.lng;`
  pool.query(texto, (err, res) => {
    if (err) {
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    // let geojson = GeoJSON.parse(res.rows,{Point:['lat', 'lng']});
    response.status(200).json(res.rows)
  })
}

// Inserta Waypoints
const InsertWaypoints = (request, response) => {
  const {lat, lng} = request.body;
  const sql = `Insert into waypoints ( lat, lng) values (${lat}, ${lng});`
  console.log(sql);
  pool.query(sql, (error, result) => {
    if (error) {
      // throw new Error (error)
      console.error(error)
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    response.status(201).json({ message: 'Waypoint agregado correctamente' })
  })
}

// Retorna los id de los waypoint insertados
const RetornaId = (request, response) => {
  // const total = parseInt(request.params.total)
  const sql = 'Select max(id) as id from waypoints;'

  pool.query(sql, (error, res) => {
    if (error) {
      console.error(error)
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    console.log(res.rows)
    response.status(201).json(res.rows)
  })
}

// Relaciona waypoint con estación
const RelacionaWaypoint = (request, response) => {
  const { fecha, estacion, waypoint } = request.body
  const sql = `insert into estacionwaypoints(updated, fkestacionid, fkwaypointid) values ('${fecha}',${estacion}, ${waypoint});`
  pool.query(sql, (error, result) => {
    if (error) {
      console.error(error)
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    response.status(201).json({ message: 'Waypoint added successfully', status: 201 })
  })
  console.log(sql)
}

// Elimina waypoints
const DeleteWaypoints = (request, response) => {
  const id = parseInt(request.params.id)
  const sql = `delete from waypoints where id = ${id};`
  pool.query(sql, (error, result) => {
    if (error) {
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    response.status(200).json({ message: 'Waypoint removed successfully', status: 200 })
  })
}
// Elimina relación waypoint con estacion
const DeleteWaypointStation = (request, response) => {
  const id = parseInt(request.params.id)
  const sql = `delete from estacionwaypoints where fkwaypointid = ${id};`
  console.log(sql)
  pool.query(sql, (error, result) => {
    if (error) {
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    response.status(200).json({ message: 'Waypoint removed successfully', status: 200 })
  })
}

// Elimina conexiones relacionadas al waypoint a eliminar
const DeleteConnectionWaypoints = (request, response) => {
  const id = parseInt(request.params.id)
  const sql = `delete from conexion where inicioid =${id} or finalid= ${id};`
  pool.query(sql, (error, result) => {
    if (error) {
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    response.status(200).json({ message: 'Waypoint removed successfully', status: 200 })
  })
}

const RemoveWaypoint = (request, response) => {
  const { idwaypoint } = request.query
  const sql = `
       delete from estacionwaypoints where fkwaypointid = ${idwaypoint};
       delete from edge_table where fkconnectionid in(

           select id from conexion where  inicioid =${idwaypoint} or finalid= ${idwaypoint}
       );
       delete from conexion where inicioid =${idwaypoint} or finalid= ${idwaypoint};
       delete from waypoints where id = ${idwaypoint};
       `
  pool.query(sql, (error, result) => {
    if (error) {
      console.error(error)
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    // response.send(result);
    response.status(201).json({ message: 'Waypoint removed successfully', status: 201 })
  })
  console.log(sql)
}

// Connection.html
async function getWaypoints (req, res) {
  // const result =  await sqlPostgres`select * from waypoints`;

  // const cuad = req.query.cuad;
  // const cuadLng = req.query.cuadLng;
  // const dist_cuadrante = req.query.dist_cuadrante;
  const estacionid = req.query.idestacion

  // const result = await sqlPostgres `

  const sql = `select row_number() over(order by w.lat,w.lng) as num,w.id,w.lat,w.lng from waypoints w,estacionwaypoints t,estacion e
      where w.id = t.fkwaypointid
      and e.id=t.fkestacionid
      and e.id=${estacionid}
	    order by w.lat,w.lng`

  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    console.log(resquery)
    res.send(resquery.rows)
    //  let geojson = GeoJSON.parse(res.rows,{Point:['lat', 'lng']});
    // console.log(res.rows);
    // response.json(geojson);
  })

  /* select w.id, w.lat, w.lng from waypoints w,estacionwaypoints t,estacion e
      where w.id = t.fkwaypointid
      and e.id=t.fkestacionid
      and e.id=1;`;
      and w.lat >= e.lat + (${cuadLat} * 0.01) and w.lat <= e.lat + ((${cuadLat}+1) * 0.01)
      and w.lng >= e.lng + (${cuadLng} * 0.01) and w.lng <= e.lat + ((${cuadLng}+1) * 0.01);`; */

  /*  const sql =`select w.id, St_Y(w.coordenadawaypoint) as lat, St_X(w.coordenadawaypoint) as lng from waypoints w,estacionwaypoints t,estacion e
      where w.id = t.fkwaypointid
      and e.id=t.fkestacionid
      and e.id=${estacionid}
      and st_Y(w.coordenadawaypoint) >= st_Y(e.estacioncoordenada) + (${la} * ${dist_cuadrante})
      and st_X(w.coordenadawaypoint)>= st_X(e.estacioncoordenada) + (${lg} * ${dist_cuadrante});` */

  //  console.log(result);

  //  const result = await sql `${sql}`;

  // array.push(la + ',' + lg);

  //  }
  // console.log(array);
  // res.send(JSON.stringify(array));
  // res.send(sql);
  // const result = await sql `call agrega_recorrido(${this.uidvehiculo},${pointArrayString},${timeArrayString},${this.payloaduid},${this.teleoperadoruid},'${this.inicioString}','${this.destinoString}',${this.hashid})`;
}

const waypoints = (req, res) => {
  const result = getWaypoints(req, res)
}

const CreaWaypoint = (req, res) => {
  const {id, lat, lng} = req.params;
  console.log(id, lat, lng)

  const sql = `Insert into waypoints (waypointupdate, lat, lng) values (Now(),${lat}, ${lng});
                 insert into estacionwaypoints(updated, fkestacionid, fkwaypointid)
                Select now(),${id}, max(id) as id from waypoints;

                Select  max(id) as id from waypoints;`

  console.log(sql)
  pool.query(sql, (error, result) => {
    if (error) {
      // throw new Error (error)
      console.error(error)
      return console.status(401).error({ message: 'Error executing the query', status: 401 })
    }
    // console.log(result.rows);
    res.send(result[2].rows)// return last command result
  })

}

module.exports = { GetWaypoints, GetWaypointsByID, InsertWaypoints, RetornaId, RelacionaWaypoint, DeleteWaypoints, DeleteWaypointStation, DeleteConnectionWaypoints, RemoveWaypoint, waypoints, CreaWaypoint }
