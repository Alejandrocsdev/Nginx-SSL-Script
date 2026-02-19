const fs = require('fs');
const color = require('./color');
const { red } = color;

const rollback = (serverName) => {
  console.log(`🔄 Rolling back deployment...\n`);

	let count = 0;

  // Static Paths
  const deployPath = `/var/www/${serverName}`;

  // Nginx Paths
  const outputPath = `/etc/nginx/sites-available/${serverName}`;
  const enabledPath = `/etc/nginx/sites-enabled/${serverName}`;

  // Letsencrypt Paths
  const sslLivePath = `/etc/letsencrypt/live/${serverName}`;
  const sslRenewalPath = `/etc/letsencrypt/renewal/${serverName}.conf`;
  const sslArchivePath = `/etc/letsencrypt/archive/${serverName}`;

  // Openssl Paths
  const opensslPath = `/etc/nginx/ssl/${serverName}`;

  // =========================================================
  // Helper: remove file or directory safely
  // =========================================================
  const removePath = (description, target) => {
    if (!fs.existsSync(target)) return;

		count++

    try {
      const status = fs.lstatSync(target);

      if (status.isSymbolicLink() || status.isFile()) {
        fs.unlinkSync(target);
      } else if (status.isDirectory()) {
        fs.rmSync(target, { recursive: true, force: true });
      }

      console.log(`🔵 Removed ${description}: ${red(target)}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${description}: ${red(target)}`);
    }
  };

  // =========================================================
  // 1️⃣ Remove deployed static files
  // =========================================================
  removePath('static deployment directory', deployPath);

  // =========================================================
  // 2️⃣ Remove Nginx enabled symlink FIRST
  // =========================================================
  removePath('nginx enabled site (symlink)', enabledPath);

  // =========================================================
  // 3️⃣ Remove Nginx available config
  // =========================================================
  removePath('nginx available site', outputPath);

  // =========================================================
  // 4️⃣ Remove Let's Encrypt certificates (if exist)
  // =========================================================
  removePath('Lets Encrypt live directory', sslLivePath);
  removePath('Lets Encrypt archive directory', sslArchivePath);
  removePath('Lets Encrypt renewal config', sslRenewalPath);

  // =========================================================
  // 5️⃣ Remove self-signed certificate directory
  // =========================================================
  removePath('self-signed SSL directory', opensslPath);

	if (count === 0) console.log('🔵 No resources found to remove');

  console.log('\n✅ Rollback completed');
};

module.exports = rollback;
