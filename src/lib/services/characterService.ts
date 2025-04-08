import type { Character } from '../types';
import { db } from '../db';

export const characterService = {
  async create(character: Omit<Character, 'id'>): Promise<Character> {
    try {
      const id = crypto.randomUUID();
      const newCharacter = { ...character, id };
      await db.characters.add(newCharacter);
      return newCharacter;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  },

  async get(id: string): Promise<Character | undefined> {
    try {
      return await db.characters.get(id);
    } catch (error) {
      console.error('Error getting character:', error);
      throw error;
    }
  },

  async update(id: string, character: Partial<Character>): Promise<void> {
    try {
      await db.characters.update(id, character);
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.characters.delete(id);
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  },

  async getAll(): Promise<Character[]> {
    try {
      return await db.characters.toArray();
    } catch (error) {
      console.error('Error getting all characters:', error);
      throw error;
    }
  },

  async updateHitPoints(id: string, current: number): Promise<void> {
    try {
      await db.characters.update(id, {
        hitPoints: { current }
      });
    } catch (error) {
      console.error('Error updating character hit points:', error);
      throw error;
    }
  }
};
