'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../../lib/db')

module.exports = function setupWaypointsModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('waypoint', {
    coordenadawaypoint: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
