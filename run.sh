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

# Save current user BEFORE sudo
export OWNER=$USER

echo "Using Node: $NODE_PATH"
echo "Deploy owner: $OWNER"

# Run script with sudo using full node path (forward all arguments)
sudo "$NODE_PATH" src/index.js "$@"
