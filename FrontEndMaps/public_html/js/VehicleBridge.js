const VEHICLE_SERVER = 'vehicle.tortops.com'
const VEHICLE_MQTT_PORT = 8883
const TOKEN = 'TkpoGsShutV32D003Vy3zCk9HJrOxK4q'
const https = require('https')
const mqtt = require('mqtt')
const os = require('os')

class Vehicle {
  constructor (data) {
    this.id = data.id || data.uid
    this.imei = Number(data.imei)
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
  }

  mqttOnConnect () {
    console.log('MQTT connected to'.green, `mqtts://${VEHICLE_SERVER}:${VEHICLE_MQTT_PORT}`)
    this.mqttClient.subscribe('vehicles/all/update', err => {
      if (err) return console.error('Suscription error')
      console.log('MQTT client subscribed to'.green, 'vehicles/all/update')
    })
  }

  mqttOnMessage (topic, message, packet) {
    const data = JSON.parse(message.toString())
    const subtopics = topic.split('/')
    const modifiedTopic = this.topic ? this.topic.split('/') : ''

    switch (subtopics[0]) {
      case modifiedTopic[0]:
        this.updateCallback(data, subtopics)
        break

      case 'vehicles':
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
        break
    }

    const topics = Object.keys(this.subscriptions)
    for (const topic of topics) {
      if (topic === topic) {
        this.subscriptions[topic].callback(message.toString())
      }
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
