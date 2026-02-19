const validateConfig = (config) => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('config must be an object');
  }

  const { domain, hosting, ssl } = config;

  // ---------- DOMAIN ----------
  if (!domain) {
    throw new Error('Missing "domain" section');
  }

  if (!('primary' in domain)) {
    throw new Error('Missing "domain.primary"');
  }

  if (!('aliases' in domain)) {
    throw new Error('Missing "domain.aliases"');
  }

  // ---------- HOSTING ----------
  if (!hosting) {
    throw new Error('Missing "hosting" section');
  }

  const { type, proxy, static } = hosting;

  if (!('type' in hosting)) {
    throw new Error('Missing "hosting.type"');
  }

  if (type === 'proxy') {
    if (!proxy) {
      throw new Error('Missing "hosting.proxy"');
    }

    if (!('host' in proxy)) {
      throw new Error('Missing "hosting.proxy.host"');
    }

    if (!('port' in proxy)) {
      throw new Error('Missing "hosting.proxy.port"');
    }
  }

  if (type === 'static') {
    if (!static) {
      throw new Error('Missing "hosting.static"');
    }

    if (!('sourcePath' in static)) {
      throw new Error('Missing "hosting.static.sourcePath"');
    }
  }

  // ---------- SSL ----------
  if (!ssl) {
    throw new Error('Missing "ssl" section');
  }

  const { provider, letsencrypt, selfsigned } = ssl;

  if (!('provider' in ssl)) {
    throw new Error('Missing "ssl.provider"');
  }

  if (provider === 'letsencrypt') {
    if (!letsencrypt) {
      throw new Error('Missing "ssl.letsencrypt"');
    }

    if (!('email' in letsencrypt)) {
      throw new Error('Missing "ssl.letsencrypt.email"');
    }

    if (!('staging' in letsencrypt)) {
      throw new Error('Missing "ssl.letsencrypt.staging"');
    }
  }

  if (provider === 'selfsigned') {
    if (!selfsigned) {
      throw new Error('Missing "ssl.selfsigned"');
    }

    if (!('days' in selfsigned)) {
      throw new Error('Missing "ssl.selfsigned.days"');
    }

    if (!('keySize' in selfsigned)) {
      throw new Error('Missing "ssl.selfsigned.keySize"');
    }
  }
};

module.exports = validateConfig;
