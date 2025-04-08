# PbDTool - Pathfinder/D&D Tool

A Progressive Web Application (PWA) for managing tabletop RPG characters, encounters, and game sessions.

## Features

- Character Management
- Game Instance Tracking
- Encounter Management
- Offline Support
- PWA Installation

## Tech Stack

- Svelte + SvelteKit
- IndexedDB (Dexie.js)
- TypeScript
- Workbox.js
- Vercel Deployment

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pbdtool.git
cd pbdtool
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type-check the codebase
- `npm run test` - Run tests
- `npm run lint` - Lint the codebase
- `npm run format` - Format the codebase

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── db/            # Database configuration
│   ├── services/      # Business logic
│   ├── stores/        # Svelte stores
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
├── routes/            # SvelteKit routes
└── app.html          # App template
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
