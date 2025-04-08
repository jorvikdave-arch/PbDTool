import type { Character, GameInstance, Encounter } from '../types';
import Dexie from 'dexie';

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

// Initialize the database
export async function initDB() {
  try {
    await db.open();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
