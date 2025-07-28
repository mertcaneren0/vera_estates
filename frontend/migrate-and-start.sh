#!/bin/bash

echo "🚀 Starting Vera Gayrimenkul Application..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    exit 1
fi

echo "📊 Database URL configured"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

# Wait for database to be ready and run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Database migrations completed"

# Seed database if needed (optional)
# npx prisma db seed

echo "🌟 Starting Vera Gayrimenkul server on port ${PORT:-3000}..."

# Start the application
node server.js 