'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupPayloadModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('payload', {
    tiempo_carga: {
      type: Sequelize.STRING,
      allowNull: false
    },
    tiempo_dropoff: {
      type: Sequelize.STRING,
      allowNull: false
    },
    tiempo_entrega: {
      type: Sequelize.STRING,
      allowNull: false
    },
    tiempo_returntrip: {
      type: Sequelize.STRING,
      allowNull: false
    },
    distancia_total: {
      type: Sequelize.STRING,
      allowNull: false
    },
    operatorid: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
