import { writable, derived } from "svelte/store";
import { db } from "./db";
import type { Character, GameInstance, Encounter } from "./types";
import { isRelatedCharacterType } from "./types";

/**
 * Represents the global state of the game application
 */
interface GameState {
  /** Map of all characters indexed by their IDs */
  characters: Map<string, Character>;
  /** Map of all game instances indexed by their IDs */
  instances: Map<string, GameInstance>;
  /** Map of all encounters indexed by their IDs */
  encounters: Map<string, Encounter>;
  /** Indicates if any async operation is in progress */
  loading: boolean;
  /** Stores any error message that needs to be displayed */
  error: string | null;
}

/**
 * Initial state for the game store
 */
const initialState: GameState = {
  characters: new Map(),
  instances: new Map(),
  encounters: new Map(),
  loading: false,
  error: null,
};

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates a character's data before saving
 * @param character - The character data to validate
 * @throws ValidationError if the character data is invalid
 */
function validateCharacter(
  character: Omit<Character, "id" | "sessionId" | "lastUpdated">,
) {
  // Check relatedCharacterId based on type
  if (isRelatedCharacterType(character.type)) {
    if (!character.relatedCharacterId) {
      throw new ValidationError(
        `${character.type} must have a related character ID`,
      );
    }
  } else if (character.relatedCharacterId) {
    throw new ValidationError(
      `${character.type} cannot have a related character ID`,
    );
  }

  // Discord ID validation - should be present for PCs
  if (character.type === "PC" && !character.discordId) {
    throw new ValidationError("PC must have a Discord ID");
  }

  // Add any other validation rules here
  if (character.hp.current > character.hp.max) {
    throw new ValidationError("Current HP cannot exceed max HP");
  }

  if (character.hp.temp && character.hp.temp < 0) {
    throw new ValidationError("Temporary HP cannot be negative");
  }
}

// Create the main store
function createGameStore() {
  const { subscribe, update } = writable<GameState>(initialState);

  return {
    subscribe,
    // Initialize the store with data from IndexedDB
    async init() {
      update((state) => ({ ...state, loading: true }));
      try {
        await db.init();
        // Load all initial data
        const [characters, instances] = await Promise.all([
          db.getAllCharacters(),
          db.getAllInstances(),
        ]);

        update((state) => ({
          ...state,
          loading: false,
          characters: new Map(characters.map((c) => [c.id, c])),
          instances: new Map(instances.map((s) => [s.id, s])),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    },

    // Character methods
    async addCharacter(
      instanceId: string,
      character: Omit<Character, "id" | "instanceId" | "lastUpdated">,
    ) {
      update((state) => ({ ...state, loading: true }));
      try {
        // Validate character data
        validateCharacter(character);

        // Verify instance exists
        const instance = await db.getInstance(instanceId);
        if (!instance) throw new Error("Instance not found");

        // Verify relatedCharacterId if provided
        if (character.relatedCharacterId) {
          const relatedChar = await db.getCharacter(
            character.relatedCharacterId,
          );
          if (!relatedChar) throw new Error("Related character not found");
          if (relatedChar.instanceId !== instanceId) {
            throw new Error("Related character must be in the same instance");
          }
        }

        const newCharacter: Character = {
          ...character,
          id: crypto.randomUUID(),
          instanceId,
          lastUpdated: new Date(),
        };
        await db.addCharacter(newCharacter);
        update((state) => ({
          ...state,
          loading: false,
          characters: new Map(state.characters).set(
            newCharacter.id,
            newCharacter,
          ),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    async updateCharacter(id: string, updates: Partial<Character>) {
      update((state) => ({ ...state, loading: true }));
      try {
        const character = await db.getCharacter(id);
        if (!character) throw new Error("Character not found");

        const updatedCharacter = {
          ...character,
          ...updates,
          lastUpdated: new Date(),
        };

        // Validate the updated character
        validateCharacter(updatedCharacter);

        // If type is changing, verify relatedCharacterId constraints
        if (updates.type && updates.type !== character.type) {
          if (
            isRelatedCharacterType(updates.type) &&
            !updatedCharacter.relatedCharacterId
          ) {
            throw new ValidationError(
              `${updates.type} must have a related character ID`,
            );
          }
          if (
            !isRelatedCharacterType(updates.type) &&
            updatedCharacter.relatedCharacterId
          ) {
            throw new ValidationError(
              `${updates.type} cannot have a related character ID`,
            );
          }
        }

        await db.addCharacter(updatedCharacter);
        update((state) => ({
          ...state,
          loading: false,
          characters: new Map(state.characters).set(id, updatedCharacter),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    async deleteCharacter(id: string) {
      update((state) => ({ ...state, loading: true }));
      try {
        await db.deleteCharacter(id);
        update((state) => {
          const characters = new Map(state.characters);
          characters.delete(id);
          return { ...state, loading: false, characters };
        });
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    },

    // HP Management Methods
    /**
     * Sets a character's maximum HP and adjusts current HP if needed
     * @param id - Character ID
     * @param maxHP - New maximum HP value
     * @throws {Error} If character not found
     * @returns Promise resolving when the update is complete
     */
    async setMaxHP(id: string, maxHP: number) {
      const character = await db.getCharacter(id);
      if (!character) throw new Error("Character not found");

      return this.updateCharacter(id, {
        hp: {
          ...character.hp,
          max: maxHP,
          // Ensure current HP doesn't exceed new max
          current: Math.min(character.hp.current, maxHP),
        },
      });
    },

    /**
     * Sets a character's current HP, clamping between 0 and max HP
     * @param id - Character ID
     * @param currentHP - New current HP value
     * @throws {Error} If character not found
     * @returns Promise resolving when the update is complete
     */
    async setCurrentHP(id: string, currentHP: number) {
      const character = await db.getCharacter(id);
      if (!character) throw new Error("Character not found");

      return this.updateCharacter(id, {
        hp: {
          ...character.hp,
          current: Math.min(Math.max(currentHP, 0), character.hp.max), // Clamp between 0 and max
        },
      });
    },

    /**
     * Sets a character's temporary HP (cannot be negative)
     * @param id - Character ID
     * @param tempHP - New temporary HP value
     * @throws {Error} If character not found
     * @returns Promise resolving when the update is complete
     */
    async setTempHP(id: string, tempHP: number) {
      const character = await db.getCharacter(id);
      if (!character) throw new Error("Character not found");

      return this.updateCharacter(id, {
        hp: {
          ...character.hp,
          temp: Math.max(tempHP, 0), // Cannot be negative
        },
      });
    },

    /**
     * Applies damage to a character, considering temporary HP first
     * @param id - Character ID
     * @param amount - Amount of damage to apply
     * @throws {Error} If character not found
     * @returns Promise resolving when the update is complete
     */
    async damage(id: string, amount: number) {
      const character = await db.getCharacter(id);
      if (!character) throw new Error("Character not found");

      const { current, temp = 0 } = character.hp;
      let remainingDamage = amount;
      let newTemp = temp;
      let newCurrent = current;

      // Apply damage to temp HP first
      if (temp > 0) {
        if (temp >= remainingDamage) {
          newTemp = temp - remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= temp;
          newTemp = 0;
        }
      }

      // Apply remaining damage to current HP
      if (remainingDamage > 0) {
        newCurrent = Math.max(current - remainingDamage, 0);
      }

      return this.updateCharacter(id, {
        hp: {
          ...character.hp,
          current: newCurrent,
          temp: newTemp,
        },
      });
    },

    /**
     * Heals a character up to their maximum HP
     * @param id - Character ID
     * @param amount - Amount of healing to apply
     * @throws {Error} If character not found
     * @returns Promise resolving when the update is complete
     */
    async heal(id: string, amount: number) {
      const character = await db.getCharacter(id);
      if (!character) throw new Error("Character not found");

      return this.updateCharacter(id, {
        hp: {
          ...character.hp,
          current: Math.min(character.hp.current + amount, character.hp.max),
        },
      });
    },

    // AC Management Methods
    /**
     * Sets a character's Armor Class to a specific value
     * @param id - Character ID
     * @param ac - New Armor Class value
     * @returns Promise resolving when the update is complete
     */
    async setAC(id: string, ac: number) {
      return this.updateCharacter(id, { ac });
    },

    /**
     * Modifies a character's Armor Class by adding or subtracting a value
     * @param id - Character ID
     * @param modifier - Amount to modify AC by (positive or negative)
     * @throws {Error} If character not found
     * @returns Promise resolving when the update is complete
     */
    async modifyAC(id: string, modifier: number) {
      const character = await db.getCharacter(id);
      if (!character) throw new Error("Character not found");

      return this.updateCharacter(id, {
        ac: character.ac + modifier,
      });
    },

    // Session methods
    /**
     * Creates a new game instance
     * @param instanceData - Initial instance data (without id, timestamps, and status)
     * @returns Promise resolving when the instance is created
     */
    async createInstance(
      instanceData: Omit<
        GameInstance,
        "id" | "createdAt" | "lastAccessed" | "status"
      >,
    ) {
      update((state) => ({ ...state, loading: true }));
      try {
        const newInstance: GameInstance = {
          ...instanceData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          lastAccessed: new Date(),
          status: "active",
        };

        await db.addInstance(newInstance);
        update((state) => ({
          ...state,
          loading: false,
          instances: new Map(state.instances).set(newInstance.id, newInstance),
        }));
        return newInstance.id;
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    /**
     * Updates an existing game instance
     * @param instanceId - ID of the instance to update
     * @param updates - Partial instance data to update
     * @throws {Error} If instance not found
     */
    async updateInstance(instanceId: string, updates: Partial<GameInstance>) {
      update((state) => ({ ...state, loading: true }));
      try {
        const instance = await db.getInstance(instanceId);
        if (!instance) throw new Error("Instance not found");

        const updatedInstance = {
          ...instance,
          ...updates,
          lastAccessed: new Date(),
        };

        await db.addInstance(updatedInstance);
        update((state) => ({
          ...state,
          loading: false,
          instances: new Map(state.instances).set(instanceId, updatedInstance),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    /**
     * Updates the status of a game instance
     * @param instanceId - ID of the instance to update
     * @param status - New status value
     * @throws {Error} If instance not found
     */
    async updateInstanceStatus(
      instanceId: string,
      status: GameInstance["status"],
    ) {
      return this.updateInstance(instanceId, { status });
    },

    /**
     * Updates the tags of a game instance
     * @param instanceId - ID of the instance to update
     * @param tags - Array of tags to set
     * @throws {Error} If instance not found
     */
    async updateInstanceTags(instanceId: string, tags: string[]) {
      const normalizedTags = [...new Set(tags)].sort(); // Deduplicate and sort tags
      return this.updateInstance(instanceId, { tags: normalizedTags });
    },

    /**
     * Deletes a game instance and all associated data
     * @param instanceId - ID of the instance to delete
     */
    async deleteInstance(instanceId: string) {
      update((state) => ({ ...state, loading: true }));
      try {
        await db.deleteInstance(instanceId);
        update((state) => {
          const instances = new Map(state.instances);
          instances.delete(instanceId);
          return { ...state, loading: false, instances };
        });
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    // Tag management methods
    async addInstanceTag(instanceId: string, tag: string) {
      update((state) => ({ ...state, loading: true }));
      try {
        const instance = await db.getInstance(instanceId);
        if (!instance) throw new Error("Session not found");

        const tags = new Set(instance.tags || []);
        tags.add(tag.trim().toLowerCase()); // Normalize tags

        const updatedInstance = {
          ...instance,
          tags: Array.from(tags),
          lastAccessed: new Date(),
        };

        await db.addInstance(updatedInstance);
        update((state) => ({
          ...state,
          loading: false,
          instances: new Map(state.instances).set(instanceId, updatedInstance),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    async removeInstanceTag(instanceId: string, tag: string) {
      update((state) => ({ ...state, loading: true }));
      try {
        const instance = await db.getInstance(instanceId);
        if (!instance) throw new Error("Session not found");

        const tags = new Set(instance.tags || []);
        tags.delete(tag.trim().toLowerCase());

        const updatedInstance = {
          ...instance,
          tags: Array.from(tags),
          lastAccessed: new Date(),
        };

        await db.addInstance(updatedInstance);
        update((state) => ({
          ...state,
          loading: false,
          instances: new Map(state.instances).set(instanceId, updatedInstance),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    // Add method to get related characters
    async getRelatedCharacters(characterId: string) {
      const characters = await db.getAllCharacters();
      return characters.filter(
        (char) => char.relatedCharacterId === characterId,
      );
    },

    // Encounter methods
    async createEncounter(sessionId: string, name: string) {
      update((state) => ({ ...state, loading: true }));
      try {
        const session = await db.getInstance(sessionId);
        if (!session) throw new Error("Session not found");

        const newEncounter: Encounter = {
          id: crypto.randomUUID(),
          sessionId,
          name,
          currentRound: 0,
          currentInitiative: 0,
          participants: [],
          createdAt: new Date(),
          lastUpdated: new Date(),
        };

        await db.addEncounter(newEncounter);
        update((state) => ({
          ...state,
          loading: false,
          encounters: new Map(state.encounters).set(
            newEncounter.id,
            newEncounter,
          ),
        }));
        return newEncounter.id;
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    async addParticipant(
      encounterId: string,
      characterId: string,
      initiative: number,
    ) {
      update((state) => ({ ...state, loading: true }));
      try {
        const encounter = await db.getEncounter(encounterId);
        if (!encounter) throw new Error("Encounter not found");

        const character = await db.getCharacter(characterId);
        if (!character) throw new Error("Character not found");
        if (character.sessionId !== encounter.sessionId) {
          throw new Error("Character must be from the same session");
        }

        const updatedEncounter = {
          ...encounter,
          participants: [
            ...encounter.participants,
            { characterId, initiative },
          ].sort((a, b) => b.initiative - a.initiative), // Sort by initiative descending
          lastUpdated: new Date(),
        };

        await db.addEncounter(updatedEncounter);
        update((state) => ({
          ...state,
          loading: false,
          encounters: new Map(state.encounters).set(
            encounterId,
            updatedEncounter,
          ),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    async nextTurn(encounterId: string) {
      const encounter = await db.getEncounter(encounterId);
      if (!encounter) throw new Error("Encounter not found");
      if (encounter.participants.length === 0)
        throw new Error("No participants in encounter");

      // Find next initiative in order
      const initiatives = [
        ...new Set(encounter.participants.map((p) => p.initiative)),
      ].sort((a, b) => b - a);
      let nextInitiative = encounter.currentInitiative;
      const currentIndex = initiatives.indexOf(encounter.currentInitiative);

      if (currentIndex === initiatives.length - 1 || currentIndex === -1) {
        // End of round, start new round
        nextInitiative = initiatives[0];
        await this.updateEncounter(encounterId, {
          currentRound: encounter.currentRound + 1,
          currentInitiative: nextInitiative,
        });
      } else {
        // Move to next initiative in current round
        await this.updateEncounter(encounterId, {
          currentInitiative: initiatives[currentIndex + 1],
        });
      }
    },

    // Additional Encounter methods
    /**
     * Removes a participant from an encounter
     * @param encounterId - ID of the encounter
     * @param characterId - ID of the character to remove
     * @throws {Error} If encounter not found
     * @description Also handles updating current initiative if needed
     */
    async removeParticipant(encounterId: string, characterId: string) {
      update((state) => ({ ...state, loading: true }));
      try {
        const encounter = await db.getEncounter(encounterId);
        if (!encounter) throw new Error("Encounter not found");

        // Remove participant
        const updatedEncounter = {
          ...encounter,
          participants: encounter.participants
            .filter((p) => p.characterId !== characterId)
            .sort((a, b) => b.initiative - a.initiative),
          lastUpdated: new Date(),
        };

        // If we removed the last participant at current initiative,
        // we should move to the next available initiative
        if (
          !updatedEncounter.participants.some(
            (p) => p.initiative === encounter.currentInitiative,
          )
        ) {
          const initiatives = [
            ...new Set(updatedEncounter.participants.map((p) => p.initiative)),
          ].sort((a, b) => b - a);
          if (initiatives.length > 0) {
            updatedEncounter.currentInitiative = initiatives[0];
          } else {
            updatedEncounter.currentInitiative = 0;
          }
        }

        await db.addEncounter(updatedEncounter);
        update((state) => ({
          ...state,
          loading: false,
          encounters: new Map(state.encounters).set(
            encounterId,
            updatedEncounter,
          ),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    /**
     * Updates a participant's initiative value
     * @param encounterId - ID of the encounter
     * @param characterId - ID of the character whose initiative is changing
     * @param newInitiative - New initiative value
     * @throws {Error} If encounter not found or participant not found
     * @description Maintains initiative order and updates current initiative if needed
     */
    async updateParticipantInitiative(
      encounterId: string,
      characterId: string,
      newInitiative: number,
    ) {
      update((state) => ({ ...state, loading: true }));
      try {
        const encounter = await db.getEncounter(encounterId);
        if (!encounter) throw new Error("Encounter not found");

        // Find and update the participant
        const participantIndex = encounter.participants.findIndex(
          (p) => p.characterId === characterId,
        );
        if (participantIndex === -1)
          throw new Error("Participant not found in encounter");

        const updatedEncounter = {
          ...encounter,
          participants: [
            ...encounter.participants.slice(0, participantIndex),
            { characterId, initiative: newInitiative },
            ...encounter.participants.slice(participantIndex + 1),
          ].sort((a, b) => b.initiative - a.initiative),
          lastUpdated: new Date(),
        };

        // Handle current initiative updates if needed
        if (
          encounter.participants[participantIndex].initiative ===
            encounter.currentInitiative &&
          !updatedEncounter.participants.some(
            (p) => p.initiative === encounter.currentInitiative,
          )
        ) {
          const initiatives = [
            ...new Set(updatedEncounter.participants.map((p) => p.initiative)),
          ].sort((a, b) => b - a);
          const currentIndex = initiatives.indexOf(encounter.currentInitiative);
          if (currentIndex === initiatives.length - 1 || currentIndex === -1) {
            updatedEncounter.currentInitiative = initiatives[0];
          } else {
            updatedEncounter.currentInitiative = initiatives[currentIndex + 1];
          }
        }

        await db.addEncounter(updatedEncounter);
        update((state) => ({
          ...state,
          loading: false,
          encounters: new Map(state.encounters).set(
            encounterId,
            updatedEncounter,
          ),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },

    /**
     * Updates multiple participants' initiatives at once
     * @param encounterId - ID of the encounter
     * @param updates - Array of updates containing characterId and new initiative values
     * @throws {Error} If encounter not found
     * @description More efficient than updating initiatives one at a time
     */
    async bulkUpdateInitiatives(
      encounterId: string,
      updates: { characterId: string; initiative: number }[],
    ) {
      update((state) => ({ ...state, loading: true }));
      try {
        const encounter = await db.getEncounter(encounterId);
        if (!encounter) throw new Error("Encounter not found");

        // Create a map of updates for quick lookup
        const updateMap = new Map(
          updates.map((u) => [u.characterId, u.initiative]),
        );

        // Update all participants
        const updatedEncounter = {
          ...encounter,
          participants: encounter.participants
            .map((p) => ({
              characterId: p.characterId,
              initiative: updateMap.has(p.characterId)
                ? updateMap.get(p.characterId)!
                : p.initiative,
            }))
            .sort((a, b) => b.initiative - a.initiative),
          lastUpdated: new Date(),
        };

        await db.addEncounter(updatedEncounter);
        update((state) => ({
          ...state,
          loading: false,
          encounters: new Map(state.encounters).set(
            encounterId,
            updatedEncounter,
          ),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        throw error;
      }
    },
  };
}

// Create and export the store
export const gameStore = createGameStore();

/**
 * Derived Stores
 * These provide convenient access to specific parts of the game state
 */

/**
 * List of all characters in the game
 */
export const characters = derived(gameStore, ($gameStore) =>
  Array.from($gameStore.characters.values()),
);

/**
 * List of all game instances
 */
export const instances = derived(gameStore, ($gameStore) =>
  Array.from($gameStore.instances.values()),
);

/**
 * List of all encounters
 */
export const encounters = derived(gameStore, ($gameStore) =>
  Array.from($gameStore.encounters.values()),
);

/**
 * Current loading state
 */
export const loading = derived(gameStore, ($gameStore) => $gameStore.loading);

/**
 * Current error state
 */
export const error = derived(gameStore, ($gameStore) => $gameStore.error);

/**
 * Factory function that creates a derived store for characters in a specific instance
 * @param instanceId - ID of the instance to filter characters by
 * @returns Derived store containing only characters from the specified instance
 */
export const getInstanceCharacters = (instanceId: string) =>
  derived(characters, ($characters) =>
    $characters.filter((char) => char.instanceId === instanceId),
  );

/**
 * List of active game instances
 */
export const activeInstances = derived(instances, ($instances) =>
  $instances.filter((i) => i.status === "active"),
);

/**
 * Map of game instances grouped by their status
 */
export const instancesByStatus = derived(instances, ($instances) => {
  const grouped = new Map<GameInstance["status"], GameInstance[]>();
  for (const instance of $instances) {
    const list = grouped.get(instance.status) || [];
    list.push(instance);
    grouped.set(instance.status, list);
  }
  return grouped;
});

/**
 * List of all unique tags used across all instances
 */
export const allTags = derived(instances, ($instances) => {
  const tags = new Set<string>();
  for (const instance of $instances) {
    if (instance.tags) {
      instance.tags.forEach((tag) => tags.add(tag));
    }
  }
  return Array.from(tags).sort();
});

/**
 * Map of game instances grouped by their tags
 * Note: An instance can appear in multiple groups if it has multiple tags
 */
export const instancesByTag = derived(instances, ($instances) => {
  const grouped = new Map<string, GameInstance[]>();
  for (const instance of $instances) {
    if (instance.tags) {
      for (const tag of instance.tags) {
        const list = grouped.get(tag) || [];
        list.push(instance);
        grouped.set(tag, list);
      }
    }
  }
  return grouped;
});

/**
 * Factory function that creates a derived store for encounters in a specific instance
 * @param instanceId - ID of the instance to filter encounters by
 * @returns Derived store containing only encounters from the specified instance
 */
export const getInstanceEncounters = (instanceId: string) =>
  derived(encounters, ($encounters) =>
    $encounters.filter((e) => e.sessionId === instanceId),
  );

/**
 * Factory function that creates a derived store for current participants in an encounter
 * @param encounterId - ID of the encounter to get current participants for
 * @returns Derived store containing participants acting at the current initiative,
 *          with their full character data included
 */
export const getCurrentParticipants = (encounterId: string) =>
  derived([encounters, characters], ([$encounters, $characters]) => {
    const encounter = $encounters.find((e) => e.id === encounterId);
    if (!encounter) return [];

    return encounter.participants
      .filter((p) => p.initiative === encounter.currentInitiative)
      .map((p) => ({
        ...p,
        character: $characters.find((c) => c.id === p.characterId),
      }));
  });

/**
 * Examples of using the derived stores:
 *
 * Basic Stores
 * ------------
 *
 * Subscribe to all characters:
 * ```ts
 * characters.subscribe(allCharacters => {
 *   console.log('Characters:', allCharacters);
 * });
 * ```
 *
 * Get loading state:
 * ```ts
 * loading.subscribe(isLoading => {
 *   if (isLoading) showSpinner();
 *   else hideSpinner();
 * });
 * ```
 *
 * Display errors:
 * ```ts
 * error.subscribe(errorMessage => {
 *   if (errorMessage) showToast(errorMessage);
 * });
 * ```
 *
 * Instance-Specific Stores
 * -----------------------
 *
 * Get characters for a specific instance:
 * ```ts
 * const instanceChars = getInstanceCharacters('instance-123');
 * instanceChars.subscribe(chars => {
 *   console.log('Instance characters:', chars);
 * });
 * ```
 *
 * Get encounters for an instance:
 * ```ts
 * const instanceEncounters = getInstanceEncounters('instance-123');
 * instanceEncounters.subscribe(encounters => {
 *   updateEncounterList(encounters);
 * });
 * ```
 *
 * Filtered Views
 * -------------
 *
 * Show only active instances:
 * ```ts
 * activeInstances.subscribe(active => {
 *   renderActiveGames(active);
 * });
 * ```
 *
 * Group instances by status:
 * ```ts
 * instancesByStatus.subscribe(grouped => {
 *   const activeGames = grouped.get('active') || [];
 *   const archivedGames = grouped.get('archived') || [];
 * });
 * ```
 *
 * Tag Management
 * -------------
 *
 * Show all available tags:
 * ```ts
 * allTags.subscribe(tags => {
 *   renderTagCloud(tags);
 * });
 * ```
 *
 * Find instances by tag:
 * ```ts
 * instancesByTag.subscribe(grouped => {
 *   const fantasyGames = grouped.get('fantasy') || [];
 *   const scifiGames = grouped.get('sci-fi') || [];
 * });
 * ```
 *
 * Combat Management
 * ----------------
 *
 * Get current participants in combat:
 * ```ts
 * const currentFighters = getCurrentParticipants('encounter-123');
 * currentFighters.subscribe(participants => {
 *   participants.forEach(({ character, initiative }) => {
 *     console.log(`${character.name} acting at initiative ${initiative}`);
 *   });
 * });
 * ```
 *
 * Using Multiple Stores
 * -------------------
 *
 * Combine stores for complex views:
 * ```ts
 * import { derived } from 'svelte/store';
 *
 * const instanceSummary = derived(
 *   [instances, characters, encounters],
 *   ([$instances, $characters, $encounters]) => {
 *     return $instances.map(instance => ({
 *       ...instance,
 *       characterCount: $characters.filter(c => c.instanceId === instance.id).length,
 *       encounterCount: $encounters.filter(e => e.instanceId === instance.id).length
 *     }));
 *   }
 * );
 * ```
 */

/**
 * Store Initialization and Cleanup
 * ------------------------------
 *
 * Initialize the store in your app's entry point:
 * ```ts
 * // src/routes/+layout.ts
 * import { gameStore } from '$lib/stores/gameStore';
 *
 * export const load = async () => {
 *   await gameStore.init();
 *   return {};
 * };
 * ```
 *
 * Using in components with auto-subscription:
 * ```svelte
 * <script lang="ts">
 *   import { characters, loading, error } from '$lib/stores/gameStore';
 *
 *   // Svelte will automatically handle subscription and cleanup
 *   $: characterCount = $characters.length;
 *   $: if ($error) console.error($error);
 * </script>
 * ```
 *
 * Manual subscription with cleanup:
 * ```ts
 * import { onMount, onDestroy } from 'svelte';
 * import { characters } from '$lib/stores/gameStore';
 *
 * let unsubscribe: () => void;
 *
 * onMount(() => {
 *   unsubscribe = characters.subscribe(chars => {
 *     // Handle character updates
 *   });
 * });
 *
 * onDestroy(() => {
 *   if (unsubscribe) unsubscribe();
 * });
 * ```
 *
 * Using with async operations:
 * ```svelte
 * <script lang="ts">
 *   import { gameStore, loading } from '$lib/stores/gameStore';
 *
 *   async function handleAddCharacter() {
 *     try {
 *       await gameStore.addCharacter('instance-123', {
 *         name: 'New Character',
 *         // ... other character data
 *       });
 *     } catch (error) {
 *       // Handle error
 *     }
 *   }
 * </script>
 *
 * {#if $loading}
 *   <LoadingSpinner />
 * {:else}
 *   <button on:click={handleAddCharacter}>Add Character</button>
 * {/if}
 * ```
 *
 * Combining multiple stores:
 * ```svelte
 * <script lang="ts">
 *   import { derived } from 'svelte/store';
 *   import { characters, encounters } from '$lib/stores/gameStore';
 *
 *   // Create a derived store that updates when either source changes
 *   const characterStatus = derived(
 *     [characters, encounters],
 *     ([$characters, $encounters]) =>
 *       $characters.map(char => ({
 *         ...char,
 *         inCombat: $encounters.some(e =>
 *           e.participants.some(p => p.characterId === char.id)
 *         )
 *       }))
 *   );
 * </script>
 *
 * {#each $characterStatus as char}
 *   <div class:in-combat={char.inCombat}>
 *     {char.name}
 *   </div>
 * {/each}
 */

/**
 * Error Handling Patterns
 * ---------------------
 *
 * Basic error handling in components:
 * ```svelte
 * <script lang="ts">
 *   import { error } from '$lib/stores/gameStore';
 *   import { onDestroy } from 'svelte';
 *
 *   let errorTimeout: NodeJS.Timeout;
 *
 *   // Auto-clear errors after 5 seconds
 *   $: if ($error) {
 *     if (errorTimeout) clearTimeout(errorTimeout);
 *     errorTimeout = setTimeout(() => {
 *       $error = null;
 *     }, 5000);
 *   }
 *
 *   onDestroy(() => {
 *     if (errorTimeout) clearTimeout(errorTimeout);
 *   });
 * </script>
 *
 * {#if $error}
 *   <div class="error-toast">{$error}</div>
 * {/if}
 * ```
 *
 * Handling specific error types:
 * ```ts
 * try {
 *   await gameStore.addCharacter(instanceId, characterData);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     // Handle validation errors differently
 *     showValidationError(error.message);
 *   } else {
 *     // Handle other errors
 *     showGeneralError('Failed to add character');
 *   }
 * }
 * ```
 *
 * Using with form validation:
 * ```svelte
 * <script lang="ts">
 *   import { gameStore } from '$lib/stores/gameStore';
 *
 *   let formErrors: Record<string, string> = {};
 *
 *   async function handleSubmit(event: SubmitEvent) {
 *     formErrors = {};
 *     try {
 *       await gameStore.addCharacter(instanceId, {
 *         name: event.target.name.value,
 *         type: event.target.type.value,
 *         hp: {
 *           current: parseInt(event.target.currentHp.value),
 *           max: parseInt(event.target.maxHp.value)
 *         },
 *         ac: parseInt(event.target.ac.value)
 *       });
 *     } catch (error) {
 *       if (error instanceof ValidationError) {
 *         // Map validation errors to form fields
 *         if (error.message.includes('HP')) {
 *           formErrors.hp = error.message;
 *         } else if (error.message.includes('Discord')) {
 *           formErrors.discordId = error.message;
 *         } else {
 *           formErrors.general = error.message;
 *         }
 *       }
 *     }
 *   }
 * </script>
 *
 * <form on:submit|preventDefault={handleSubmit}>
 *   <div class="field">
 *     <input name="name" required />
 *     {#if formErrors.name}
 *       <span class="error">{formErrors.name}</span>
 *     {/if}
 *   </div>
 *   <!-- Other form fields -->
 *   {#if formErrors.general}
 *     <div class="error">{formErrors.general}</div>
 *   {/if}
 * </form>
 * ```
 *
 * Global error handling:
 * ```ts
 * // src/routes/+layout.ts
 * import { error } from '$lib/stores/gameStore';
 *
 * // Set up global error handler
 * window.onerror = (message) => {
 *   error.set(String(message));
 * };
 *
 * // Handle unhandled promise rejections
 * window.onunhandledrejection = (event) => {
 *   error.set(event.reason?.message || 'An unexpected error occurred');
 * };
 * ```
 */
