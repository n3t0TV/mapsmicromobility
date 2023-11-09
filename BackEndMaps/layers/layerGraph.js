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

const generateGraph = (req, res) => {
  const idestacion = req.query.idestacion

  console.log('Generating graph (map server)')

  const sql = `

    delete from edge_table;
    delete from edge_table_vertices_pgr;
    insert into edge_table(cost, reverse_cost,x1, y1, x2, y2,fkconnectionid)

     select cinicio.tiempo,cinicio.tiempo,iniciolat,iniciolng,finallat,finallng,cinicio.id
     from
     (
     select distinct c.id,w.lat as iniciolat,w.lng as iniciolng,c.tiempo
       from waypoints as w,conexion as c,estacionwaypoints as ew,estacion as e
       where w.id=ew.fkwaypointid and
       e.id=${idestacion} and
       w.id = c.inicioid
     ) as cinicio
     left join
     (
     select c.id,w.lat as finallat,w.lng as finallng
       from waypoints as w,conexion as c,estacionwaypoints as ew,estacion as e
       where w.id=ew.fkwaypointid and
       e.id=${idestacion} and
       w.id = c.finalid
     ) as cfinal
     on cinicio.id=cfinal.id;

    UPDATE edge_table SET the_geom = st_makeline(st_point(x1,y1),st_point(x2,y2)),
    dir = CASE WHEN (cost>0 AND reverse_cost>0) THEN 'B'   -- both ways
               WHEN (cost>0 AND reverse_cost<0) THEN 'FT'  -- direction of the LINESSTRING
               WHEN (cost<0 AND reverse_cost>0) THEN 'TF'  -- reverse direction of the LINESTRING
               ELSE '' END;                                -- unknown

     SELECT pgr_createTopology('edge_table',0.00001);

     `

  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    //  let geojson = GeoJSON.parse(res.rows,{Point:['lat', 'lng']});
    // console.log(res.rows);
    // response.json(geojson);
    res.send(resquery.rows)
  })
}

module.exports = { generateGraph }
