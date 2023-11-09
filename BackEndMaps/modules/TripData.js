
console.log('Loading Db configuration')
// const config = require('../config/config.js');
const postgres = require('postgres')
// const sql = postgres(config());
const stringHash = require('string-hash')
const Pool = require('pg').Pool
const client = require('../config')
const isNullOrUndefined = value => value === null || value === undefined

const pool = new Pool
({
  user: client.user,
  host: client.host,
  database: client.database,
  password: client.password,
  port: client.port
})

/*
async function postgresAsyncCall(lat, lon,timestamp) {
  console.log('calling');

  const result = await sql`call agrega_recorrido(2,'{"(20.12,-99.23)","(19.90,-99.43)"}','{1519129853500,151912985350123}',2456,2,'(20.12,-99.23)','(19.90,-99.43)',582873593)`;
  console.log(result);

  // expected output: "resolved"
} */
// Gets data from DB and exports it as GPX data structure
class TripData {
  constructor (_uidvehiculo) {
    this.tripPointArray = []
    this.tripTimeArray = []
    this.uidvehiculo = _uidvehiculo
    this.tripStarted = false

    //  this.payloadid=_payloadid;
  }

  startTrip (_iniciogps, _destinogps, _routeid, state) {
    this.tripStarted = true// Make sure start clean
    this.saveDeliveryDatabase(_iniciogps, _destinogps, state, _routeid)
    this.tripPointArray = []
    this.tripTimeArray = []
    // this.payloaduid=_payloaduid;
    //  this.teleoperadoruid=_teleoperadoruid;
    this.iniciogps = _iniciogps
    this.destinogps = _destinogps
    this.routeid = _routeid

    this.hashid = stringHash('[' + JSON.stringify(this.iniciogps) + ',' + JSON.stringify(this.destinogps) + ']')
    // this.uidvehiculo


    // Registrar nuevo recorrido en BD

  }

  endTrip () {
    this.tripStarted = false
    // Registrar fin de recorrido
    this.saveTripDatabase()
    // clean after saving in DB
    this.tripPointArray = []
    this.tripTimeArray = []
  }

  updateDelivery (deliveryData) {
    console.log('Updating delivery')
    console.log(deliveryData.route)

    const _vehicleid = deliveryData.vehicle.uid
    const _imei = deliveryData.vehicle.imei
    //  var _payloadid = deliveryData['delivery']['uid'];
    //  var _teleopid=null;
    //  if(!isNullOrUndefined(deliveryData['teleop']))
    //  _teleopid = deliveryData['teleop']['uid'];

    // console.log(deliveryData['route']['origin'])
    const _routeid = deliveryData.route.uid

    var _iniciogps = null
    if (!isNullOrUndefined(deliveryData.route.origin)) { var _iniciogps = { lat: deliveryData.route.origin.lat, lon: deliveryData.route.origin.lng } }
    var _destinogps = null
    if (!isNullOrUndefined(deliveryData.route.destination)) { var _destinogps = { lat: deliveryData.route.destination.lat, lon: deliveryData.route.destination.lng } }

    if (!isNullOrUndefined(deliveryData.delivery) && deliveryData.delivery == false)// teleoperation test
    {
      console.log('Saving test trip')
      const _status = deliveryData.route.status
      if (_status != null && _iniciogps != null && _destinogps != null && _routeid != null) {
        if (_status.toString() == '6') {
          console.log('Teleop started!')
          this.startTrip(_iniciogps, _destinogps, _routeid, 'Teleoperation')
        } else if (_status.toString == '7') {
          console.log('Closed!')
          this.endTrip()
        }
      } else {
        console.log('Null parameters in json')
      }
    } else {
      const state = deliveryData.delivery.status

      if (state == 'PICKUP') {
        console.log('Pick up in store')
        // Standby waiting for request
      } else if ('ON ROUTE') {
        console.log('On route!')
        this.startTrip(_iniciogps, _destinogps, _routeid, state)
      } else if (state == 'DROP OFF') {
        console.log('Drop off!')
        this.endTrip()
      } else if (state == 'RETURN TRIP') {
        console.log('Return trip!')
        this.startTrip(iniciogps, destinogps, routeid, state)
      } else if (state == 'CLOSED') {
        console.log('Closed!')
        this.endTrip()
      }
    }
    /*  {
        delivery: { uid: 2695, status: 'CLOSED' },
        vehicle: { uid: 608, imei: '276001251151037' },
        route: {
          uid: '10654',
          origin: { lat: 36.0732, lng: -94.1752 },
          destination: { lat: 36.0686895, lng: -94.1748471 }
        },
        teleop: { uid: '2' }
      } */

    /*
    {
        delivery: false,
        vehicle: { uid: 630, imei: '378117346574477' },
        route: { uid: 11000, origin: [Object], destination: [Object], status: 6 }
        }
      */

    console.log('Updating delivery data')
    console.log(deliveryData)
  }

  addGPSPoint (gps, timestamp) {
    // console.log('Adding gps');
    if (this.tripStarted) {
      console.log('Adding to array')
      this.tripPointArray.push(gps)
      this.tripTimeArray.push(timestamp)

      console.log('GPS vehicle: ' + gps)
      if (gps.lat != 0 && gps.lon != 0 && !isNullOrUndefined(this.routeid)) {
        console.log('****GPS near waypoint***')
        const sql = `

        update referencepoints
        set timestamp = now()
        where  idviaje=${this.routeid}
        and   calculate_distance(${gps.lat}, ${gps.lon},lat,lng, 'K')<0.02
        and timestamp is null;

        `
        // console.log(sql);
        pool.query(sql, (err, resquery) => {
          if (err) {
            return console.error('Error al ejecutar la consulta', err.stack)
          }
          // console.log(resquery);
          // res.send(resquery.rows);
          //  let geojson = GeoJSON.parse(res.rows,{Point:['lat', 'lng']});
          // console.log(res.rows);
          // response.json(geojson);
        })
      }
    }
  }

  /* stringFromPoint(point)
  {
    var pointString ='';

    pointString = `POINT(`;
    pointString += point.lon+' '+point.lat;
    pointString+=`)`;

    return pointString;
  }

  geometryFromPointArray()
  {
    //'GEOMETRYCOLLECTION(POINT(2 0),POLYGON((0 0, 1 0, 1 1, 0 1, 0 0)))'
    var pointArrayString=`GEOMETRYCOLLECTION(`;

    this.tripPointArray.forEach((point, i) => {
      if(i>0)
        pointArrayString+=`,POINT(`;
      else
        pointArrayString+=`POINT(`;

      pointArrayString+=point.lon+" "+point.lat;
      pointArrayString+=`)`;

    });
    pointArrayString+=`)`;

    return pointArrayString;
  } */

  /*  stringFromPointArray()
  {
    var pointArrayString=`{`;

    this.tripPointArray.forEach((point, i) => {
      if(i>0)
        pointArrayString+=`,"(`;
      else
        pointArrayString+=`"(`;

      pointArrayString+=point.lon+","+point.lat;
      pointArrayString+=`)"`;

    });
    pointArrayString+=`}`;

    return pointArrayString;

  } */

  /* stringFromTimeArray()
  {
    var timeArrayString=`{`;

    this.tripTimeArray.forEach((timestamp, i) => {
      if(i>0)
        timeArrayString+=",";
      timeArrayString+=timestamp;

    });

    timeArrayString+=`}`;

    return timeArrayString;
  } */

  async saveDeliveryDatabase (_iniciogps, _destinogps, state, _routeid) {
    // var _operator_name='Tortoise pruebas'; 
    
    // var _station_id = '1';

    console.log('Guardando viaje y ref points: ')
    // var _request_id=1800;
    // registrar_payload(2,'Tortoise pruebas','direccion A','direccion B',1)

    //  console.log(`call registrar_payload(${_payloaduid},'POINT('${_iniciogps.lon},${_iniciogps.lat})','POINT(${_destinogps.lon},${_destinogps.lat})',${_station_id})`);
    /* var query = `
    insert into viajes(viajeinicio,viajedestino,payloadid,estacionid,viajetipo,viajeregistro)
    values(ST_PointFromText('POINT(${_iniciogps.lon} ${_iniciogps.lat})',4326),ST_PointFromText('POINT(${_destinogps.lon} ${_destinogps.lat})',4326),${_payloaduid},${_station_id},'Drop off',now());

    `; */
    const sql = `


      with cs as(
      select et.source as vi,et.x1,et.y1, sqrt(power((et.x1-(${_iniciogps.lat})),2)+power((et.y1-(${_iniciogps.lon})),2)) as wdist
      from edge_table et
      order by wdist
      limit 1
      ),
      ce as
      (
      select et.source as vi,et.x1,et.y1, sqrt(power((et.x1-(${_destinogps.lat})),2)+power((et.y1-(${_destinogps.lon})),2)) as wdist
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
    ),

    route as
    (
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
    order by route.num
  ),

  insertedid as (
     insert into viajes(id,iniciolat,iniciolng,destinolat,destinolng,viajetipo,viajeregistro)
     select  ${_routeid},${_iniciogps.lat},${_iniciogps.lon},${_destinogps.lat},${_destinogps.lon},'${state}',now()
     where not exists(select * from viajes where id=${_routeid}) returning id
   )

   insert into referencepoints(idviaje,numpoint,lat,lng)
   select ${_routeid},route.num,route.lat,route.lng
   from route,insertedid
   where insertedid.id=${_routeid};


    `
    //console.log(sql);
    //  console.log(sql);
    pool.query(sql, (err, resquery) => {
      if (err) {
        return console.error('Error al ejecutar la consulta', err.stack)
      }
      console.log(resquery)
      // res.send(resquery.rows);
      //  let geojson = GeoJSON.parse(res.rows,{Point:['lat', 'lng']});
      // console.log(res.rows);
      // response.json(geojson);
    })

    //  insert into viajes(viajeinicio,viajedestino,payloadid,estacionid,viajetipo,viajeregistro)
    //  values(ST_GeomFromText('POINT(${_destinogps.lon} ${_destinogps.lat})',4326),ST_GeomFromText('POINT(${_iniciogps.lon} ${_iniciogps.lat})',4326),${_payloaduid},${_station_id},'Return trip',now());
    // console.log(`insert into viajes(iniciolat,iniciolng,destinolat,destinolng,payloadid,estacionid,viajetipo,viajeregistro)  values(${_iniciogps.lat},${_iniciogps.lon},${_destinogps.lat},${_destinogps.lon},${_payloaduid},${_station_id},'Drop off',now());`);
    // const result = await sql`insert into viajes(iniciolat,iniciolng,destinolat,destinolng,payloadid,estacionid,viajetipo,viajeregistro)  values(${_iniciogps.lat},${_iniciogps.lon},${_destinogps.lat},${_destinogps.lon},${_payloaduid},${_station_id},'Drop off',now());`;
    // const result = await sql`call registrar_payload(${_payloaduid},'POINT('${_iniciogps.lon},${_iniciogps.lat})','POINT(${_destinogps.lon},${_destinogps.lat})',${_station_id})`;
    // const result = await sql `call agrega_recorrido(${this.uidvehiculo},${pointArrayString},${timeArrayString},${this.payloaduid},${this.teleoperadoruid},'${this.inicioString}','${this.destinoString}',${this.hashid})`;
    // console.log(result);
  }

  async saveTripDatabase () {
    if (this.tripPointArray.length > 0) {
      // var pointArrayString = this.geometryFromPointArray();
    //  var timeArrayString = this.stringFromTimeArray();
    //  var inicioString = this.stringFromPoint(this.iniciogps);
      // var destinoString = this.stringFromPoint(this.destinogps);
      const tripArray = []

      for (let i = 0; i < this.tripPointArray.length; i++) {
        tripArray.push({ lat: this.tripPointArray[i].lat, lng: this.tripPointArray[i].lon, timestamp: this.tripTimeArray[i] })
      }
      const puntosStr = JSON.stringify(tripArray)
      //  console.log(pointArrayString);
      //  console.log(timeArrayString);

      const sql = `insert into recorrido(recorridoregistro,idviaje,recorridopuntos)
      values(now(),${this.routeid},'${puntosStr}')`

      //  console.log(sql);
      // var sql = `insert into recorrido(recorridoregistro) values(now(),${},)`;

      pool.query(sql, (err, resquery) => {
        if (err) {
          return console.error('Error al ejecutar la consulta', err.stack)
        }
        console.log(resquery)
        //  res.send(resquery.rows);
      })

      // console.log(result);
    } else {
      console.log('Nothing to save...')
    }
  }
}

// const result =  sql`call inserta_recorrido('{"(36.06840166666667,-94.16597)"}','{1624999786583}')`;
// console.log(result);

// postgresAsyncCall();/
/*
var testTrip = new TripData(2);
testTrip.startTrip(2456,2,{
  lat: Number(20.12),
  lon: Number(-99.50)
},{
  lat: Number(21.56),
  lon: Number(-99.70)
},1801,'Teleoperation test');

testTrip.addGPSPoint({
  lat: Number(20.12),
  lon: Number(-99.50)
},1519129853500);

testTrip.addGPSPoint({
  lat: Number(21.56),
  lon: Number(-99.70)
},151912985350123);

testTrip.endTrip();
*/
module.exports = TripData
