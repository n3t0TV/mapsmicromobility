'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupViajesModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('viaje', {
    viajeinicio: {
      type: Sequelize.STRING,
      allowNull: false
    },
    viajedestino: {
      type: Sequelize.STRING,
      allowNull: false
    },
    viajetiempoestimado: {
      type: Sequelize.STRING,
      allowNull: false
    },
    viajedistanciaestimada: {
      type: Sequelize.STRING,
      allowNull: false
    },
    viajecostoestimado: {
      type: Sequelize.STRING,
      allowNull: false
    },
    viajesolicitudteleop: {
      type: Sequelize.STRING,
      allowNull: false
    },
    viajesolicitudpayload: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
