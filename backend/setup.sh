#!/bin/bash

# Backend Setup Script for Pickleball Court Booking System
echo "🏓 Setting up Pickleball Court Booking Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p uploads/courts
mkdir -p uploads/users
echo "✅ Directories created"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo "⚠️  Please update the .env file with your actual configuration values"
else
    echo "✅ .env file already exists"
fi

# Initialize database (optional seed data)
echo "🗄️  Database initialization..."
echo "💡 Make sure MongoDB is running before starting the server"

# Check if MongoDB is running
if command -v mongosh &> /dev/null; then
    echo "✅ MongoDB CLI (mongosh) is available"
elif command -v mongo &> /dev/null; then
    echo "✅ MongoDB CLI (mongo) is available"
else
    echo "⚠️  MongoDB CLI not found. Please ensure MongoDB is installed and running"
fi

echo ""
echo "🎉 Backend setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Make sure MongoDB is running"
echo "3. Start the server with: npm run dev"
echo ""
echo "🔧 Available scripts:"
echo "  npm run dev     - Start development server with nodemon"
echo "  npm start       - Start production server"
echo "  npm run test    - Run tests"
echo ""
echo "📖 API Documentation will be available at: http://localhost:3000/api"
echo "🏥 Health check: http://localhost:3000/health"