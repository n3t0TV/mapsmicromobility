'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupReferencePointsModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('referencepoints', {
    rutapuntos: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
