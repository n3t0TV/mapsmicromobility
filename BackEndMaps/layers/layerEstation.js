// intialization modules
const Pool = require('pg').Pool
const { response } = require('express')
const GeoJSON = require('geojson')

// Connection to DB
const client = require('../config')
const { request } = require('../mqtt/VehicleBridge')

// New pool object
const pool = new Pool
({
  user: client.user,
  host: client.host,
  database: client.database,
  password: client.password,
  port: client.port
})

// Selecciona todas las estaciones
const GetEstaciones = async (req, res) => {
  const query = 'Select id, estacionnombre as nombre, estaciondireccion as direccion, estacioncoordenada as coordenadas, St_X(estacioncoordenada)as lng, St_Y(estacioncoordenada)as lat, estacionactiva from estacion where estacionactiva = true order by id;'

  // Retorna la consulta
  const response = await pool.query(query)
  res.status(201).json(response.rows)
}

// Selecciona estacion especifica
const GetEstacionesByID = (request, response) => {
  const id = parseInt(request.params.id)
  const sentencia = `Select id, estacionnombre as nombre, estaciondireccion as direccion, estacioncoordenada as coordenadas, St_X(estacioncoordenada)as lng, St_Y(estacioncoordenada)as lat from estacion where id = ${id};`
  console.log(sentencia)

  pool.query(sentencia, (err, res) => {
    if (err) {
      response.status(401).json({ error, message: 'Operation failed to execute' })
    }

    const resultado = res.rows
    console.log(resultado)
    response.json(resultado)
  })
}


// Actualiza estacion
const ActualizaEstacion = (request, response) => {
  console.log(request.body)
  const { id, nombre, direccion, fecharegistro, coordenadas, latitud, longitud } = request.body
  const sql = `UPDATE estacion  SET estacionnombre= '${nombre}', estaciondireccion='${direccion}',  estacionregistro='${fecharegistro}', estacioncoordenada=${coordenadas}, lat= ${latitud}, lng= ${longitud} WHERE id = ${id};`
  console.log(sql)
  pool.query(sql, (error, result) => {
    if (error) {
      // throw new Error (error)
      console.error(error)
      response.status(401).json({ error, message: 'Operation failed to execute' })
    }
    response.status(201).json({ message: 'Station updated successfully' })
  })
}

//dar debaja una estacion
const StationDown = (request, response)=>
{
   const id = parseInt(request.params.id);
   const activa = false;
   const sql = `Update estacion set estacionactiva = ${activa} where id = ${id} `;
   pool.query(sql, (error, result) => {
    if (error) {
      console.error(error)
      response.status(401).json({ error, message: 'Operation failed to execute', status: 401 })
    }
    response.status(200).json({ message: 'Station removed successfully', status: 200 })
  })
}

// Elimina estacion
const EliminaEstacion = (request, response) => {
  const id = parseInt(request.params.id)
  const sql = `delete from estacion where id = ${id};`
  pool.query(sql, (error, result) => {
    if (error) {
      console.error(error)
      response.status(401).json({ error, message: 'Operation failed to execute', status: 401 })
    }
    response.status(200).json({ message: 'Station removed successfully', status: 200 })
  })
}

// Elimina asociación de estación y waypoints
const EliminaEstacionWaypoints = (request, response) => {
  const id = parseInt(request.params.id)
  const sql = `delete from estacionwaypoints where fkestacionid =${id};`
  pool.query(sql, (error, result) => {
    if (error) {
      console.error(error)
      response.status(401).json({ error, message: 'Operation failed to execute', status: 401 })
    }
    response.status(200).json({ message: 'Associated waypoints have been deleted', status: 200 })
  })
}


//Consulta poligono por estacion
const GetPoligono = (request, response) =>{
  console.log(request.params.id)
  const id = parseInt(request.params.id)
  const sql = `Select id, puntos from polygonstation where fkidestacion= ${id};`
  pool.query(sql, (error, result)=>{
    if(error)
    {
      response.status(401).json({ error, message: 'Operation failed to execute', status: 401 })
    }
    response.status(200).json(result.rows);
  })

}



module.exports = {
  GetEstaciones,
  GetEstacionesByID,
  ActualizaEstacion,
  EliminaEstacion,
  EliminaEstacionWaypoints,
  GetPoligono,
  StationDown
}
