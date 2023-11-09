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

const getRecorrido = async (request, response) => {
  const req = request
  const res = response
  const idviaje = req.query.idviaje

  if (idviaje != null) {
    const sql = `select recorridopuntos from recorrido where idviaje=${idviaje} order by id`

    pool.query(sql, (err, resquery) => {
      if (err) {
        res.status(500).send()
        return console.error('Error al ejecutar la consulta', err.stack)
      }
      //  let geojson = GeoJSON.parse(res.rows,{Point:['lat', 'lng']});
      // console.log(res.rows);
      // response.json(geojson);
      res.send(resquery.rows)
    })
  } else {
    console.log('Missing parameter!')
    res.status(204).send()
  }
}

module.exports = { getRecorrido }
