#!/bin/bash

# News Aggregator Setup Script
# This script sets up the news aggregator with all dependencies and initial configuration

set -e

echo "🚀 Setting up Startup News Aggregator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p logs
mkdir -p public

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys."
else
    echo "✅ Environment file already exists"
fi

# Create initial data directory structure
echo "📊 Setting up data structure..."
touch data/.gitkeep
touch logs/.gitkeep

# Test the installation
echo "🧪 Testing installation..."
if npm run test > /dev/null 2>&1; then
    echo "✅ Tests passed"
else
    echo "⚠️ Some tests failed, but installation completed"
fi

# Run initial fetch to test everything works
echo "📰 Running initial news fetch..."
if timeout 30s npm start fetch > /dev/null 2>&1; then
    echo "✅ Initial fetch successful"
else
    echo "⚠️ Initial fetch failed or timed out (this is normal without API keys)"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys (optional but recommended)"
echo "2. Run 'npm start fetch' to fetch news once"
echo "3. Run 'npm start server' to start the API server"
echo "4. Visit http://localhost:3000/health to test the server"
echo ""
echo "Available commands:"
echo "  npm start fetch   - Fetch news once"
echo "  npm start server  - Start API server"
echo "  npm start stats   - Show statistics"
echo "  npm test          - Run tests"
echo ""
echo "API Keys (optional):"
echo "  NewsAPI: https://newsapi.org (100 requests/day free)"
echo "  Mediastack: https://mediastack.com (500 requests/month free)"
echo "  Guardian: https://open-platform.theguardian.com (free)"
echo ""
echo "The aggregator works without API keys using free sources!"