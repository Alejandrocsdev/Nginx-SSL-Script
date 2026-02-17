const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const valid = require('./utils');

const prepareStaticFiles = (sourcePath, targetPath) => {
  if (!fs.existsSync(targetPath)) {
    execFileSync('mkdir', ['-p', targetPath]);
  }

  // Clean target folder
  if (fs.existsSync(targetPath)) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      fs.rmSync(path.join(targetPath, file), { recursive: true, force: true });
    }
  }

  // Copy build output
  execFileSync('cp', ['-r', `${sourcePath}/.`, targetPath]);

  // Fix ownership
  execFileSync('chown', ['-R', 'www-data:www-data', targetPath]);
};

const deployDomain = (config, options) => {
  const { serverName, ssl, static, upstream } = config;
  const { mode } = options;

  const templatesDir = path.join(__dirname, 'templates');

  let templateFile;
  let deployPath;
  let finalConfig;

  // ===============================
  // PROXY MODE
  // ===============================

  if (mode === 'proxy') {
    const { host, port, protocol } = upstream;

    if (!valid.host(host)) throw new Error('Invalid proxy host');
    if (!valid.port(port)) throw new Error('Invalid proxy port');
    if (!valid.protocol(protocol)) throw new Error('Invalid proxy protocol');

    templateFile = path.join(templatesDir, 'proxy.txt');

    const template = fs.readFileSync(templateFile, 'utf8');

    const proxyTarget = `${protocol}://${host}:${port}`;

    finalConfig = template
      .replace(/{{SERVER_NAME}}/g, serverName)
      .replace(/{{PROXY_TARGET}}/g, proxyTarget);
  }

  // ===============================
  // STATIC MODE
  // ===============================

  if (mode === 'static') {
    if (!static?.rootPath) {
      throw new Error('static.rootPath is missing in config.json');
    }

    templateFile = path.join(templatesDir, 'static.txt');
    const template = fs.readFileSync(templateFile, 'utf8');

    deployPath = `/var/www/${serverName}`;

    prepareStaticFiles(static.rootPath, deployPath);

    finalConfig = template
      .replace(/{{SERVER_NAME}}/g, serverName)
      .replace(/{{STATIC_ROOT}}/g, deployPath);
  }

  // ===============================
  // WWW MODE (Static + canonical)
  // ===============================

  if (mode === 'www') {
    if (!static?.rootPath) {
      throw new Error('static.rootPath is missing');
    }

    if (!static?.www?.rootName) {
      throw new Error('static.www.rootName is missing');
    }

    templateFile = path.join(templatesDir, 'www.txt');
    const template = fs.readFileSync(templateFile, 'utf8');

    deployPath = `/var/www/${static.www.rootName}`;

    prepareStaticFiles(static.rootPath, deployPath);

    finalConfig = template
      .replace(/{{SERVER_NAME}}/g, serverName)
      .replace(/{{STATIC_ROOT}}/g, deployPath)
      .replace(/{{ROOT_NAME}}/g, static.www.rootName);
  }

  if (!finalConfig) {
    throw new Error('Invalid mode');
  }

  // ===============================
  // Write Nginx Config
  // ===============================

  // Nginx standard directory structure
  const outputPath = `/etc/nginx/sites-available/${serverName}`;
  const enabledPath = `/etc/nginx/sites-enabled/${serverName}`;

  // Temporary file stored in /tmp
  const tempPath = `/tmp/${serverName}.conf`;

  console.log('Creating nginx config...');

  // Write new config to temporary location first
  fs.writeFileSync(tempPath, finalConfig);

  if (fs.existsSync(outputPath)) {
    console.log('Backing up existing config...');
    execFileSync('cp', ['-f', outputPath, `${outputPath}.bak`]);
  }

  execFileSync('mv', [tempPath, outputPath]);

  if (!fs.existsSync(enabledPath)) {
    execFileSync('ln', ['-s', outputPath, enabledPath]);
  }

  try {
    console.log('Testing nginx config...');

    // Test nginx config before reload
    execFileSync('nginx', ['-t'], { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ nginx test failed. Restoring backup...');

    // Restore backup if exists
    if (fs.existsSync(`${outputPath}.bak`)) {
      execFileSync('mv', [`${outputPath}.bak`, outputPath]);
    } else {
      // Remove broken config if no backup existed
      execFileSync('rm', ['-f', outputPath]);
    }

    process.exit(1);
  }

  console.log('Reloading nginx...');

  // Reload nginx only if config test passed
  execFileSync('systemctl', ['reload', 'nginx'], { stdio: 'inherit' });

  console.log('\n✅ Nginx configuration completed!\n');

  // ===============================
  // SSL
  // ===============================

  if (!ssl?.email) {
    throw new Error('SSL enabled but ssl.email is missing in config.json');
  }

  console.log('Requesting SSL certificate...');

  let certDomains = ['-d', serverName];

  // If www mode, include root domain too
  if (mode === 'www' && static?.www?.rootName) {
    certDomains.push('-d', static.www.rootName);
  }

  execFileSync(
    'certbot',
    [
      '--nginx',
			'--staging',
      ...certDomains,
      '--non-interactive',
      '--agree-tos',
      '-m',
      ssl.email,
      '--redirect',
    ],
    { stdio: 'inherit' },
  );

  console.log('\n✅ SSL setup completed.\n');
};

module.exports = deployDomain;
