# GaneshLab Consultation - Admin Dashboard

**GaneshLab Consultation** - Modern admin dashboard built with Next.js, TypeScript, and Shadcn UI. Includes multiple dashboards, authentication layouts, customizable theme presets, and more.

## Features

- Built with Next.js 16, TypeScript, Tailwind CSS v4, and Shadcn UI
- Responsive and mobile-friendly
- 42 customizable theme presets (light/dark modes with color schemes)
- Flexible layouts (collapsible sidebar, variable content widths)
- Authentication flows and screens
- Prebuilt dashboards (Default, CRM, Finance)
- Role-Based Access Control (RBAC) with config-driven UI and multi-tenant support _(planned)_

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Validation**: Zod
- **Forms & State Management**: React Hook Form, Zustand
- **Tables & Data Handling**: TanStack Table
- **Tooling & DX**: ESLint, Prettier, Husky

## Screens

### Available

- Default Dashboard
- CRM Dashboard
- Finance Dashboard
- Authentication (4 screens)

### Coming Soon

- Analytics Dashboard
- eCommerce Dashboard
- Academy Dashboard
- Logistics Dashboard
- Email Page
- Chat Page
- Calendar Page
- Milestone Tracking
- Invoice Page
- Users Management
- Roles Management

## Getting Started

### Prerequisites

- Node.js 18+ and npm (for local development)
- OR Docker and Docker Compose (recommended for team development)

### Installation

#### Option 1: Using Docker (Recommended for Team Development)

This ensures all developers have the same environment.

1. **Clone the repository**

   ```bash
   git clone https://github.com/XenchinRyu7/GaneshLab-Consultation.git
   ```

2. **Navigate into the project**

   ```bash
   cd GaneshLab-Consultation
   ```

3. **Start with Docker Compose**

   ```bash
   docker-compose up
   ```

4. **Or build and run in detached mode**
   ```bash
   docker-compose up -d --build
   ```

Your app will be running at [http://localhost:3000](http://localhost:3000)

**Docker Commands:**

- `docker-compose up` - Start development server
- `docker-compose up -d` - Start in detached mode (background)
- `docker-compose down` - Stop containers
- `docker-compose logs -f` - View logs
- `docker-compose exec app npm run lint` - Run commands inside container

#### Option 2: Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/XenchinRyu7/GaneshLab-Consultation.git
   ```

2. **Navigate into the project**

   ```bash
   cd GaneshLab-Consultation
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

Your app will be running at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run generate:presets` - Generate theme presets TypeScript definitions

## Docker

### Development

The project includes Docker setup for consistent development environments across the team.

**Files:**

- `Dockerfile.dev` - Development Docker image
- `docker-compose.yml` - Docker Compose configuration for development
- `Dockerfile` - Production Docker image (standalone output)

**Features:**

- Hot reload enabled (volume mounting)
- Consistent Node.js version (20-alpine)
- Automatic theme preset generation
- Isolated dependencies

### Production Build

To build and run production Docker image:

```bash
# Build production image
docker build -t ganeshlab-consultation:latest .

# Run production container
docker run -p 3000:3000 ganeshlab-consultation:latest
```

## Project Structure

This project follows a **colocation-based architecture** where each feature keeps its own pages, components, and logic inside its route folder. Shared UI, hooks, and configuration live at the top level, making the codebase modular, scalable, and easier to maintain.

```
src
├── app               # Next.js routes (App Router)
├── components        # Shared UI components
├── hooks             # Reusable hooks
├── lib               # Config & utilities
├── styles            # Tailwind / theme setup
│   └── presets       # Theme presets (42 themes)
└── types             # TypeScript definitions
```

## Theme Presets

The project includes 42 theme presets including:

- Default (Shadcn Neutral)
- Tangerine
- Neo Brutalism
- Soft Pop
- And 38 more themes from Tweakcn

You can switch themes dynamically in the application settings.

---

**Built with ❤️ by GaneshLab**
