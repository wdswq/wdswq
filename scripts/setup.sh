#!/bin/bash

# Knowledge Base Backend Setup Script

echo "🚀 Setting up Knowledge Base Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database configuration"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma:generate

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your database in .env file"
echo "2. Run database migration: pnpm prisma:migrate"
echo "3. Start development server: pnpm start:dev"
echo ""
echo "🔗 Useful endpoints:"
echo "- Health check: http://localhost:3000/health"
echo "- Test database connection: http://localhost:3000/api/test/connection"
echo "- Create sample data: POST http://localhost:3000/api/test/sample-data"