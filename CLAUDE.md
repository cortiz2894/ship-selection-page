# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 13 web-based 3D shooting game called "Laser Drift" featuring vaporwave aesthetics, hand tracking controls (via MediaPipe), mobile touch controls, and retro/classic game modes. The game is built with React Three Fiber for 3D rendering and uses Firebase for high score persistence.

## Core Technologies

- **Framework**: Next.js 13 (App Router)
- **3D Rendering**: React Three Fiber (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- **Hand Tracking**: MediaPipe Hands & TensorFlow.js (@mediapipe/hands, @tensorflow-models/handpose)
- **Animations**: GSAP, Rive (@rive-app/react-canvas)
- **Backend**: Firebase (Firestore for high scores)
- **PWA**: next-pwa for Progressive Web App support
- **Styling**: Tailwind CSS, SCSS Modules

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Cloudflare deployment build (uses Makefile)
make build  # npx @cloudflare/next-on-pages
make dev    # npx wrangler pages dev
make run    # build + dev
```

## Architecture

### Game State Management

The game uses React Context for global state management through `context/game-context.tsx`. The `GameProvider` wraps the entire game and provides:

- **Game State**: `isPaused`, `gameOver`, `tutorial`, `score`, `combo`, `comboMultiplier`, `comboLevel`
- **Health**: `life` (player health), `lifeStation` (space station health)
- **Settings**: `isMusicEnabled`, `isBlurActive`, `isEffectsActive`, `retroMode`
- **Methods**: `togglePause()`, `toggleMusic()`, `toggleEffects()`, `resetCombo()`

Access via `useGameContext()` hook in any component within the provider.

### Game Flow

1. **app/page.tsx**: Main entry point, orchestrates game states
   - States: `"menu"` → `"modeSelection"` → `"intro"` → `"playing"`
   - Handles hand tracking initialization, background music, disclaimer, orientation checks
   - Mobile/desktop detection via `useMobile()` hook

2. **components/Scene.tsx**: Main 3D scene wrapper
   - Renders two separate Canvas instances (game scene + vaporwave terrain background)
   - Manages camera shake effects based on damage
   - Contains UI overlays (LifeBar, Score, ComboScore, PauseMenu, GameOverMenu, TutorialMenu)
   - Applies post-processing effects (RGB shift, gamma correction, motion blur, CRT filter)

3. **components/GameScene/index.tsx**: Core game logic
   - Custom hooks pattern for separation of concerns:
     - `useAsteroids()` - asteroid state management
     - `useTalismans()` - power-up state management
     - `useBullets()` - bullet state management
     - `useAsteroidSpawner()` - asteroid spawn logic
     - `useRareAsteroidSpawner()` - rare asteroid spawn logic
     - `useTalismanSpawner()` - talisman spawn logic
     - `useCollisionDetection()` - bullet-asteroid collision
     - `useTalismanCollision()` - player-talisman collision
     - `useGameState()` - invulnerability, damage handling
     - `useGameEffects()` - particle effects, explosions, floating scores

### Component Structure

- **Components are organized by feature** in `/components` directory
- Each major component has its own folder (e.g., `GameScene/`, `TitleScreen/`, `HandTracking/`)
- Shared hooks in `/utils` and component-specific hooks in component subdirectories (e.g., `components/GameScene/hooks/`)
- Types in `/types` (general.ts, animations.ts, jsx.d.ts, index.ts)
- Constants in `/constants` (index.ts, animations.ts)
- Assets in `/public` and `/src/assets`

### Input Handling

- **Desktop**: Hand tracking via MediaPipe (`components/HandTracking/`)
  - Detects hand position and maps to 3D space
  - Crosshair follows hand position
- **Mobile**: Touch controls (`components/MobileControl/`)
  - Touch position mapped to game coordinates
  - Portrait mode triggers `LandscapeMessage` component

### Audio System

- **Background Music**: Managed in `app/page.tsx` with fade in/out
- **Sound Effects**: `components/SoundEffects/` - singleton pattern via `getSoundManager()`
- **In-Game Audio**: `components/AudioManager/` - game music with React Context integration
- **Audio utilities**: `utils/audioMenu.ts` for menu sounds

### Game Modes

Defined in `types/general.ts`:
- `"classic"`: Modern gameplay with full effects
- `"retro"`: 4:3 aspect ratio with CRT filter overlay

Mode is selected in `components/GameMode/` and passed through to `Scene` component.

### PWA Configuration

- Configured via `next-pwa` in `next.config.js`
- Service worker registration enabled
- Disabled in development mode
- Install prompt: `components/PWAInstallNotification/`

### Firebase Integration

- Configuration: `lib/firebase.ts`
- Used for high score persistence (`components/HighScores/`, `components/ScoreForm/`)
- Firestore database instance exported as `db`

## Important Patterns

### Component Pattern
Most game components follow this structure:
```tsx
"use client"
import { useGameContext } from "@/context/game-context"

export function Component() {
  const { isPaused, gameOver, score } = useGameContext()
  // Component logic respects game state (isPaused, gameOver)
  return (/* JSX */)
}
```

### Three.js Integration
Components using Three.js follow React Three Fiber conventions:
- Use `useFrame()` for game loop updates
- Use `useThree()` for accessing renderer/camera/scene
- Refs for accessing Three.js objects: `useRef<THREE.Mesh>()`

### Performance Optimization
- Dynamic imports for heavy components (e.g., Scene in app/page.tsx)
- Suspense boundaries with loading fallbacks
- `useMemo` and `useCallback` for expensive computations
- Pre-loading assets (audio, textures)

## Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to project root

Example: `import { useGameContext } from "@/context/game-context"`

## Known Issues

- TypeScript `@ts-ignore` comments present in some Three.js integrations
- HandTracking requires HTTPS for camera access
- Mobile portrait mode not supported - landscape required

## Testing Notes

- No test framework currently configured
- Manual testing required for:
  - Hand tracking calibration
  - Mobile touch controls
  - Score persistence to Firebase
  - PWA installation flow
  - Audio playback across browsers
