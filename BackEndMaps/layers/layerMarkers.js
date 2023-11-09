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


const getTypesMarkers=(request, response) =>
{
    const sql = `Select id, type,color from typemarkers order by id;`
    pool.query(sql,(err, res) =>{
        if(err)
        {
            return console.status(401).error({ message: 'Error executing the query', status: 401 }) 
        }
    response.status(200).json(res.rows);
    })
}

const getMarkers = (request, response) =>
{
    const id = parseInt(request.params.idestacion)

    console.log("idestacion:"+id);
    const sql = `Select m.id, m.lat, m.lng, m.fkidtypemarkers, t.color, m.fkidestacion from markers m, typemarkers t where m.fkidtypemarkers = t.id and fkidestacion  = ${id};`
    pool.query(sql, (err, res)=>{
        if(err)
        {
            console.error(err)
            response.status(401).json({ err, message: 'Operation failed to execute', status: 401 })
        }
        response.status(200).json(res.rows);
    })
} 


module.exports = {getTypesMarkers, getMarkers}

