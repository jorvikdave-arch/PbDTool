import { db } from "../db";
import type { GameInstance } from "../types";

export class GameInstanceService {
  static async createGameInstance(
    gameInstance: Omit<GameInstance, "id">,
  ): Promise<GameInstance> {
    try {
      const id = await db.gameInstances.add(gameInstance);
      return { ...gameInstance, id: id.toString() };
    } catch (error) {
      console.error("Error creating game instance:", error);
      throw new Error("Failed to create game instance");
    }
  }

  static async getGameInstance(id: string): Promise<GameInstance | undefined> {
    try {
      return await db.gameInstances.get(parseInt(id));
    } catch (error) {
      console.error("Error getting game instance:", error);
      throw new Error("Failed to get game instance");
    }
  }

  static async updateGameInstance(
    id: string,
    gameInstance: Partial<GameInstance>,
  ): Promise<void> {
    try {
      await db.gameInstances.update(parseInt(id), gameInstance);
    } catch (error) {
      console.error("Error updating game instance:", error);
      throw new Error("Failed to update game instance");
    }
  }

  static async deleteGameInstance(id: string): Promise<void> {
    try {
      await db.gameInstances.delete(parseInt(id));
    } catch (error) {
      console.error("Error deleting game instance:", error);
      throw new Error("Failed to delete game instance");
    }
  }

  static async getAllGameInstances(): Promise<GameInstance[]> {
    try {
      return await db.gameInstances.toArray();
    } catch (error) {
      console.error("Error getting all game instances:", error);
      throw new Error("Failed to get game instances");
    }
  }

  static async addCharacterToGameInstance(
    gameInstanceId: string,
    characterId: string,
  ): Promise<void> {
    try {
      const gameInstance = await this.getGameInstance(gameInstanceId);
      if (!gameInstance) {
        throw new Error("Game instance not found");
      }

      if (!gameInstance.characters.includes(characterId)) {
        await db.gameInstances.update(parseInt(gameInstanceId), {
          characters: [...gameInstance.characters, characterId],
        });
      }
    } catch (error) {
      console.error("Error adding character to game instance:", error);
      throw new Error("Failed to add character to game instance");
    }
  }

  static async removeCharacterFromGameInstance(
    gameInstanceId: string,
    characterId: string,
  ): Promise<void> {
    try {
      const gameInstance = await this.getGameInstance(gameInstanceId);
      if (!gameInstance) {
        throw new Error("Game instance not found");
      }

      await db.gameInstances.update(parseInt(gameInstanceId), {
        characters: gameInstance.characters.filter((id) => id !== characterId),
      });
    } catch (error) {
      console.error("Error removing character from game instance:", error);
      throw new Error("Failed to remove character from game instance");
    }
  }

  static async addEncounterToGameInstance(
    gameInstanceId: string,
    encounterId: string,
  ): Promise<void> {
    try {
      const gameInstance = await this.getGameInstance(gameInstanceId);
      if (!gameInstance) {
        throw new Error("Game instance not found");
      }

      if (!gameInstance.encounters.includes(encounterId)) {
        await db.gameInstances.update(parseInt(gameInstanceId), {
          encounters: [...gameInstance.encounters, encounterId],
        });
      }
    } catch (error) {
      console.error("Error adding encounter to game instance:", error);
      throw new Error("Failed to add encounter to game instance");
    }
  }

  static async updateExperiencePoints(
    gameInstanceId: string,
    experiencePoints: number,
  ): Promise<void> {
    try {
      await db.gameInstances.update(parseInt(gameInstanceId), {
        experiencePoints,
      });
    } catch (error) {
      console.error("Error updating experience points:", error);
      throw new Error("Failed to update experience points");
    }
  }
}
