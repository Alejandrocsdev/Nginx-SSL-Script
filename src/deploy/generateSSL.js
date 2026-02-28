const { execFileSync } = require('child_process');

const getSSLPath = require('./getSSLPath');
const { color, rollback } = require('../utils');
const { blue } = color;

const generateSSL = (config) => {
  const { domain, ssl } = config;
  const { primary, aliases } = domain;

  const domains = [primary, ...aliases];
  const { sslCert, sslKey } = getSSLPath(ssl.provider, primary);

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

    console.log('\n🛑 Stopping nginx...\n');
    execFileSync('systemctl', ['stop', 'nginx']);

    try {
			console.log('🔅 Generating SSL certificate...\n');
      execFileSync('certbot', certbotArgs, {
        encoding: 'utf8',
        // stdin | stdout | stderr
        stdio: ['ignore', 'pipe', 'pipe'],
      });
			console.log('🟢 SSL certificate generated successfully!\n');
    } finally {
      console.log('🟢 Starting nginx...\n');
      execFileSync('systemctl', ['start', 'nginx']);
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

    execFileSync('openssl', opensslArgs, {
      encoding: 'utf8',
      // stdin | stdout | stderr
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    console.log('Certificate:', blue(sslCert));
    console.log('Key:', blue(sslKey));
  }
};

module.exports = generateSSL;
