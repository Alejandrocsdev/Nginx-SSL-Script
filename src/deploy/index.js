const configureNginx = require('./configureNginx')
const generateSSL = require('./generateSSL')
const activateNginx = require('./activateNginx')

const deployDomain = (config) => {
  configureNginx(config)
  generateSSL(config)
  activateNginx(config)
}

module.exports = deployDomain;
