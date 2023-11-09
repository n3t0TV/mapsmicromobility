
const TOKEN = 'TkpoGsShutV32D003Vy3zCk9HJrOxK4q'
const https = require('https')
const mqtt = require('mqtt')
const os = require('os')
const TripData = require('../modules/TripData.js')
const Pool = require('pg').Pool
const client = require('../config')
const layerVending = require ('../layers/layerVending')
const layerBase = require('../layers/layerBase')
const layerProduct = require('../layers/layerProduct')
const layerMetrics = require('../layers/layerMetrics')
const argv = require('yargs').argv
const VEHICLE_SERVER = argv.vehicleBroker || 'vehicle.tortops.com' 
const VEHICLE_MQTT_PORT = argv.vehiclePort || 8883
// New pool object
const pool = new Pool
({
  user: client.user,
  host: client.host,
  database: client.database,
  password: client.password,
  port: client.port
})

console.log("Parametros de conexion:",VEHICLE_SERVER, VEHICLE_MQTT_PORT)

const isNullorUndefined = (value) => { return value === null || value === undefined }

function saveMetricData (data) {
  var sql = ''
  var valid = false
  for (const vehicledata of data) {
    //console.log(vehicledata)
    if(vehicledata.location != null)
    {
      if (vehicledata.location.lat != 0 && vehicledata.location.lng != 0)// valid gps
      {
        valid = true
        sql = sql + `
          insert into metricasred(lat,lng,bandwidth,rssi,fps,roundtrip)
          values(${vehicledata.location.lat},${vehicledata.location.lng},${vehicledata.bandwidth},${vehicledata.rssi},${vehicledata.fps},${vehicledata.roundtrip}
          );
        `
      }
    }

  }

  pool.query(sql, (err, resquery) => {
    if (err) {
      return console.error('Error al ejecutar la consulta', err.stack)
    }
    // console.log(resquery);
    // response.send(resquery.rows);
    // let geojson = GeoJSON.parse(resquery.rows,{:['lat', 'lng']});
  // console.log(res.rows);
    // response.json(geojson);
  })
}

class Vehicle {
  constructor (data) {
    this.id = data.id || data.uid
    this.imei = Number(data.imei)
    this.tripData = new TripData(this.id)
    this.update(data)
  }

  update (data) {
    this.battery = Number(data.battery)
    this.gps = {
      lat: Number(data.gps.lat),
      lon: Number(data.gps.lon),
      alt: Number(data.gps.alt)
    }
    this.type = data.type
    this.versions = data.versions
    this.rssi = Number(data.rssi)
    this.status = Number(data.status)
    this.timestamp = data.timestamp || data.heartbeatTimestamp
    this.connected = data.connected
    this.mqtt = data.mqtt
    this.http = data.http
    this.operatorId = data.operatorId
    this.operatorName = data.operatorName
    this.remoteIt = data.remoteIt
    this.server = data.connection || {}

    this.tripData.addGPSPoint(this.gps, Date.now())
  }

  clearTripData () {
    this.tripData = new TripData(this.id)
  }

  exportData () {
    this.type
  }
}

class VehicleBridge {
  constructor (vehicle_server, token) {
    this.vehicle_server = vehicle_server
    this.token = token

    this.mqttClientId = `${os.hostname()}`
    console.log('Connecting MQTT...'.cyan)
    this.mqttClient = mqtt.connect(`mqtts://${VEHICLE_SERVER}:${VEHICLE_MQTT_PORT}`,
      {
        username: this.mqttClientId,
        password: TOKEN
      }
    )
    /** @type {Object<string,Vehicle>} */
    this.vehicles = {}
    /** @type {Array<function>} */
    this.callbacks = []
    this.subscriptions = {}
    this.mqttClient.on('connect', this.mqttOnConnect.bind(this))
    this.mqttClient.on('message', this.mqttOnMessage.bind(this))
    this.mqttClient.on('close', this.mqttOnClose.bind(this))
    //  this.lastMetricArray=null;
  }

  mqttOnConnect () {
    console.log('MQTT connected to'.green, `mqtts://${VEHICLE_SERVER}:${VEHICLE_MQTT_PORT}`)
    this.mqttClient.subscribe('vehicles/all/update', err => {
      if (err) return console.error('Suscription error')
      console.log('MQTT client subscribed to'.green, 'vehicles/all/update')
    })
    this.mqttClient.subscribe('vehicles/delivery/update', err => {
      if (err) return console.error('Suscription error')
      console.log('MQTT client subscribed to'.green, 'vehicles/delivery/update')
    })
    this.mqttClient.subscribe('vehicles/videoMetrics/update', err => {
      if (err) return console.error('Suscription error')
      console.log('MQTT client subscribed to'.green, 'vehicles/videometrics/update')
    })
    this.mqttClient.subscribe('sensor/+/totalpersons', err => {
      if (err) return console.error('Suscription error')
      console.log('MQTT client subscribed to'.green, 'sensor/+')
    })
    this.mqttClient.subscribe('vending/+', err => {
      if(err) return console.error('Suscription error')
      console.log('MQTT client subscribed to'.magenta, 'vending/+')
    })
  }

  saveNetworkMetric () {

  }

mqttOnSensor(subtopics, message,packet){
  if(subtopics[2]=='totalpersons')
  {
    console.log('Subtopic:', subtopics);
    const msj = JSON.parse(message.toString());
    console.log('Message:', msj);
    var imei = subtopics[1]
    console.log("VehicleList:",this.vehicles[imei].gps);
    const data = {
      "quantity": msj.totalpersons,
      "starttime": msj.starttime,
      "endtime": msj.endtime,
      "lat": this.vehicles[imei].gps.lat,
      "lng": this.vehicles[imei].gps.lon,
      "alt": this.vehicles[imei].gps.alt,
    }
    console.log("DataTotalPerson",data)
    layerVending.PostPeopleDetection(data)
   

  }
}

mqttOnVending(subtopics, message,packet)
{
  //console.log('Subtopic:', subtopics);
  var imei = subtopics[1];
  if(subtopics[0]=='vending')
  {
    const msj = JSON.parse(message.toString());
    if(msj.status === 'approved')
    {
      
      const transaction = {
        "quantity":1,
        "date": Date.now(),
        "amount": msj.price,
        "currency": "USD",
        "lat": this.vehicles[imei].gps.lat,
        "lng": this.vehicles[imei].gps.lon,
        "alt": this.vehicles[imei].gps.alt,
        "name": msj.name
        }
      console.log("Message:",transaction)
      layerVending.PostTransaction(transaction)
      layerProduct.findproductByName(msj.name).then((result)=>
      {
        const product = result;
            if(product === null)
          {
            var p = {
              "id_product": msj.id,
              "name": msj.name,
              "price": msj.price
            };
            console.log("Product:",p)
          }

      }).catch((e)=>{
        console.log("Error:", e);
      })
    }
    
  }

}

mqttOnMetric(subtopics,message,packet)
{

    //console.log('topic:', subtopics);
    const msj = JSON.parse(message.toString());
    //console.log("Messagge topic:",msj);

    const server = msj[0].teleopServer;
    if(server == 'gcloud.teleop.tortops.com')
    {
    const metrics = {
      "rssi": msj[0].rssi,
      "lat": msj[0].location.lat,
      "lng": msj[0].location.lng,
      "primarySent":msj[0].primary.sent,
      "primaryReceived": msj[0].primary.received,
      "primaryLost": msj[0].primary.lost,
      "primaryLostPercentage": msj[0].primary.lostPercent,
      "primaryFpsSent": msj[0].primary.fpsSent,
      "primaryFpsReceived":msj[0].primary.fpsReceived,
      "primaryFpsLost": [msj[0].primary.fpsSent]-[msj[0].primary.fpsReceived],
      "primaryFpsLostPercentage": (([msj[0].primary.fpsSent]-[msj[0].primary.fpsReceived])/[msj[0].primary.fpsSent])*100,
      "primaryRoundTrip": msj[0].primary.roundtrip,
      "uid":msj[0].vehicle.uid,
      "provider": msj[0].provider
    } 
    console.log("Metric:",metrics)
    layerMetrics.PostMetricRed(metrics)
  } 
}

//myTime =setTimeout(this.mqttOnSensor,60000);

  mqttOnMessage (topic, message, packet) {
    // console.log('RAW: '+message)
    const data = JSON.parse(message.toString())

    const subtopics = topic.split('/')
    const modifiedTopic = this.topic ? this.topic.split('/') : ''
    //console.log("Subtopics:",subtopics)
    //console.log("Topics:",data);
    
    switch (subtopics[0]) {
      case modifiedTopic[0]:
        this.updateCallback(data, subtopics)
        break
      case 'sensor':
        this.mqttOnSensor(subtopics,message, packet)
        break
      case 'vending':
        this.mqttOnVending(subtopics,message,packet)
        break  
      case 'vehicles':
        if(subtopics[1]=='videoMetrics')
        {
          this.mqttOnMetric(subtopics,message,packet)  
        }
        if (subtopics[1] == 'all' && subtopics[2] == 'update') {
          // console.log(data);
          // if(vehicledata.imei=='970369244169959')
          for (const vehicledata of data) {
            // if(vehicledata.imei=='970369244169959')
            //  console.log(vehicledata);
            //  if(vehicledata.gps['lat']!=0 && vehicledata.gps['lon']!=0)
            // {
            if (!this.vehicles[vehicledata.imei]) {
              this.vehicles[vehicledata.imei] = new Vehicle(vehicledata)
            } else {
              this.vehicles[vehicledata.imei].update(vehicledata)
            }
            //  }
          }
        } else if (subtopics[1] == 'delivery') {
          console.log(data)
          for (const vehicledata of data) {
            if (!isNullorUndefined(vehicledata.vehicle)) {
              const imei = vehicledata.vehicle.imei
              if (this.vehicles[imei]) {
                console.log('Updating trip...')
                this.vehicles[imei].tripData.updateDelivery(vehicledata)
              }
            }
          }
        } else if (subtopics[1] == 'videoMetrics') {
          //console.log('Video metrics received!')
          //  console.log(data);
          // this.lastMetricArray=vehicledata;
          saveMetricData(data)

          /* {
            teleopServer: 'dev.teleop.tortops.com',
            location: { lat: 0, lng: 0 },
            network: 200,
            rssi: -200,
            fps: 10,
            bandwidth: 646.696,
            roundtrip: 0.339,
            battery: 96,
            provider: 'T-Mobile',
            teleopId: 65,
            request: {
              uid: 10799,
              session: 11866,
              operator: 37,
              origin: [Object],
              destination: [Object],
              status: 6
            },
            vehicle: { uid: 615, imei: '970369244169959', type: 'NEW', ui_setup: 23 },
            payload: {
              uid: 2715,
              status: 'Delivery in progress',
              type: 'RETURN TRIP',
              store: 'walmart',
              box: 1,
              client: [Object]
            },
            referrer: 'tortops.com'
          } */

  
        }
        break

      /* case 'vehicles':

        console.log('Vehicles topic message');
        const updated = []
        for (const vehicledata of data) {
          if (!this.vehicles[vehicledata.imei]) {
            this.vehicles[vehicledata.imei] = new Vehicle(vehicledata)
          } else {
            this.vehicles[vehicledata.imei].update(vehicledata)
          }
          updated.push(this.vehicles[vehicledata.imei])
        }
        for (const callback of this.callbacks) {
          callback(this, updated)
        }
        break

      case 'heartbeat':

        if (!this.vehicles[data.imei]) {
          this.vehicles[data.imei] = new Vehicle(data)
        } else {
          this.vehicles[data.imei].update(data)
        }
        for (const callback of this.callbacks) {
          callback(this, [this.vehicles[vehicledata.imei]])
        }
        break */

      /* const topics = Object.keys(this.subscriptions)
      for (const topic of topics) {
        if (topic === topic) {
          this.subscriptions[topic].callback(message.toString())
        }
      } */
    }
  }

  mqttOnClose () {
    console.log('MQTT connection closed'.red)
  }

  mqttPublish (topic, data, options) {
    return new Promise((resolve) => {
      this.mqttClient.publish(topic, data, options, resolve)
    })
  }

  mqttInstruction (imei, data) {
    return new Promise(resolve => {
      const jsonData = JSON.stringify(data)
      this.mqttPublish(`instruction/${imei}`, jsonData, { qos: 2 }).then(resolve)
    })
  }

  mqttOta (imei, data) {
    return new Promise(resolve => {
      const jsonData = JSON.stringify(data)
      this.mqttPublish(`ota/${imei}`, jsonData, { qos: 2 }).then(resolve)
    })
  }

  /**
   * Register MQTT callback for update event
   * @param {function(VehicleBridge,Array<Vehicle>)} callback
   */

  registerMQTTCallback (callback) {
    this.callbacks = push(callback)
  }

  /**
   * @type {Array<Vehicle>}
   */
  get vehicleList () {
    const arr = []
    for (const uid in this.vehicles) {
      arr.push(this.vehicles[uid])
    }
    return arr
  }

  getConnectedList (status) {
    const arr = []
    for (const uid in this.vehicles) {
      if (this.vehicles[uid].connected) {
        if (status) {
          if (Number(status) !== this.vehicles[uid].status) {
            continue
          }
        }
        arr.push(this.vehicles[uid])
      }
    }
    return arr
  }

  request (data) {
    return new Promise((resolve, reject) => {
      data.token = this.token
      const jsondata = JSON.stringify(data); console.log('data', jsondata)
      const req = https.request({
        hostname: this.vehicle_server,
        port: 443,
        path: '/api',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': jsondata.length
        }
      }, (res) => {
        const chunks = []
        res.setEncoding('utf8')
        res.on('data', chunk => {
          // console.log(chunk);
          chunks.push(chunk)
        })
        res.on('end', () => {
          const body = JSON.parse(chunks.join(''))
          resolve(body)
        })
      })
      req.on('error', err => {
        reject(err)
      })
      req.write(jsondata)
      req.end()
    })
  }

  sendStatus (IMEI) {
    return new Promise((resolve, reject) => {
      console.log('Enviando estado a: '.blue, IMEI)
      this.request({
        request: 'SEND_STATUS',
        IMEI: IMEI
      }).then(resolve).catch(reject)
    })
  }

  requestClientToken () {
    return new Promise((resolve, reject) => {
      this.request({ request: 'GET_FRONTEND_TOKEN' }).then(resolve).catch(reject)
    })
  }

  getVehicleInfo (IMEI) {
    return new Promise((resolve, reject) => {
      this.request({ request: 'GET_VEHICLE_INFO', imei: IMEI }).then(resolve).catch(reject)
    })
  }
}

module.exports = new VehicleBridge(VEHICLE_SERVER, TOKEN)
