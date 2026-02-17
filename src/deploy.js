const fs = require('fs');
const { execSync } = require('child_process');

const valid = require('./utils');

const deployDomain = (config, template) => {
  const { serverName, ssl, upstream } = config;
  const { host, port, protocol } = upstream;

  if (!valid.host(host)) {
    console.error('❌ Invalid host. Must be IPv4 or localhost.');
    process.exit(1);
  }

  if (!valid.port(port)) {
    console.error('❌ Invalid port. Must be 1-65535.');
    process.exit(1);
  }

  if (!valid.protocol(protocol)) {
    console.error('❌ Invalid protocol. Must be http or https.');
    process.exit(1);
  }

  const proxyTarget = `${protocol}://${host}:${port}`;

  // Replace placeholders in template
  const finalConfig = template
    .replace(/{{SERVER_NAME}}/g, serverName)
    .replace(/{{PROXY_TARGET}}/g, proxyTarget);

  // Nginx standard directory structure
  const outputPath = `/etc/nginx/sites-available/${serverName}`;
  const enabledPath = `/etc/nginx/sites-enabled/${serverName}`;

  // Temporary file stored in /tmp
  const tempPath = `/tmp/${serverName}.conf`;

  console.log('Creating nginx config...');

  // Write new config to temporary location first
  fs.writeFileSync(tempPath, finalConfig);

  // Backup existing config if it exists
  if (fs.existsSync(outputPath)) {
    console.log('Backing up existing config...');
    execSync(`cp ${outputPath} ${outputPath}.bak`);
  }

  // Move temp config into nginx directory
  execSync(`mv ${tempPath} ${outputPath}`);

  if (!fs.existsSync(enabledPath)) {
    execSync(`ln -s ${outputPath} ${enabledPath}`);
  }

  try {
    console.log('Testing nginx config...');

    // Test nginx config before reload
    execSync('nginx -t', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ nginx test failed. Restoring backup...');

    // Restore backup if exists
    if (fs.existsSync(`${outputPath}.bak`)) {
      execSync(`mv ${outputPath}.bak ${outputPath}`);
    } else {
      // Remove broken config if no backup existed
      execSync(`rm -f ${outputPath}`);
    }

    process.exit(1);
  }

  console.log('Reloading nginx...');

  // Reload nginx only if config test passed
  execSync('systemctl reload nginx');

  console.log('\n✅ Nginx configuration completed!\n');

  if (ssl.enabled) {
    console.log('SSL enabled. Checking certbot...');

    try {
      execSync('which certbot', { stdio: 'ignore' });
    } catch {
      console.log('Installing certbot...');
      execSync('apt install certbot python3-certbot-nginx', {
        stdio: 'inherit',
      });
    }

    try {
      execSync('dpkg -l | grep python3-certbot-nginx', { stdio: 'ignore' });
    } catch {
      console.log('Installing python3-certbot-nginx...');
      execSync('apt install certbot python3-certbot-nginx', {
        stdio: 'inherit',
      });
    }

    console.log('Requesting SSL certificate...');
    execSync(
      `certbot --nginx -d ${serverName} --non-interactive --agree-tos -m ${ssl.email} --redirect`,
      { stdio: 'inherit' },
    );

    console.log('\n✅ SSL setup completed.\n');
  }
};

module.exports = deployDomain;
