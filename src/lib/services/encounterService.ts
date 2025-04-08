import type { Encounter } from '../types';
import { db } from '../db';

export const encounterService = {
  async create(encounter: Omit<Encounter, 'id'>): Promise<Encounter> {
    try {
      const id = crypto.randomUUID();
      const newEncounter = { ...encounter, id };
      await db.encounters.add(newEncounter);
      return newEncounter;
    } catch (error) {
      console.error('Error creating encounter:', error);
      throw error;
    }
  },

  async get(id: string): Promise<Encounter | undefined> {
    try {
      return await db.encounters.get(id);
    } catch (error) {
      console.error('Error getting encounter:', error);
      throw error;
    }
  },

  async update(id: string, encounter: Partial<Encounter>): Promise<void> {
    try {
      await db.encounters.update(id, encounter);
    } catch (error) {
      console.error('Error updating encounter:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.encounters.delete(id);
    } catch (error) {
      console.error('Error deleting encounter:', error);
      throw error;
    }
  },

  async getAll(): Promise<Encounter[]> {
    try {
      return await db.encounters.toArray();
    } catch (error) {
      console.error('Error getting all encounters:', error);
      throw error;
    }
  },

  async addParticipant(
    encounterId: string,
    characterId: string,
    initiative: number
  ): Promise<void> {
    try {
      const encounter = await db.encounters.get(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      if (!encounter.participants.some((p) => p.characterId === characterId)) {
        await db.encounters.update(encounterId, {
          participants: [
            ...encounter.participants,
            {
              characterId,
              initiative,
              status: 'active'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  },

  async removeParticipant(encounterId: string, characterId: string): Promise<void> {
    try {
      const encounter = await db.encounters.get(encounterId);
      if (!encounter) {
        throw new Error('Encounter not found');
      }

      await db.encounters.update(encounterId, {
        participants: encounter.participants.filter(
          (p) => p.characterId !== characterId
        )
      });
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }
};
