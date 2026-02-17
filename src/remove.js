const { execFileSync } = require('child_process');

const removeDomain = (config) => {
  const { serverName } = config;

  const outputPath = `/etc/nginx/sites-available/${serverName}`;
  const enabledPath = `/etc/nginx/sites-enabled/${serverName}`;

  console.log(`\nRemoving domain: ${serverName}\n`);

  // Remove symlink first
  try {
    execFileSync('rm', ['-f', enabledPath]);
    console.log('Removed sites-enabled symlink.');
  } catch {}

  // Remove config file
  try {
    execFileSync('rm', ['-f', outputPath]);
    console.log('Removed sites-available config.');
  } catch {}

  // Test nginx config
  try {
    console.log('Testing nginx config...');
    execFileSync('nginx', ['-t'], { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ nginx test failed after removal.');
    process.exit(1);
  }

  // Reload nginx
  console.log('Reloading nginx...');
  execFileSync('systemctl', ['reload', 'nginx'], { stdio: 'inherit' });

  // Delete certbot certificate (if exists)
  try {
    console.log('Checking for certificate...');
    execFileSync(
      'certbot',
      ['delete', '--cert-name', serverName, '--non-interactive'],
      {
        stdio: 'inherit',
      },
    );
    console.log('Certificate deleted.');
  } catch {
    console.log('No certificate found or already deleted.');
  }

  console.log('\n✅ Domain removal completed!\n');
};

module.exports = removeDomain;
