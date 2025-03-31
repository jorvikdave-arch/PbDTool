import type { Character, GameInstance, Encounter, EncounterParticipant } from './types';

/**
 * Database class for managing game data in IndexedDB
 * Handles persistence of characters, game instances, and encounters
 */
class GameDatabase {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'pbd-buddy';
  private readonly VERSION = 1;

  /**
   * Initializes the IndexedDB database and creates object stores if needed
   * @returns Promise that resolves when the database is ready
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create character store with instanceId index
        if (!db.objectStoreNames.contains('characters')) {
          const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
          characterStore.createIndex('instanceId', 'instanceId', { unique: false });
        }

        // Create game instances store
        if (!db.objectStoreNames.contains('instances')) {
          db.createObjectStore('instances', { keyPath: 'id' });
        }

        // Create encounters store with instanceId index
        if (!db.objectStoreNames.contains('encounters')) {
          const encounterStore = db.createObjectStore('encounters', { keyPath: 'id' });
          encounterStore.createIndex('instanceId', 'instanceId', { unique: false });
        }
      };
    });
  }

  /**
   * Adds or updates a character in the database
   * @param character - The character to save
   * @returns Promise that resolves with the operation result
   */
  async addCharacter(character: Character) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      const request = store.put(character);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Retrieves a character by ID
   * @param id - The character's unique identifier
   * @returns Promise that resolves with the character or undefined if not found
   */
  async getCharacter(id: string) {
    if (!this.db) await this.init();
    return new Promise<Character>((resolve, reject) => {
      const transaction = this.db!.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Retrieves all characters from the database
   * @returns Promise that resolves with an array of all characters
   */
  async getAllCharacters() {
    if (!this.db) await this.init();
    return new Promise<Character[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Deletes a character from the database
   * @param id - The character's unique identifier
   * @returns Promise that resolves when the character is deleted
   */
  async deleteCharacter(id: string) {
    if (!this.db) await this.init();
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Adds or updates a game instance in the database
   * @param instance - The game instance to save
   * @returns Promise that resolves with the operation result
   */
  async addInstance(instance: GameInstance) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['instances'], 'readwrite');
      const store = transaction.objectStore('instances');
      const request = store.put(instance);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getInstance(id: string) {
    if (!this.db) await this.init();
    return new Promise<GameInstance>((resolve, reject) => {
      const transaction = this.db!.transaction(['instances'], 'readonly');
      const store = transaction.objectStore('instances');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllInstances() {
    if (!this.db) await this.init();
    return new Promise<GameInstance[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['instances'], 'readonly');
      const store = transaction.objectStore('instances');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteInstance(id: string) {
    if (!this.db) await this.init();
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['instances', 'characters'], 'readwrite');
      const instanceStore = transaction.objectStore('instances');
      const characterStore = transaction.objectStore('characters');
      const characterIndex = characterStore.index('instanceId');

      const getCharacters = characterIndex.getAll(id);
      getCharacters.onsuccess = () => {
        const characters = getCharacters.result;
        characters.forEach(char => {
          characterStore.delete(char.id);
        });
      };

      const deleteInstance = instanceStore.delete(id);
      deleteInstance.onerror = () => reject(deleteInstance.error);
      deleteInstance.onsuccess = () => resolve();
    });
  }

  async getInstanceCharacters(instanceId: string) {
    if (!this.db) await this.init();
    return new Promise<Character[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const index = store.index('instanceId');
      const request = index.getAll(instanceId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Encounter methods
  async addEncounter(encounter: Encounter) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['encounters'], 'readwrite');
      const store = transaction.objectStore('encounters');
      const request = store.put(encounter);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getEncounter(id: string) {
    if (!this.db) await this.init();
    return new Promise<Encounter>((resolve, reject) => {
      const transaction = this.db!.transaction(['encounters'], 'readonly');
      const store = transaction.objectStore('encounters');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getInstanceEncounters(instanceId: string) {
    if (!this.db) await this.init();
    return new Promise<Encounter[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['encounters'], 'readonly');
      const store = transaction.objectStore('encounters');
      const index = store.index('instanceId');
      const request = index.getAll(instanceId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteEncounter(id: string) {
    if (!this.db) await this.init();
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['encounters'], 'readwrite');
      const store = transaction.objectStore('encounters');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Export a singleton instance of the database
export const db = new GameDatabase(); 