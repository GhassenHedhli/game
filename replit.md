# Gravity Gladiator - Zero-Gravity Physics Combat Game

## Overview

Gravity Gladiator is a physics-based arcade fighter built as a web game where players control unique gladiators in zero-gravity arenas. The game features momentum-based combat, environmental hazards, and progressive difficulty AI opponents. Built with React Three Fiber for 3D rendering, the application provides an immersive browser-based gaming experience targeting casual gamers with 3-7 minute play sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- **React 18** with TypeScript for UI components and game state management
- **React Three Fiber** (@react-three/fiber) for 3D scene rendering and WebGL integration
- **Three.js** as the underlying 3D graphics library
- **React Three Drei** for 3D helpers and controls (KeyboardControls, camera utilities)
- **React Three Postprocessing** for visual effects and post-processing filters
- **Vite** as the build tool and development server with custom configuration for 3D assets

**UI Framework:**
- **Tailwind CSS** for utility-first styling with custom theme configuration
- **Radix UI** components for accessible, unstyled UI primitives (dialogs, dropdowns, buttons, etc.)
- **shadcn/ui** design system built on top of Radix UI
- **class-variance-authority** and **clsx** for conditional styling

**State Management:**
- **Zustand** stores (inferred from store patterns in `useGameStore`, `useAudio`, `useParticleStore`)
- Custom hooks for game state, audio management, and particle effects
- LocalStorage integration for data persistence

**Game Architecture:**
- Custom zero-gravity physics engine (`ZeroGravityPhysics` class)
- Component-based scene structure (Arena, Player, Enemy, Hazards, ParticleEffects)
- Keyboard-based controls with configurable key mappings
- Frame-based animation loop using `useFrame` hook from React Three Fiber

### Backend Architecture

**Server Framework:**
- **Express.js** as the HTTP server framework
- Node.js runtime with ESM module system
- Custom middleware for request logging and JSON response capturing

**Development Environment:**
- Vite middleware integration for HMR (Hot Module Replacement) in development
- Separate build output for client (dist/public) and server (dist/index.js)
- Static file serving in production mode

**Storage Layer:**
- In-memory storage implementation (`MemStorage` class)
- Abstract storage interface (`IStorage`) allowing for future database integration
- User management with username/password schema (prepared for authentication)

### Data Storage Solutions

**Database Configuration:**
- **Drizzle ORM** configured for PostgreSQL dialect
- **Neon Database** (@neondatabase/serverless) as the serverless PostgreSQL provider
- Schema-first approach with TypeScript types generated from Drizzle schema
- **Zod** integration for runtime validation of insert operations

**Schema Design:**
- Users table with serial ID, unique username, and password fields
- Migration files stored in `/migrations` directory
- Shared schema location (`shared/schema.ts`) accessible to both client and server

**Note:** While Drizzle and Postgres are configured, the current implementation uses in-memory storage. The database infrastructure is prepared but not actively connected.

### Authentication and Authorization

**Prepared Infrastructure:**
- User schema with username/password fields
- Session management dependencies installed (connect-pg-simple for PostgreSQL-backed sessions)
- Storage interface includes user lookup methods (by ID and username)
- No active authentication implementation yet

### External Dependencies

**3D Asset Loading:**
- Support for GLTF/GLB 3D model formats
- GLSL shader support via vite-plugin-glsl
- Audio file formats: MP3, OGG, WAV

**Third-Party Services:**
- Neon Database (serverless PostgreSQL hosting)
- GamePix platform integration (inferred from game design document)

**Key Libraries:**
- **TanStack Query** (React Query) for data fetching and caching
- **date-fns** for date manipulation
- **nanoid** for unique ID generation
- **cmdk** for command palette functionality

**Development Tools:**
- **TypeScript** for static typing
- **tsx** for running TypeScript in development
- **esbuild** for bundling server code
- **PostCSS** with Autoprefixer for CSS processing

### Application Structure

**Directory Organization:**
- `/client` - Frontend React application
  - `/src/components/game` - Game-specific 3D components and UI
  - `/src/components/ui` - Reusable UI components (shadcn/ui)
  - `/src/lib` - Utilities, stores, and game data
- `/server` - Backend Express application
- `/shared` - Shared code between client and server (schema, types)
- `/migrations` - Database migration files

**Game Data Architecture:**
- Character system with rarity tiers, stats (weight, power, agility, health), and unlock costs
- Arena system with difficulty levels, environmental hazards, and visual themes
- Game modes: Arcade (8 opponents), Endless (wave-based), Daily Challenge
- Physics-based combat with momentum transfer and collision detection

**Performance Considerations:**
- Custom physics engine for zero-gravity simulation
- Particle system with lifecycle management
- Frame-based updates with delta time calculations
- Asset preloading for 3D models and audio files