#!/bin/bash

# Vector Indexing System Setup Script

echo "🚀 Setting up Vector Indexing System..."

# Check if Python 3.11+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Initialize database
echo "🗄️  Initializing database..."
python -m app.cli init-db

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the services: docker-compose up -d"
echo "3. Run tests: python test_system.py"
echo "4. Start API server: uvicorn app.main:app --reload"
echo "5. Use CLI: python -m app.cli --help"