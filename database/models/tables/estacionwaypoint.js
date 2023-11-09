'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupEstacionWaypointsModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('estacionwaypoint', {

  })
}
