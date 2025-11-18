#!/bin/sh
set -e

# Generate Prisma Client if needed (important for volume mounts)
echo "🔧 Generating Prisma Client..."
npx prisma generate || {
  echo "⚠  Warning: Prisma generate failed, but continuing..."
}

# Execute the main command
echo "🚀 Starting application..."
exec "$@"