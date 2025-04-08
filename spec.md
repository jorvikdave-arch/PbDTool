# PbDTool - Pathfinder/D&D Tool Specification

## Project Overview

PbDTool is a Progressive Web Application (PWA) designed to assist tabletop RPG players and Game Masters in managing their games. The application provides tools for character management, encounter tracking, and game session organization.

## Technical Stack

- **Frontend Framework**: Svelte + SvelteKit
- **Data Storage**:
  - Primary: IndexedDB (via Dexie.js)
  - Backup: LocalStorage for small data
- **Clipboard Operations**: Native Clipboard API
- **PWA Features**: Workbox.js for service worker and caching
- **Deployment**: Vercel
- **Version Control**: GitHub
- **CI/CD**: Vercel CI/CD pipeline

## Core Features

### 1. Character Management

- Create, read, update, and delete characters
- Track character attributes:
  - Basic info (name, level, class, race)
  - Hit points (current and maximum)
  - Armor class
  - Ability scores
  - Skills and proficiencies
  - Equipment and inventory

### 2. Game Instance Management

- Create and manage game sessions
- Track active encounters
- Store game history
- Link characters to game instances
- Track experience points and level progression

### 3. Encounter Management

- Create and manage encounters
- Track initiative order
- Monitor character status during encounters
- Record combat outcomes
- Link encounters to game instances

### 4. Data Models

#### Character

```typescript
interface Character {
  id: string;
  name: string;
  level: number;
  class: string;
  race: string;
  hitPoints: {
    current: number;
    maximum: number;
  };
  armorClass: number;
  // Additional fields to be defined
}
```

#### Game Instance

```typescript
interface GameInstance {
  id: string;
  name: string;
  date: Date;
  characters: string[]; // Character IDs
  encounters: string[]; // Encounter IDs
  notes: string;
}
```

#### Encounter

```typescript
interface Encounter {
  id: string;
  name: string;
  gameInstanceId: string;
  participants: {
    characterId: string;
    initiative: number;
    status: string;
  }[];
  notes: string;
}
```

## Technical Requirements

### 1. Data Persistence

- Implement IndexedDB using Dexie.js for primary storage
- Use LocalStorage for small, frequently accessed data
- Implement data migration strategies
- Ensure data backup and recovery mechanisms

### 2. PWA Features

- Offline functionality
- Installable on supported devices
- Push notifications (future feature)
- Service worker for caching
- Responsive design for all device sizes

### 3. Performance Requirements

- Initial load time < 2 seconds
- Smooth transitions between pages
- Efficient data loading and caching
- Minimal memory footprint

### 4. Security

- Client-side data encryption
- Secure clipboard operations
- No sensitive data storage in plain text
- Regular security audits

## Development Guidelines

### Code Organization

- Follow SvelteKit project structure
- Implement feature-based folder organization
- Keep components small and focused
- Maximum file length: 200-300 lines
- Regular code refactoring

### Testing

- Unit tests for all major functionality
- Component testing
- Integration testing
- End-to-end testing for critical paths

### Documentation

- Inline code documentation
- API documentation
- User documentation
- Deployment documentation

## Deployment Strategy

1. Development environment
2. Staging environment
3. Production environment
4. Continuous deployment via Vercel

## Future Enhancements

- Character sheet templates
- Dice rolling functionality
- Spell management
- Campaign management
- Multi-user support
- Cloud synchronization

## Maintenance

- Regular dependency updates
- Performance monitoring
- Error tracking
- User feedback collection
- Regular security updates
