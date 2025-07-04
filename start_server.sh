#!/bin/bash

echo "🚀 Starting Web Server for your website..."
echo "=========================================="
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ ERROR: Python is not installed"
        echo "Please install Python from https://python.org"
        echo "Or use your package manager:"
        echo "  Ubuntu/Debian: sudo apt install python3"
        echo "  macOS: brew install python3"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Python found: $($PYTHON_CMD --version)"
echo "🌐 Starting server..."
echo

# Make the script executable and start the server
chmod +x "$0"
$PYTHON_CMD server.py