#!/bin/bash

# TransfIT - Quick Start Server Script

echo " Starting TransfIT on http://localhost:8000"
echo ""
echo " Test Credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo " Open in browser:"
echo "   http://localhost:8000/Start/Login.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8000
