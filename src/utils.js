// const net = require('net');

// Validate IPv4
const isIPv4 = (ip) => {
  if (typeof ip !== 'string') return false;

  const parts = ip.split('.');
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (part.length === 0) return false;

    const num = Number(part);

    if (!Number.isInteger(num)) return false;
    if (num < 0 || num > 255) return false;

    // Reject leading zeros & weird formats
    if (part !== String(num)) return false;
  }

  return true;
};

// Validate host (IPv4 or localhost)
const host = (value) => {
  if (value === 'localhost') return true;

  // if (net.isIP(value) === 4) return true;
  if (isIPv4(value)) return true;

  return false;
};

// Validate port
const port = (value) => {
  const portNumber = Number(value);

  return Number.isInteger(portNumber) && portNumber >= 1 && portNumber <= 65535;
};

// Validate protocol
const protocol = (value) => {
  return ['http', 'https'].includes(value);
};

module.exports = {
  host,
  port,
  protocol,
};
