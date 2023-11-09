'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupRecorridoModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('recorrido', {
    recorridopuntos: {
      type: Sequelize.STRING,
      allowNull: false
    },
    recorridotiempos: {
      type: Sequelize.STRING,
      allowNull: false
    },
    recorridovehiculo: {
      type: Sequelize.STRING,
      allowNull: false
    },
    recorridoteleoperador: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
