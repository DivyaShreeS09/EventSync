#!/bin/bash
set -e
echo ""
echo "  ⚡ EventSync — MERN Stack Setup"
echo "  ================================="
echo ""

# Check Node
if ! command -v node &>/dev/null; then
  echo "  ❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "  ⚠ Node.js v$NODE_VER detected. Recommend v18+."
fi

echo "  📦 Installing server dependencies..."
cd server && npm install
echo "  ✅ Server dependencies installed"

echo "  📦 Installing client dependencies..."
cd ../client && npm install
echo "  ✅ Client dependencies installed"

echo ""
echo "  ✅ Setup complete!"
echo ""
echo "  Next steps:"
echo "    1. Edit server/.env — add your MongoDB URI"
echo "    2. Run: bash start-dev.sh"
echo ""
