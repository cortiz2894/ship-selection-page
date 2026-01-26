# Ship Selection Page - Laser Drift: Neon Blast

A 3D ship selection interface built with Next.js and React Three Fiber. This is the companion repository for my YouTube tutorial series where I build this feature step by step.

<img width="1151" height="783" alt="preview-page-ship" src="https://github.com/user-attachments/assets/c8d9fd8c-3627-46e6-b37d-21850d2db9b8" />


## The Game

This ship selection page is part of [Laser Drift: Neon Blast](https://laserdrift.com/) - a web-based 3D shooting game with vaporwave aesthetics and hand tracking controls.

## YouTube Tutorial Series

Watch the complete 3-part series on how I built this:

| Part | Topic | Link |
|------|-------|------|
| 1 | AI Concept, 3D Modeling & Scene Setup | [Watch](https://youtube.com/watch?v=1TEuFiKimsg) |
| 2 | GLB Bake Texture & Styling | [Watch](https://youtube.com/watch?v=TaafFTBWswo) |
| 3 | Wireframe Reveal & Animations | [Watch](https://youtube.com/watch?v=qUCgF0LKYJk) |

Subscribe to my channel for more game dev content: [@cortizdev](https://www.youtube.com/@cortizdev)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **3D Rendering**: React Three Fiber, Three.js, @react-three/drei
- **Animations**: GSAP
- **Styling**: Tailwind CSS, SCSS Modules
- **Post-processing**: @react-three/postprocessing

## Features

- 3D ship models with custom wireframe reveal animation
- Smooth transitions between ship selections
- Ship stats and description panels
- Particle background system
- Sound effects integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cortiz2894/ship-selection-page.git

# Navigate to the project
cd ship-selection-page

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
├── app/                    # Next.js app router
├── components/
│   ├── ShipSelection/      # Ship selection UI components
│   │   ├── BaseModel/      # 3D base platform
│   │   ├── Ships/          # Ship 3D models
│   │   ├── ShipGrid/       # Ship selection grid
│   │   ├── ShipStats/      # Stats display
│   │   └── ShipDescription/# Description panel
│   ├── WireframeReveal/    # Custom wireframe animation
│   ├── InterfaceBackground/# Particle background
│   └── SoundEffects/       # Audio system
├── public/
│   ├── glb/                # 3D model files
│   └── audio/              # Sound effects
└── constants/              # Ship data definitions
```

## License

This project is open source and available for learning purposes.

## Connect

- YouTube: [@cortizdev](https://www.youtube.com/@cortizdev)
- Game: [laserdrift.com](https://laserdrift.com/)
