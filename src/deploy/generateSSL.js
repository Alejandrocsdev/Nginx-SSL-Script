const { execFileSync } = require('child_process');

const getSSLPath = require('./getSSLPath');
const { color, rollback } = require('../utils');
const { blue } = color;

const generateSSL = (config) => {
  const { domain, ssl } = config;
  const { primary, aliases } = domain;

  const domains = [primary, ...aliases];
	const { sslCert, sslKey } = getSSLPath(ssl.provider, primary);

  console.log('\n🔅 Generating SSL certificate...\n');

  // =========================================================
  // LET'S ENCRYPT
  // =========================================================
  if (ssl.provider === 'letsencrypt') {
    const { email, staging } = ssl.letsencrypt;

    const certbotArgs = [
      'certonly',
      '--standalone',
      '--non-interactive',
      '--agree-tos',
      '-m',
      email,
      ...domains.flatMap((domain) => ['-d', domain]),
    ];

    if (staging === true) {
      certbotArgs.push('--staging');
    }

    try {
      execFileSync('certbot', certbotArgs, {
        encoding: 'utf8',
        // stdin | stdout | stderr
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      console.error('❌ Operation failed:');
      if (error.stdout) console.error(error.stdout);
      console.error(error.stderr);
			rollback(primary)
      process.exit(1);
    }

    console.log('Certificate:', blue(sslCert));
    console.log('Key:', blue(sslKey));
  }

  // =========================================================
  // SELF-SIGNED CERTIFICATE
  // =========================================================
  if (ssl.provider === 'selfsigned') {
    const { days, keySize } = ssl.selfsigned;

    const opensslArgs = [
      'req',
      '-x509',
      '-nodes',
      '-days',
      `${days}`,
      '-newkey',
      `rsa:${keySize}`,
      '-keyout',
      sslKey,
      '-out',
      sslCert,
      '-subj',
      `/CN=${primary}`,
      '-addext',
      `subjectAltName=${domains.map((domain) => `DNS:${domain}`).join(',')}`,
    ];

    execFileSync('mkdir', ['-p', `/etc/nginx/ssl/${primary}`]);

    try {
      execFileSync('openssl', opensslArgs, {
        encoding: 'utf8',
        // stdin | stdout | stderr
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      console.error('❌ Operation failed:');
      if (error.stdout) console.error(error.stdout);
      console.error(error.stderr);
			rollback(primary)
      process.exit(1);
    }

    console.log('Certificate:', blue(sslCert));
    console.log('Key:', blue(sslKey));
  }
};

module.exports = generateSSL;
