import { db } from "../db";
import type { Encounter } from "../types";

export class EncounterService {
  static async createEncounter(
    encounter: Omit<Encounter, "id">,
  ): Promise<Encounter> {
    try {
      const id = await db.encounters.add(encounter);
      return { ...encounter, id: id.toString() };
    } catch (error) {
      console.error("Error creating encounter:", error);
      throw new Error("Failed to create encounter");
    }
  }

  static async getEncounter(id: string): Promise<Encounter | undefined> {
    try {
      return await db.encounters.get(parseInt(id));
    } catch (error) {
      console.error("Error getting encounter:", error);
      throw new Error("Failed to get encounter");
    }
  }

  static async updateEncounter(
    id: string,
    encounter: Partial<Encounter>,
  ): Promise<void> {
    try {
      await db.encounters.update(parseInt(id), encounter);
    } catch (error) {
      console.error("Error updating encounter:", error);
      throw new Error("Failed to update encounter");
    }
  }

  static async deleteEncounter(id: string): Promise<void> {
    try {
      await db.encounters.delete(parseInt(id));
    } catch (error) {
      console.error("Error deleting encounter:", error);
      throw new Error("Failed to delete encounter");
    }
  }

  static async getAllEncounters(): Promise<Encounter[]> {
    try {
      return await db.encounters.toArray();
    } catch (error) {
      console.error("Error getting all encounters:", error);
      throw new Error("Failed to get encounters");
    }
  }

  static async getEncountersByGameInstance(
    gameInstanceId: string,
  ): Promise<Encounter[]> {
    try {
      return await db.encounters
        .where("gameInstanceId")
        .equals(gameInstanceId)
        .toArray();
    } catch (error) {
      console.error("Error getting encounters by game instance:", error);
      throw new Error("Failed to get encounters by game instance");
    }
  }

  static async addParticipant(
    encounterId: string,
    participant: {
      characterId: string;
      initiative: number;
      status: string;
      hitPoints?: number;
      conditions?: string[];
    },
  ): Promise<void> {
    try {
      const encounter = await this.getEncounter(encounterId);
      if (!encounter) {
        throw new Error("Encounter not found");
      }

      if (
        !encounter.participants.some(
          (p) => p.characterId === participant.characterId,
        )
      ) {
        await db.encounters.update(parseInt(encounterId), {
          participants: [...encounter.participants, participant],
        });
      }
    } catch (error) {
      console.error("Error adding participant to encounter:", error);
      throw new Error("Failed to add participant to encounter");
    }
  }

  static async removeParticipant(
    encounterId: string,
    characterId: string,
  ): Promise<void> {
    try {
      const encounter = await this.getEncounter(encounterId);
      if (!encounter) {
        throw new Error("Encounter not found");
      }

      await db.encounters.update(parseInt(encounterId), {
        participants: encounter.participants.filter(
          (p) => p.characterId !== characterId,
        ),
      });
    } catch (error) {
      console.error("Error removing participant from encounter:", error);
      throw new Error("Failed to remove participant from encounter");
    }
  }

  static async updateParticipantStatus(
    encounterId: string,
    characterId: string,
    status: string,
  ): Promise<void> {
    try {
      const encounter = await this.getEncounter(encounterId);
      if (!encounter) {
        throw new Error("Encounter not found");
      }

      const updatedParticipants = encounter.participants.map((p) =>
        p.characterId === characterId ? { ...p, status } : p,
      );

      await db.encounters.update(parseInt(encounterId), {
        participants: updatedParticipants,
      });
    } catch (error) {
      console.error("Error updating participant status:", error);
      throw new Error("Failed to update participant status");
    }
  }

  static async updateParticipantHitPoints(
    encounterId: string,
    characterId: string,
    hitPoints: number,
  ): Promise<void> {
    try {
      const encounter = await this.getEncounter(encounterId);
      if (!encounter) {
        throw new Error("Encounter not found");
      }

      const updatedParticipants = encounter.participants.map((p) =>
        p.characterId === characterId ? { ...p, hitPoints } : p,
      );

      await db.encounters.update(parseInt(encounterId), {
        participants: updatedParticipants,
      });
    } catch (error) {
      console.error("Error updating participant hit points:", error);
      throw new Error("Failed to update participant hit points");
    }
  }

  static async startEncounter(encounterId: string): Promise<void> {
    try {
      await db.encounters.update(parseInt(encounterId), {
        isActive: true,
        round: 1,
      });
    } catch (error) {
      console.error("Error starting encounter:", error);
      throw new Error("Failed to start encounter");
    }
  }

  static async endEncounter(encounterId: string): Promise<void> {
    try {
      await db.encounters.update(parseInt(encounterId), {
        isActive: false,
      });
    } catch (error) {
      console.error("Error ending encounter:", error);
      throw new Error("Failed to end encounter");
    }
  }

  static async nextRound(encounterId: string): Promise<void> {
    try {
      const encounter = await this.getEncounter(encounterId);
      if (!encounter) {
        throw new Error("Encounter not found");
      }

      await db.encounters.update(parseInt(encounterId), {
        round: encounter.round + 1,
      });
    } catch (error) {
      console.error("Error advancing to next round:", error);
      throw new Error("Failed to advance to next round");
    }
  }
}
