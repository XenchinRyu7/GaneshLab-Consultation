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
- **docker-compose.yml** - Main compose configuration with named volumes
- **docker-compose.dev.yml** - Development overrides (optional)

### Volume Configuration

The `docker-compose.yml` uses **named volumes** for better management:
- `node_modules` - Isolated node_modules from container (not from host)
- `next_cache` - Next.js build cache (.next directory)

This prevents anonymous volumes with hash names and makes cleanup easier.

### Prisma Setup

This project uses **Prisma** as the database ORM for PostgreSQL (Supabase). Prisma is used for:
- **Authentication** - User profiles, login, password management
- **Database queries** - All database operations through Prisma Client
- **Type safety** - TypeScript types generated from database schema

**Important:** Prisma Client must be generated after installing dependencies. This is handled automatically:
- ✅ **Dockerfile.dev** - Runs `prisma generate` during image build
- ✅ **package.json** - Has `postinstall` script that runs `prisma generate`
- ✅ **Manual**: Run `npx prisma generate` if needed

The Prisma schema is located at `prisma/schema.prisma` and defines the database structure.

## Common Commands

### Development

```bash
# Start with hot reload
docker-compose up

# Rebuild image and start container (recommended when dependencies change)
docker-compose up -d --build

# Rebuild image only
docker-compose build

# Rebuild image without cache (clean build)
docker-compose build --no-cache

# Run commands inside container
docker-compose exec app npm run lint
docker-compose exec app npm run format
docker-compose exec app npm run generate:presets

# Access container shell
docker-compose exec app sh
```

### Image Management

```bash
# List all images
docker images

# Remove dangling images (<none>)
docker image prune -f

# Remove all unused images (not just dangling)
docker image prune -a -f

# Remove specific image
docker rmi <image-id>
```

### Volume Management

```bash
# List all volumes
docker volume ls

# Remove unused volumes (WARNING: removes volumes not used by any container)
docker volume prune -f

# Remove specific volume
docker volume rm <volume-name>

# Inspect volume details
docker volume inspect <volume-name>
```

### Container Management

```bash
# List all containers (running and stopped)
docker ps -a

# Remove stopped containers
docker container prune -f

# Remove specific container
docker rm <container-id>

# Stop and remove container
docker stop <container-id> && docker rm <container-id>
```

### System Cleanup

```bash
# Remove unused containers, networks, images (dangling), and build cache
docker system prune

# Remove everything including unused images and volumes (WARNING: destructive)
docker system prune -a --volumes

# Check disk usage
docker system df
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

## Image Management & Best Practices

### Understanding Docker Images

When you build a Docker image, Docker assigns a tag (usually `latest`). When you rebuild with the same tag:

1. **New image is created** with the same tag (`latest`)
2. **Old image loses its tag** and becomes `<none>` (dangling image)
3. **Old image is NOT automatically deleted** to prevent data loss
4. **Running containers continue using the old image** until recreated

### When to Rebuild

Rebuild your Docker image when:
- ✅ **Dependencies change** (`package.json`, `package-lock.json`)
- ✅ **Dockerfile changes** (new commands, different base image)
- ✅ **System libraries are updated**
- ✅ **Configuration files change** that are copied into image

You don't need to rebuild when:
- ❌ Only source code changes (handled by volume mounting in dev)
- ❌ Only `.env` file changes (loaded at runtime)

### Best Practices

1. **Always rebuild and recreate after dependency changes:**
   ```bash
   docker-compose up -d --build
   ```
   This ensures your container uses the latest image with new dependencies.

2. **Clean up dangling images regularly:**
   ```bash
   # Remove dangling images (<none>)
   docker image prune -f
   ```
   This frees up disk space. Dangling images are safe to remove if no containers are using them.

3. **Use `--no-cache` for clean builds:**
   ```bash
   docker-compose build --no-cache
   ```
   Use when you suspect cached layers are causing issues.

4. **Check image usage before removing:**
   ```bash
   # List all images
   docker images
   
   # Check which containers are using an image
   docker ps -a
   ```

### Handling Dangling Images (`<none>`)

If you see images with `<none>` tag in Docker Desktop:

1. **Check if any containers are using it:**
   ```bash
   docker ps -a
   ```

2. **If no containers are using it, safe to remove:**
   ```bash
   docker image prune -f
   ```

3. **If container is still using old image:**
   ```bash
   # Stop and remove container
   docker-compose down
   
   # Rebuild and recreate with new image
   docker-compose up -d --build
   
   # Now safe to remove old image
   docker image prune -f
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

### Container using old image after rebuild
- Stop and remove container: `docker-compose down`
- Rebuild and recreate: `docker-compose up -d --build`
- Verify with: `docker ps` (check image ID matches latest build)

### Dangling images (`<none>`) accumulating
- This is normal behavior - old images become dangling when rebuilt
- Clean up with: `docker image prune -f`
- Set up periodic cleanup: `docker system prune -a --volumes` (use carefully!)

## Environment Variables

Create `.env` file in project root for environment variables:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

These will be automatically loaded by Docker Compose.

## Disk Space Management

Docker images, containers, volumes, and build cache can consume significant disk space. Regular cleanup helps:

### Understanding Docker Components

Docker memiliki 4 komponen utama yang menyimpan data:

1. **Images** - Template untuk membuat containers
2. **Containers** - Running instances dari images
3. **Volumes** - Persistent storage untuk data (database, files, dll)
4. **Build Cache** - Cache dari layer-layer build

### Cleanup Commands

```bash
# Check disk usage (shows size of each component)
docker system df

# Remove only dangling images (<none>)
docker image prune -f

# Remove unused volumes (WARNING: removes volumes not used by any container)
docker volume prune -f

# Remove stopped containers
docker container prune -f

# Remove build cache
docker builder prune -f

# Remove everything unused (images, containers, networks, build cache)
docker system prune

# Remove everything including unused images and volumes (WARNING: very destructive!)
docker system prune -a --volumes
```

### Anonymous Volumes vs Named Volumes

**Anonymous Volumes (nama hash panjang):**
- Dibuat otomatis oleh Docker ketika mount path tanpa nama
- Contoh: `/app/node_modules` di docker-compose.yml tanpa nama
- Nama: hash panjang seperti `41c3e8ce4207a3a1b26b173ef73965d549d19e225210b0fcb4de39e61241f2c8`
- Sulit diidentifikasi dan dikelola

**Named Volumes (nama jelas):**
- Dibuat dengan nama eksplisit di docker-compose.yml
- Contoh: `node_modules:/app/node_modules`
- Nama: jelas seperti `ganeshlab-consultation-dashboard_node_modules`
- Mudah diidentifikasi dan dikelola

**Best Practice:** Gunakan named volumes untuk kemudahan manajemen!

### Why Volumes Don't Get Removed with `docker image prune`

**Important:** `docker image prune -f` hanya menghapus **images**, bukan volumes!

- **Images** = Template/blueprint untuk containers
- **Volumes** = Persistent storage untuk data (database, uploaded files, dll)

Volumes tidak otomatis terhapus karena:
- ✅ **Data protection** - Volume mungkin berisi data penting (database, user uploads)
- ✅ **Safety** - Mencegah kehilangan data secara tidak sengaja
- ✅ **Separation of concerns** - Images dan volumes adalah komponen berbeda

### Recommended Cleanup Workflow

```bash
# 1. Check what's taking space
docker system df

# 2. Remove dangling images (safe)
docker image prune -f

# 3. Remove unused volumes (careful - check first!)
docker volume ls  # Check which volumes exist
docker volume prune -f  # Remove unused ones

# 4. Remove stopped containers (safe)
docker container prune -f

# 5. Remove build cache (safe, will rebuild on next build)
docker builder prune -f
```

### When to Remove Volumes

⚠️ **Be careful when removing volumes!** They may contain important data.

**Safe to remove:**
- ✅ Volumes from deleted containers
- ✅ Anonymous volumes (long hash names)
- ✅ Volumes you know are no longer needed

**Do NOT remove if:**
- ❌ Volume is used by a running container
- ❌ Volume contains important data (database, user files)
- ❌ You're not sure what's inside

**Check volume usage before removing:**
```bash
# See which containers use which volumes
docker ps -a --format "table {{.Names}}\t{{.Mounts}}"

# Inspect specific volume
docker volume inspect <volume-name>
```

## Benefits

✅ Consistent environment across all developers  
✅ No need to install Node.js locally  
✅ Isolated dependencies  
✅ Easy to onboard new team members  
✅ Production-ready Dockerfile included  
✅ Automatic dependency management through image layers

