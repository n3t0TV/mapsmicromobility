'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupEstadisticasModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('estadisticas', {
    rutapuntos: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rutatiempos: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
