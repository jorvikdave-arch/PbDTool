import { db } from "../db";
import type { Character } from "../types";

export class CharacterService {
  static async createCharacter(
    character: Omit<Character, "id">,
  ): Promise<Character> {
    try {
      const id = await db.characters.add(character);
      return { ...character, id: id.toString() };
    } catch (error) {
      console.error("Error creating character:", error);
      throw new Error("Failed to create character");
    }
  }

  static async getCharacter(id: string): Promise<Character | undefined> {
    try {
      return await db.characters.get(parseInt(id));
    } catch (error) {
      console.error("Error getting character:", error);
      throw new Error("Failed to get character");
    }
  }

  static async updateCharacter(
    id: string,
    character: Partial<Character>,
  ): Promise<void> {
    try {
      await db.characters.update(parseInt(id), character);
    } catch (error) {
      console.error("Error updating character:", error);
      throw new Error("Failed to update character");
    }
  }

  static async deleteCharacter(id: string): Promise<void> {
    try {
      await db.characters.delete(parseInt(id));
    } catch (error) {
      console.error("Error deleting character:", error);
      throw new Error("Failed to delete character");
    }
  }

  static async getAllCharacters(): Promise<Character[]> {
    try {
      return await db.characters.toArray();
    } catch (error) {
      console.error("Error getting all characters:", error);
      throw new Error("Failed to get characters");
    }
  }

  static async updateHitPoints(id: string, current: number): Promise<void> {
    try {
      await db.characters.update(parseInt(id), {
        hitPoints: { current },
      });
    } catch (error) {
      console.error("Error updating hit points:", error);
      throw new Error("Failed to update hit points");
    }
  }
}
