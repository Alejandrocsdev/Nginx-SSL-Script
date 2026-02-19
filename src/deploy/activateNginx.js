const { execFileSync } = require('child_process');

const { color, rollback } = require('../utils');
const { green } = color;

const activateNginx = (config) => {
  const { primary } = config.domain;

  // =========================================================
  // 1️⃣ Test nginx configuration
  // =========================================================
  try {
    console.log('\n🔅 Testing nginx configuration...\n');
    execFileSync('nginx', ['-t'], {
      encoding: 'utf8',
      // stdin | stdout | stderr
      stdio: ['ignore', 'pipe', 'pipe'],
    });
		console.log(green('Nginx configuration tested successfully'));
  } catch (error) {
    console.error('❌ Operation failed:');
    if (error.stdout) console.error(error.stdout);
    console.error(error.stderr);
    rollback(primary);
    process.exit(1);
  }

  // =========================================================
  // 2️⃣ Reload nginx (apply new config)
  // =========================================================
  try {
    console.log('\n🔅 Reloading nginx...\n');
    execFileSync('systemctl', ['reload', 'nginx'], {
      encoding: 'utf8',
      // stdin | stdout | stderr
      stdio: ['ignore', 'pipe', 'pipe'],
    });
		console.log(green('Nginx reloaded successfully'));
  } catch (error) {
    console.error('❌ Operation failed:');
    if (error.stdout) console.error(error.stdout);
    console.error(error.stderr);
    rollback(primary);
    process.exit(1);
  }

  // =========================================================
  // 3️⃣ Success message
  // =========================================================
  console.log(`\n🌐 Site is now live: https://${primary}`);
};

module.exports = activateNginx;
