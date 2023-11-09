const express = require('express')
const app = express()
const cors = require('cors')
const port = 4000
const layerRouter = require('./routers/api')
const bodyparser = require('body-parser')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/api', layerRouter)

app.listen(port, () => {
  console.log('App running on port' + port)
})
