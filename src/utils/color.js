const color = {
	red: (string) => `\x1b[91m${string}\x1b[0m`,
  blue: (string) => `\x1b[94m${string}\x1b[0m`,
	green: (string) => `\x1b[32m${string}\x1b[0m`,
};

module.exports = color;
