import type { Character, GameInstance, Encounter } from '../types';
import Dexie from 'dexie';

/**
 * Database class for managing game data in IndexedDB
 * Handles persistence of characters, game instances, and encounters
 */
export class GameDB extends Dexie {
  characters!: Dexie.Table<Character, string>;
  instances!: Dexie.Table<GameInstance, string>;
  encounters!: Dexie.Table<Encounter, string>;

  constructor() {
    super('GameDB');
    this.version(1).stores({
      characters: 'id, name, type, level',
      instances: 'id, name, date',
      encounters: 'id, name, gameInstanceId'
    });
  }
}

export const db = new GameDB();
