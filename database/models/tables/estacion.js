'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupEstacionModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('estacion', {
    estacionnombre: {
      type: Sequelize.STRING,
      allowNull: false
    },
    estacionstoreid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    estaciondireccion: {
      type: Sequelize.STRING,
      allowNull: false
    },
    estacioncoordenada: {
      type: Sequelize.STRING,
      allowNull: false
    },
    estacionpoligonogeografico: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
