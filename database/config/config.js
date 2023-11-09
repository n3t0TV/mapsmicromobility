'use strict'
require('dotenv').config()
const debug = require('debug')('Maps:db:setup')
const conf = require('./config.json')
const enviroment = 'production'
const env = process.env.NODE_ENV
const envCheck = env !== enviroment

module.exports = function config (configExtra) {
  const config = {
    dev: envCheck,
    database: envCheck ? conf.local.database : conf.production.database,
    username: envCheck ? conf.local.username : conf.production.username,
    password: envCheck ? conf.local.password : conf.production.password,
    host: envCheck ? conf.local.host : conf.production.host,
    dialect: envCheck ? conf.local.dialect : conf.production.dialect,
    logging: s => debug(s)
  }

  if (configExtra) {
    Object.assign(config, {
      setup: true
    })
  }

  if (!envCheck) {
    Object.assign(config, {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  }

  console.log(config)

  return config
}
