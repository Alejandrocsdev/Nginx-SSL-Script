const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');

const deployDomain = require('./deploy');
const removeDomain = require('./remove');

const { rollback, validateConfig } = require('./utils');

const main = () => {
  const args = process.argv.slice(2);

  let primary;

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    validateConfig(config);

    primary = config.domain.primary;

    if (args.length === 0) {
      deployDomain(config);
      return;
    }

    if (args.length === 1 && args[0] === '--remove') {
      removeDomain(config);
      return;
    }

    return console.error(`❌ Invalid command flag: ${args.join(' ')}`);
  } catch (error) {
    console.error('❌ Operation failed:');
    if (error.stdout) console.error(error.stdout);
    console.error(error.stderr);
    rollback(primary);
    process.exit(1);
  }
};

main();
