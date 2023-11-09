const { Client } = require('pg')

const client = new Client({
  host: '$YOUR_DB_HOST',
  user: '$YOUR_DB_USER',
  port: 5432,
  password: '$YOUR_PASSWORD',
  database: '$YOUR_DATABASE'
})

module.exports = client
