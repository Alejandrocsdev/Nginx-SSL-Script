const { execFileSync } = require('child_process');

const { color, rollback } = require('../utils');
const { green } = color;

const activateNginx = (config) => {
  const { primary } = config.domain;

  // =========================================================
  // 1️⃣ Test nginx configuration
  // =========================================================
  console.log('\n🔅 Testing nginx configuration...\n');
  execFileSync('nginx', ['-t'], {
    encoding: 'utf8',
    // stdin | stdout | stderr
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  console.log(green('Nginx configuration tested successfully'));

  // =========================================================
  // 2️⃣ Reload nginx (apply new config)
  // =========================================================
  console.log('\n🔅 Reloading nginx...\n');
  execFileSync('systemctl', ['reload', 'nginx'], {
    encoding: 'utf8',
    // stdin | stdout | stderr
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  console.log(green('Nginx reloaded successfully'));

  // =========================================================
  // 3️⃣ Success message
  // =========================================================
  console.log(`\n🌐 Site is now live: https://${primary}`);
};

module.exports = activateNginx;
