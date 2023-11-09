'use strict'

const chalk = require('chalk')

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function sortBy (property) {
  return (a, b) => {
    const aProp = a[property]
    const bProp = b[property]

    if (aProp < bProp) {
      return -1
    } else if (aProp > bProp) {
      return 1
    } else {
      return 0
    }
  }
}

function handleFatalError (err) {
  console.error(`${chalk.bgRed.black('[fatal error]:')} ${err.message}`)
  console.error(`${chalk.bgRed.black('[Error]:')} ${err.stack}`)
  process.exit(1)
}

function totalPage () {
  return 15
}

module.exports = {
  extend,
  sortBy,
  handleFatalError,
  totalPage
}
