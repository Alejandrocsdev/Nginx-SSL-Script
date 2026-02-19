const { execFileSync } = require('child_process');

const { rollback } = require('../utils');

const removeDomain = (config) => {
  const { primary } = config.domain;

  rollback(primary);

  try {
    execFileSync('systemctl', ['reload', 'nginx']);
    console.log('\n✅ Nginx reloaded after removal');
  } catch (error) {
    console.error('\n❌ Failed to reload nginx after removal');
  }
};

module.exports = removeDomain;
