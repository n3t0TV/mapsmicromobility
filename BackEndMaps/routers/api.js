// Import packages
const { response, request } = require('express')
const express = require('express')
const datos = require('../layers/layerEstation')
const waypoints = require('../layers/layerWaypoints')
const conexion = require('../layers/layerConexion')
const route = require('../layers/layerRoute')
const recorrido = require('../layers/layerRecorrido')
const graph = require('../layers/layerGraph')
const ramps = require('../layers/layerRamps');
const markers = require('../layers/layerMarkers');
const station = require('../layers/mapTurf');
const capaBase = require('../layers/layerBase')
const salespoint = require('../layers/layerVending')
const people = require('../layers/layerPeopleDetection')
const product = require('../layers/layerProduct')
// Router
const router = express.Router()

router.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})
// Estaciones
router.get('/estaciones', datos.GetEstaciones)
router.get('/estaciones.geojson/:id', datos.GetEstacionesByID)
router.put('/actualizaestacion', datos.ActualizaEstacion)
router.put ('/actualizaestacion/:id',datos.StationDown)
router.delete('/eliminaestacion/:id', datos.EliminaEstacion)
// Waypoints
router.get('/waypoints.geojson', waypoints.GetWaypoints)
router.get('/waypoints/:id', waypoints.GetWaypointsByID)
router.post('/agrega_waypoint', waypoints.InsertWaypoints)
router.post('/relacionawaypoint', waypoints.RelacionaWaypoint)

router.get('/creawaypoint/:id/:lat/:lng', waypoints.CreaWaypoint)
router.get('/retornaid', waypoints.RetornaId)
router.delete('/eliminaestacionwaypoint/:id', datos.EliminaEstacionWaypoints)
router.delete('/eliminawaypointsestacion/:id', waypoints.DeleteWaypointStation)
router.delete('/eliminaconexionwaypoints/:id', waypoints.DeleteConnectionWaypoints)
router.delete('/eliminawaypoint/:idestacion', waypoints.DeleteWaypoints)
router.get('/waypoints/', waypoints.waypoints)
router.get('/removewaypoint', waypoints.RemoveWaypoint)
// Conexiones
router.get('/conexiones/:id', conexion.GetConexion)
router.get('/newconexion/:originlat/:originlng/:destinationlat/:destinationlng', conexion.Getnewconnection)
// router.post('/agregaconexion', conexion.saveConnections);

router.get('/eliminaconexion', conexion.deleteConnection)
router.get('/actualizatiempo', conexion.ActualizaTiempo)
// Rutas
router.get('/internalRoute', route.internalRoute)
router.get('/requestRoute', route.requestRoute)
router.get('/recorrido', recorrido.getRecorrido)
// Graph
router.get('/generateGraph', graph.generateGraph)
//Ramps
//router.get('/ramps', ramps.GetRamps)

//Markers
router.get('/tipoMarkers', markers.getTypesMarkers);
router.get ('/markers/:idestacion', markers.getMarkers);
//Polygons
router.get('/poligono/:id', datos.GetPoligono);
//Station for trip
router.get('/station/:lat/:lng',station.requestStation);
//Near waypoint
router.get('/waypoint/:lat/:lng', station.requestWayPoint);

//Sale mode
router.get('/salespoint', salespoint.GetSalesPoints);
router.get('/salespointregion', salespoint.GetSalesPointRegion);
router.get('/transactions', salespoint.GetTransactionAll);
router.get('/transaction/:id', salespoint.GetTransactionById);
router.get('/wather/:lat/:lng', capaBase.getWather);
router.get('/Address/:lat/:lng',capaBase.getAddress);
router.post('/test/:lat/:lng',capaBase.saveRegionCity);
router.get('/watherall',capaBase.GetAllWather);
router.get('/allProducts',product.GetAllProducts)
router.get('/products', salespoint.ProductAll)
router.get('/customer', salespoint.GetCustomer)
router.get('/datasales/:product', product.getTransctionsByProduct)
router.get('/datasalesDate/:product/:start/:end', product.getTransctionsByProductDate)
//People detection
router.get('/peopledetection.geojson',people.peopledetection)
router.get('/peopledetection.json',people.peopledetectionjson)
module.exports = router
