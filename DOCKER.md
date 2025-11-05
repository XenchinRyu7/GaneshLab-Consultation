# Docker Setup Guide

This guide explains how to use Docker for development in GaneshLab Meetly project.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Development Mode

```bash
# Start development server
docker-compose up

# Or build and start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Docker Files

- **Dockerfile.dev** - Development image with hot reload
- **Dockerfile** - Production image with standalone output
- **docker-compose.yml** - Main compose configuration
- **docker-compose.dev.yml** - Development overrides (optional)

## Common Commands

### Development

```bash
# Start with hot reload
docker-compose up

# Rebuild image
docker-compose build

# Run commands inside container
docker-compose exec app npm run lint
docker-compose exec app npm run format
docker-compose exec app npm run generate:presets

# Access container shell
docker-compose exec app sh
```

### Production

```bash
# Build production image
docker build -t ganeshlab-meetly:latest .

# Run production container
docker run -p 3000:3000 ganeshlab-meetly:latest

# Or with environment variables
docker run -p 3000:3000 -e NODE_ENV=production ganeshlab-meetly:latest
```

## Troubleshooting

### Docker Desktop not running
- Make sure Docker Desktop is running on Windows/Mac
- Check with: `docker ps`

### Port already in use
- Change port in `docker-compose.yml`: `"3001:3000"`

### File changes not reflecting (Windows)
- File changes should reflect automatically with volume mounting
- If not, try rebuilding: `docker-compose up --build`

### Permission issues (Linux/Mac)
- May need to adjust file permissions
- Or run with: `sudo docker-compose up`

## Environment Variables

Create `.env` file in project root for environment variables:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

These will be automatically loaded by Docker Compose.

## Benefits

✅ Consistent environment across all developers  
✅ No need to install Node.js locally  
✅ Isolated dependencies  
✅ Easy to onboard new team members  
✅ Production-ready Dockerfile included  

