const express = require('express')
const app = express()
const path = require('path')

// const router = express.Router();
const cors = require('cors')
var os = require('os')
const layerRouter = require('./routers/api')

// app.use(express.json());
// app.use(express.urlencoded({extended : true}));
app.use(cors())
app.use('/api', layerRouter);
// const postgres = require('postgres')
// const config = require('./config/config.js');
// const sqlPostgres = postgres(config());
// const fetch = require('node-fetch')
const client = require('./config')
const bodyParser = require('body-parser')
require('colors')

const Pool = require('pg').Pool
const GeoJSON = require('geojson')

const argv = require('./modules/Arguments')

const pool = new Pool
({
  user: client.user,
  host: client.host,
  database: client.database,
  password: client.password,
  port: client.port
})

console.log('Starting VehicleBridge')
const vehicleBridge = require('./mqtt/VehicleBridge.js')
const { param } = require('./routers/api')

const capaBase = require('./layers/layerBase')
const salespoint = require('./layers/layerVending')
const products = require('./layers/layerProduct')
const { request } = require('./mqtt/VehicleBridge.js')
const { response } = require('express')


const PUBLIC_HTML_PATH = ['../FrontEndMaps/public_html']
const PUBLIX_HTML_PATH = ['../publix/dist/publix']
const isNullOrUndefined = value => value === null || value === undefined

const PUBLIC_HTML_ABSOLUTE_PATH = path.join(__dirname, ...PUBLIC_HTML_PATH)
const PUBLIX_HTML_ABSOLUTE_PATH = path.join(__dirname, ...PUBLIX_HTML_PATH)
console.log('Frontend en ' + PUBLIC_HTML_ABSOLUTE_PATH)
console.log('Publix en ' + PUBLIX_HTML_ABSOLUTE_PATH)
app.use('/', express.static(PUBLIC_HTML_ABSOLUTE_PATH))
app.use(express.static(PUBLIX_HTML_ABSOLUTE_PATH))


const tripPublix = (req, res) => {
  res.sendFile(`${PUBLIX_HTML_ABSOLUTE_PATH}/index.html`)
}

app.get('/trip', tripPublix)
//console.log('/', express.static(PUBLIC_HTML_ABSOLUTE_PATH));

// app.use(bodyParser({limit: '512mb'}));
app.use(bodyParser.json({ limit: '512mb' })) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true,
  limit: '512mb'
}))

app.use(bodyParser.json({ type: 'application/*+json' }));

async function saveConnections (req, res) {
  // const result =  await sqlPostgres`select * from waypoints`;

  const connections = req.body
  console.log('Request connections:')
  console.log(req.body.length)

  for (let i = 0; i < req.body.length; i++) {
    const connection = connections[i]

    const pointsString = JSON.stringify(connection.connectionPoints)
    const defaultSpeed = 1.0// Default speed


     const sql = `
      insert into conexion(inicioid, finalid,distancia,puntos,tiempo,fecharegistro,conexiontipo)
      select ${connection.idBegin},${connection.idEnd},${connection.distanceMeters},'${pointsString}',${connection.distanceMeters / defaultSpeed},NOW(),'${connection.conexiontipo}'
      where not exists
      (
        select id from conexion where inicioid=${connection.idBegin} and finalid=${connection.idEnd}
      )
      and not exists
      (
        select id from conexion where inicioid=${connection.idEnd} and finalid=${connection.idBegin}
      );
      select max(id) as id,${connection.distanceMeters / defaultSpeed},${connection.distanceMeters} from conexion;
       `

    pool.query(sql, (err, resquery) => {
      if (err) {
        return console.error('Error al ejecutar la consulta', err.stack)
      }

      res.send(resquery[1].rows)
    })
  }
}


app.post('/newpolygon',(req, res) => {
  const datos = req.body
  console.log(req.body.length)
  const dato = datos[0]
  const puntos = JSON.stringify(dato.puntos)
  console.log(puntos);
  const id = dato.idestacion
  console.log(id);
  const sql = `INSERT INTO polygonstation(puntos, fkidestacion) VALUES ('${puntos}',${id});`
  pool.query(sql,(err, resut)=>{
    if(err)
    {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    res.status(200).json({ message: 'Polygon generated', status: 200 });
  })

})


app.post('/saveConnections', (req, res) => {
  console.log('Saving connections on DB!')
  const result = saveConnections(req, res)
})

app.post('/api/saveRoutePlan', (req, res) => {
  console.log('Saving route plan')

  const routePoints = req.body.routePoints
  const idviaje = req.body.idviaje
  const start = req.body.start
  const end = req.body.end

  let sql = `insert into viajes(id,iniciolat,iniciolng,destinolat,destinolng,viajetipo,viajeregistro)
  select   ${idviaje},${start.lat},${start.lng},${end.lat},${end.lng},'Teleoperation',now()
  where not exists(select * from viajes where id=${idviaje});`

  for (let i = 0; i < routePoints.length; i++) {
  //  routePoins[i];
    sql = sql + `
      insert into referencepoints(idviaje,lat,lng)
      values(${idviaje},${routePoints[i].lat},${routePoints[i].lng});
     `
  }
  //  console.log(sql);
  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    //  let geojson = GeoJSON.parse(res.rows,{Point:['lat', 'lng']});
    // console.log(res.rows);
    // response.json(geojson);
    res.send(resquery.rows)
  })
})

app.get('/getTimestampTrail', (req, res) => {
  const idviaje = req.query.idviaje
  const sql = `with prevtime as
      (
      select id,coalesce( timestamp-(lag(timestamp,1) over(order by id)),'0') as segmenttime from referencepoints
      	where idviaje = ${idviaje}
      )
      select rp.id, rp.timestamp at time zone 'utc+5',pt.segmenttime
      from prevtime pt,referencepoints rp
      where rp.id=pt.id;
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
})

app.get('/getRecorrido', (req, res) => {
  const idviaje = req.query.idviaje

  if (idviaje != null) {
    const sql = `select recorridopuntos from recorrido where idviaje=${idviaje} order by id`

    pool.query(sql, (err, resquery) => {
      if (err) {
        return console.error('Error al ejecutar la consulta', err.stack)
      }

      res.send(resquery.rows)
    })
  } else {
    console.log('Missing parameter!')
  }
})

app.get('/getViajesRecorridos', (req, res) => {
  const sql = `
    select v.id,v.iniciolat,v.iniciolng,v.destinolat,v.destinolng,rec.recorridopuntos from viajes v,recorrido rec where v.id=rec.idviaje;
    `

  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    console.log(resquery)
    res.send(resquery.rows)
  })
})

app.post('/api/newMarkers', (req, res)=>
{
  const lat = req.body.lat
  const lng = req.body.lng
  const type = req.body.type
  const id = req.body.id

  let sql = `insert into markers (lat, lng, fkidtypemarkers, fkidestacion) values (${lat}, ${lng}, ${type}, ${id});`
  pool.query(sql, (err, result) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }

    res.status(200).json(result.rows);
  })
})

app.get('/markers.geojson/:id',(req,res)=>
{
  const id = parseInt(req.params.id)
  const sql = `Select m.fkidestacion, m.lat, m.lng, t.type, t.color from typemarkers as t, markers as m where m.fkidtypemarkers = t.id and m.fkidestacion =${id};`
  pool.query(sql,(err, resquery)=>{
    if(err)
    {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    const geojson = GeoJSON.parse(resquery.rows, { Point: ['lat', 'lng'] })
    res.json(geojson)
  })
});

app.post('/api/newStation',(request, response) => {
  console.log(request.body)
  const { nombre, storeid, direccion, fecharegistro, geografico, lat, lng } = request.body

  const sql = `INSERT INTO estacion(estacionnombre, estacionstoreid, estaciondireccion, estacionregistro, estacioncoordenada, lat, lng) VALUES('${nombre}', '${storeid}', '${direccion}', '${fecharegistro}',${geografico}, ${lat}, ${lng});`
  console.log(sql)
  pool.query(sql, (error, result) => {
    if (error) {
      // throw new Error (error)
      console.error(error)
      response.status(401).json({ error, message: 'Operation failed to execute' })
    }
    response.status(201).json({ message: 'Station added successfully' })
  })
}
)


// Insert/update wather
app.post('/api/savewather',(request, response) =>
{
    const wather = request.body;
    capaBase.saveWather(wather).then(result=>{
      response.status(200).json(result)
    }).catch(() =>{
      response.status(400).json({message: 'Operation failed to execute', status: 401});
    });
})

// Insert/update sales point
app.post('/api/savesalepoint', (request, response) => {
  const point = request.body
  salespoint.PostSaleponint(point).then(result => {
    response.status(200).json(result)
  }).catch(e => {
    response.status(400).json({ message: 'Operation failed to execute', error: e, status: 401 })
  })
})

// Insert/update transactions
app.post('/api/savetransaction', (request, response) => {
  const transaction = request.body
  salespoint.PostTransaction(transaction).then(result => {
    response.status(200).json(result)
  }).catch(e => {
    response.status(400).json({ message: 'Operation failed to execute', error: e, status: 401 })
  })
})


app.post('/api/saveproduct', (request, response) => {
  const product = request.body
  salespoint.PostProduct(product).then(result => {
    response.status(200).json(result)
  }).catch(e => {
    response.status(400).json({ message: 'Operation failed to execute', error: e, status: 401 })
  })
})

app.get('/api/transactionlist',(request, response)=>
  {
    const data = request.body.data
    console.log("Producto:", data); 
      const _product = data;

      products.transactionByProduct(_product).then(result => {
        response.status(200).json(result)
      }).catch(()=>{
        console.log("Error")
        response.status(401).json({message: 'Operation failed to execute', status: 401});
      })
  })

app.get('/api/transactionlistdate',(request, response)=>
  {
    const data = request.body
    console.log("Producto:", data);
      const _product = data.product;
      const _start = data.start;
      const _end = data.end;
      products.transactionByProductDate(_product, _start, _end).then(result => {
        response.status(200).json(result)
      }).catch(()=>{
        console.log("Error")
        response.status(401).json({message: 'Operation failed to execute', status: 401});
      })
  })

app.post('/api/agrega_estaciones' , (request, response) => 
{
  console.log(request.body);
  const { nombre, storeid, direccion,fecharegistro, geografico, lat, lng } = request.body;
  const activa = true;
  const sql = `INSERT INTO estacion(estacionnombre, estacionstoreid, estaciondireccion, estacionregistro, estacioncoordenada, lat, lng, estacionactiva) VALUES('${nombre}', '${storeid}', '${direccion}', '${fecharegistro}',${geografico}, ${lat}, ${lng}, ${activa});`
  console.log(sql)
  pool.query(sql, (error, result) => {
    if (error) {
      // throw new Error (error)
      console.error(error)
      response.status(401).json({ error, message: 'Operation failed to execute' })
    }
    response.status(201).json({ message: 'Station added successfully' })
  })
})

const parentFolder = __dirname.split('/')[__dirname.split('/').length - 3]

//let runningLocal = true
//if (parentFolder == 'teleops') { runningLocal = false }
// RUN MAPS.TORTOPS
if (!argv.local) {
  console.log('Running server')

  const httpsLocalPort = argv.https || 443;
  const httpsServer = require('./HttpsServer.js')(app, httpsLocalPort)
} else { // RUN LOCALHOST:4000
  console.log('Running local!')
  const httpsPort = argv.https || 4000;
  app.listen(httpsPort, () => {
    
    console.log('App running on port' + httpsPort)
  })
}
var c = '/myapp'
app.get(c, (req, res) =>{
  let l = req.params;
  res.send("API prueba", l);
})
