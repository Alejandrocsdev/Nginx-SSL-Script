const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'domain.json');
const templatePath = path.join(__dirname, 'template.txt');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

const removeDomain = require('./remove');
const deployDomain = require('./deploy');

const main = () => {
  // Ensure script is run as root
  if (process.getuid() !== 0) {
    console.error('❌ Please run this script with sudo.');
    process.exit(1);
  }

  const args = process.argv.slice(2);

  if (args.length === 0) {
    deployDomain(config, template);
    return;
  }

  if (args.length === 1 && args[0] === '--remove') {
    removeDomain(config);
    return;
  }

  console.error('❌ Invalid argument. Use either:');
  console.error('./run.sh           (deploy)');
  console.error('./run.sh --remove  (remove)');
  process.exit(1);
};

main();
