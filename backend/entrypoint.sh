#!/bin/sh

# Wait for DB to be ready
echo "Waiting for database at db:5432..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is up!"

# Run migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting backend..."
npm start
