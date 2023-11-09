module.exports = function config () {

  const configURL = 'postgres://postgres:$YOUR_DB_NAME@$YOUR_DB_HOST:5432/maps'
 
  console.debug('Configuration:'.green, configURL)
  // module.exports = config

  return configURL
}
