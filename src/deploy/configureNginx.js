const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const templatesPath = path.join(__dirname, '..', 'templates');
const proxySitePath = path.join(templatesPath, 'proxySite.txt');
const staticSitePath = path.join(templatesPath, 'staticSite.txt');

const getSSLPath = require('./getSSLPath');
const { color } = require('../utils');
const { blue } = color;

const configureNginx = (config) => {
  const { domain, hosting, ssl } = config;
  const { primary, aliases } = domain;

  // =========================================================
  // 1️⃣ Load correct template based on hosting type
  // =========================================================
  let template;

  if (hosting.type === 'proxy') {
    const { host, port } = hosting.proxy;
    const proxyTarget = `http://${host}:${port}`;

    template = fs.readFileSync(proxySitePath, 'utf8');
    template = template.replace(/{{PROXY_TARGET}}/g, proxyTarget);
  }

  if (hosting.type === 'static') {
    const { sourcePath } = hosting.static;
    const deployPath = `/var/www/${primary}`;

    // ---------- Static files ----------
		console.log('🔅 Generating static deployment...\n')
    execFileSync('mkdir', ['-p', deployPath]);
    execFileSync('cp', ['-r', `${sourcePath}/.`, deployPath]);
    execFileSync('chown', ['-R', 'www-data:www-data', deployPath]);
		console.log('Static deployment directory:', blue(deployPath));

    template = fs.readFileSync(staticSitePath, 'utf8');
    template = template.replace(/{{DEPLOY_PATH}}/g, deployPath);
  }

  // =========================================================
  // 2️⃣ Build server names (primary + aliases)
  // =========================================================
  const serverNames = [primary, ...aliases].join(' ');

  // =========================================================
  // 3️⃣ Determine SSL certificate paths
  // =========================================================
  const { sslCert, sslKey } = getSSLPath(ssl.provider, primary);

  // =========================================================
  // 4️⃣ Replace template placeholders
  // =========================================================
  const nginxConfig = template
    .replace(/{{PRIMARY}}/g, primary)
    .replace(/{{SERVER_NAMES}}/g, serverNames)
    .replace(/{{SSL_CERT}}/g, sslCert)
    .replace(/{{SSL_KEY}}/g, sslKey);

  // =========================================================
  // 5️⃣ Define nginx paths
  // =========================================================
  const outputPath = `/etc/nginx/sites-available/${primary}`;
  const enabledPath = `/etc/nginx/sites-enabled/${primary}`;
  const tempPath = `/tmp/${primary}.conf`;

  console.log('\n🔅 Generating nginx config...\n');

  // =========================================================
  // 6️⃣ Write config to temporary file
  // =========================================================
  fs.writeFileSync(tempPath, nginxConfig);

  // =========================================================
  // 7️⃣ Move temp config into nginx directory (atomic replace)
  // =========================================================
  execFileSync('mv', [tempPath, outputPath]);
  console.log('Nginx site available:', blue(outputPath));

  // =========================================================
  // 8️⃣ Enable site via symlink
  // =========================================================
  execFileSync('ln', ['-sf', outputPath, enabledPath]);
  console.log('Nginx site enabled (symlink):', blue(enabledPath));
};

module.exports = configureNginx;
