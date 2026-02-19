const getSSLPath = (provider, serverName) => {
  let sslCert;
  let sslKey;

  if (provider === 'letsencrypt') {
    sslCert = `/etc/letsencrypt/live/${serverName}/fullchain.pem`;
    sslKey = `/etc/letsencrypt/live/${serverName}/privkey.pem`;
  }

  if (provider === 'selfsigned') {
    sslCert = `/etc/nginx/ssl/${serverName}/cert.pem`;
    sslKey = `/etc/nginx/ssl/${serverName}/key.pem`;
  }

  return { sslCert, sslKey };
};

module.exports = getSSLPath;
