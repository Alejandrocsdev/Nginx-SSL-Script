#!/bin/bash

# Load nvm (important!)
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# Get node binary path
NODE_PATH=$(which node)

if [ -z "$NODE_PATH" ]; then
  echo "❌ Node not found. Is nvm loaded?"
  exit 1
fi

echo "Using Node: $NODE_PATH"

# Run script with sudo using full node path (forward all arguments)
sudo "$NODE_PATH" src/index.js "$@"
