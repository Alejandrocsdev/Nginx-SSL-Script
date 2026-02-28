const configureNginx = require('./configureNginx')
const generateSSL = require('./generateSSL')
const activateNginx = require('./activateNginx')

const deployDomain = (config) => {
  configureNginx(config)
	// Stop nginx
  generateSSL(config)
	// Start nginx
  activateNginx(config)
}

module.exports = deployDomain;
