import type { GameInstance } from '../types';
import { db } from '../db';

export const gameInstanceService = {
  async create(gameInstance: Omit<GameInstance, 'id'>): Promise<GameInstance> {
    try {
      const id = crypto.randomUUID();
      const newInstance = { ...gameInstance, id };
      await db.instances.add(newInstance);
      return newInstance;
    } catch (error) {
      console.error('Error creating game instance:', error);
      throw error;
    }
  },

  async get(id: string): Promise<GameInstance | undefined> {
    try {
      return await db.instances.get(id);
    } catch (error) {
      console.error('Error getting game instance:', error);
      throw error;
    }
  },

  async update(id: string, gameInstance: Partial<GameInstance>): Promise<void> {
    try {
      await db.instances.update(id, gameInstance);
    } catch (error) {
      console.error('Error updating game instance:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.instances.delete(id);
    } catch (error) {
      console.error('Error deleting game instance:', error);
      throw error;
    }
  },

  async getAll(): Promise<GameInstance[]> {
    try {
      return await db.instances.toArray();
    } catch (error) {
      console.error('Error getting all game instances:', error);
      throw error;
    }
  },

  async addCharacter(gameInstanceId: string, characterId: string): Promise<void> {
    try {
      const gameInstance = await db.instances.get(gameInstanceId);
      if (!gameInstance) {
        throw new Error('Game instance not found');
      }

      if (!gameInstance.characters.includes(characterId)) {
        await db.instances.update(gameInstanceId, {
          characters: [...gameInstance.characters, characterId]
        });
      }
    } catch (error) {
      console.error('Error adding character to game instance:', error);
      throw error;
    }
  },

  async removeCharacter(gameInstanceId: string, characterId: string): Promise<void> {
    try {
      const gameInstance = await db.instances.get(gameInstanceId);
      if (!gameInstance) {
        throw new Error('Game instance not found');
      }

      await db.instances.update(gameInstanceId, {
        characters: gameInstance.characters.filter((id) => id !== characterId)
      });
    } catch (error) {
      console.error('Error removing character from game instance:', error);
      throw error;
    }
  },

  async updateExperiencePoints(gameInstanceId: string, experiencePoints: number): Promise<void> {
    try {
      await db.instances.update(gameInstanceId, { experiencePoints });
    } catch (error) {
      console.error('Error updating experience points:', error);
      throw error;
    }
  }
};
