
// intialization modules
const Pool = require('pg').Pool;
const turf = require('@turf/turf');

// Connection to DB
const client = require('../config');

// New pool object
const pool = new Pool
({
  user: client.user,
  host: client.host,
  database: client.database,
  password: client.password,
  port: client.port
})
    const requestStation = (request, response) =>
    {
        const lat = request.params.lat;
        const lng = request.params.lng;
        var estaciones = [];
        const query = `Select id, lat, lng from estacion order by id;`
        pool.query(query,(err,res)=>{
            if(err)
            {
                response.status(401).json({ error, message: 'Operation failed to execute' })
            }
            const lista = JSON.stringify(res.rows);
            let l = JSON.parse(lista);
            for(var i = 0; i< l.length; i++)
            {
                          let estacion = turf.point([l[i].lng, l[i].lat],{"id":l[i].id});
                           estaciones.push(estacion);
           }
            let points = turf.featureCollection(estaciones);
           let target = turf.point([lng, lat]);
           let nearpoint = turf.nearestPoint(target,points);
           station = nearpoint.properties.id;
            response.status(200).json(station)
        })

           
    } 

    const requestWayPoint = (request, response) =>
    {
        const lat = request.params.lat;
        const lng = request.params.lng;
        var waypoints = [];
        const query = `Select lat, lng, id from waypoints;`
        pool.query(query,(err,res)=>{
            if(err)
            {
                response.status(401).json({ error, message: 'Operation failed to execute' })
            }
            const lista = JSON.stringify(res.rows);
            let l = JSON.parse(lista);
            for(var i = 0; i< l.length; i++)
            {
                          let point = turf.point([l[i].lng, l[i].lat],{"id":l[i].id});
                          waypoints.push(point);
           }
            let points = turf.featureCollection(waypoints);
           let target = turf.point([lng, lat]);
           let nearpoint = turf.nearestPoint(target,points);
            response.status(200).json(nearpoint)
        })

           
    } 

module.exports = {requestStation, requestWayPoint}