'use strict'

const setupDatabase = require('./lib/db')
const setupEstacionModel = require('./models/tables/estacion')
const setupEstacionWayPointModel = require('./models/tables/estacionwaypoint')
const setupEstadisticasModel = require('./models/tables/estadisticas')
const setupPayloadModel = require('./models/tables/payload')
const setupRecorridoModel = require('./models/tables/recorrido')
const setupReferencePointsModel = require('./models/tables/referencepoints')
const setupViajeModel = require('./models/tables/viaje')
const setupWayPointModel = require('./models/tables/waypoint')

const defaults = require('defaults')

const setupEstacion = require('./lib/tables/estacion')
const setupEstacionWayPoint = require('./lib/tables/estacionwaypoint')
const setupEstadisticas = require('./lib/tables/estadisticas')
const setupPayload = require('./lib/tables/payload')
const setupRecorrido = require('./lib/tables/recorrido')
const setupReferencePoints = require('./lib/tables/referencepoints')
const setupViaje = require('./lib/tables/viaje')
const setupWayPoint = require('./lib/tables/waypoint')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'postgres',
    pools: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  const sequelize = setupDatabase(config)
  const EstacionModel = setupEstacionModel(config)
  const EstacionWayPointModel = setupEstacionWayPointModel(config)
  const EstadisticasModel = setupEstadisticasModel(config)
  const PayloadModel = setupPayloadModel(config)
  const RecorridoModel = setupRecorridoModel(config)
  const ReferencePointsModel = setupReferencePointsModel(config)
  const ViajeModel = setupViajeModel(config)
  const WayPointModel = setupWayPointModel(config)

  EstadisticasModel.belongsTo(RecorridoModel)

  RecorridoModel.belongsTo(ViajeModel)
  ReferencePointsModel.belongsTo(ViajeModel)

  ViajeModel.belongsTo(PayloadModel)

  EstacionWayPointModel.belongsTo(EstacionModel)
  EstacionWayPointModel.belongsTo(WayPointModel)

  ViajeModel.belongsTo(EstacionModel)

  await sequelize.authenticate()

  await sequelize.sync()
  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const estacion = setupEstacion(EstacionModel)
  const estacionWayPoint = setupEstacionWayPoint(EstacionWayPointModel)
  const estadisticas = setupEstadisticas(EstadisticasModel)
  const payload = setupPayload(PayloadModel)
  const recorrido = setupRecorrido(RecorridoModel)
  const referencePoints = setupReferencePoints(ReferencePointsModel)
  const viaje = setupViaje(ViajeModel)
  const wayPoint = setupWayPoint(WayPointModel)

  return {
    estacion,
    estacionWayPoint,
    estadisticas,
    payload,
    recorrido,
    referencePoints,
    viaje,
    wayPoint
  }
}
