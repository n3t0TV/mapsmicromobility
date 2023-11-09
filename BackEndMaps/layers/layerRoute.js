const Pool = require('pg').Pool
const GeoJSON = require('geojson')

// Connection to DB
const client = require('../config')
const decodePolyline = require('decode-google-map-polyline')
const fetch = require('node-fetch')

// New pool object
const pool = new Pool
({
  user: client.user,
  host: client.host,
  database: client.database,
  password: client.password,
  port: client.port
})

async function requestRouteGmaps (origin, destination) {
  // Gmap api key
  const maps_key = 'AIzaSyCJyy0QydbY2IV2kJDxtOS_T1yiDA-V0cw'
  try {
    directionPromise = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${maps_key}&units=metric`)

    return directionPromise
  } catch (error) {
    console.log(error)
  }
}

const requestRoute = async (req, res) => {
  // console.log(req.query);
  const prom = requestRouteGmaps(req.query.origin, req.query.destination)

  prom.then(res => res.json())
    .then(json => {
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

const internalRoute = async (request, response) => {
  const req = request
  const res = response
  const start = req.query.start
  const end = req.query.end
  if (start != null && end != null) {
    console.log('Start: ' + JSON.stringify(req.query.start))
    console.log('End: ' + JSON.stringify(req.query.end))
    const sql = `
        with cs as(
        select et.source as vi,et.x1,et.y1, sqrt(power((et.x1-(${start.lat})),2)+power((et.y1-(${start.lng})),2)) as wdist
        from edge_table et
        order by wdist
        limit 1
        ),
        ce as
        (
        select et.source as vi,et.x1,et.y1, sqrt(power((et.x1-(${end.lat})),2)+power((et.y1-(${end.lng})),2)) as wdist
        from edge_table et
        order by wdist
        limit 1
        ),
        ed as
        (
        select *
        from
        cs,ce,
        lateral pgr_dijkstra (
        'SELECT * FROM edge_table'::text,
        cs.vi,
        ce.vi,
        false
      )),
      nodelist as
      (
         select ed.node,ST_X(etv.the_geom ) as lat,ST_Y(etv.the_geom ) as lng from
           ed,edge_table_vertices_pgr etv where ed.node =etv.id
      ),
      wplist as
      (
            select row_number() over (order by(select null)) as num,w.id,lag(w.id) over (order by(select null)) as previd,w.lat,w.lng from nodelist, waypoints w
        where w.lat=nodelist.lat and w.lng=nodelist.lng
      )
      select * from
      (
        select w.num,w.id,w.previd,w.lat,w.lng,null as puntos
        from wplist w where w.previd is null
        union
        (
        select  w.num,w.id,w.previd,w.lat,w.lng,c.puntos
        from wplist w,conexion c
        where
        (c.inicioid=w.previd and c.finalid=w.id) or (c.inicioid=w.id and c.finalid=w.previd))
      ) route
      order by route.num;

        `

    pool.query(sql, (err, resquery) => {
      if (err) {
        res.status(500).send()
        return console.error('Error al ejecutar la consulta', err.stack)
      }

      res.send(resquery.rows)
    })
  } else {
    res.status(204).send()
  }
}

module.exports = { internalRoute, requestRoute }
