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


//Get ramps
const GetRamps = (request, respones) =>{
   //const id = parseInt(request.params.id)
   const sql = "Select id, lat, lng, type from ramps;"
    pool.query(sql,(err, res)=>{
        if(err)
        {
            return console.status(401).error({ message: 'Error executing the query', status: 401 }) 
        }
    response.status(200).json(res.rows);
    })
}





module.exports = {GetRamps}