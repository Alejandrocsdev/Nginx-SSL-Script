const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const removeDomain = require('./remove');
const deployDomain = require('./deploy');

const showUsage = () => {
  console.error('\n❌ Invalid argument. Use either:\n');
  console.error('./run.sh');
  console.error('./run.sh --static');
  console.error('./run.sh --www');
  console.error('./run.sh --remove\n');
  process.exit(1);
};

const main = () => {
  // Ensure script is run as root
  if (process.getuid() !== 0) {
    console.error('❌ Please run this script with sudo.');
    process.exit(1);
  }

  const args = process.argv.slice(2);

  if (args.length > 1) {
    return showUsage();
  }

  const arg = args[0];

  try {
    if (!arg) {
      deployDomain(config, { mode: 'proxy' });
      return;
    }

    if (arg === '--static') {
      deployDomain(config, { mode: 'static' });
      return;
    }

    if (arg === '--www') {
      deployDomain(config, { mode: 'www' });
      return;
    }

    if (arg === '--remove') {
      removeDomain(config);
      return;
    }

    showUsage();
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
};

main();
