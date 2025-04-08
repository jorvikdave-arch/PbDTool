/**
 * Represents the different types of characters that can exist in a game instance
 * PC: Player Character
 * NPC: Non-Player Character
 * Hazard: Environmental or trap-like entity
 * Familiar: A creature bound to another character
 * Eidolon: A manifestation of another character
 * Companion: An allied creature or follower
 */
export type CharacterType =
  | "PC"
  | "NPC"
  | "Hazard"
  | "Familiar"
  | "Eidolon"
  | "Companion";

/**
 * Subset of CharacterType that represents characters that must be linked to another character
 */
export type RelatedCharacterType = "Familiar" | "Eidolon" | "Companion";

/**
 * Type guard to check if a character type requires a related character
 * @param type - The character type to check
 * @returns True if the type requires a related character
 */
export function isRelatedCharacterType(
  type: CharacterType,
): type is RelatedCharacterType {
  return ["Familiar", "Eidolon", "Companion"].includes(type);
}

/**
 * Represents a character in the game system
 */
export interface Character {
  /** Unique identifier for the character */
  id: string;
  /** ID of the game instance this character belongs to */
  instanceId: string;
  /** Character's name */
  name: string;
  /** Type of character */
  type: CharacterType;
  /** Discord user ID for the character's player (required for PCs) */
  discordId?: string;
  /** ID of the character this one is related to (required for Familiars/Eidolons/Companions) */
  relatedCharacterId?: string;
  /** Character notes */
  notes: string;
  /** Hit Point information */
  hp: {
    /** Current hit points */
    current: number;
    /** Maximum hit points */
    max: number;
    /** Temporary hit points */
    temp?: number;
  };
  /** Armor Class */
  ac: number;
  /** Timestamp of last update */
  lastUpdated: Date;
}

/**
 * Represents a game instance (e.g., a campaign or one-shot)
 */
export interface GameInstance {
  /** Unique identifier for the instance */
  id: string;
  /** Name of the game instance */
  name: string;
  /** Discord server name where the game is being played */
  serverName?: string;
  /** Discord channel name where the game is being played */
  channelName?: string;
  /** Game system being used (e.g., "D&D 5E", "Pathfinder 2E") */
  system?: string;
  /** When the instance was created */
  createdAt: Date;
  /** When the instance was last accessed */
  lastAccessed: Date;
  /** Description of the game instance */
  description?: string;
  /** Current status of the game instance */
  status: "active" | "paused" | "completed" | "archived";
  /** Tags for organizing/filtering instances */
  tags?: string[];
  /** Private notes for the GM */
  gmNotes?: string;
}

/**
 * Represents a participant in an encounter
 */
export interface EncounterParticipant {
  /** ID of the character participating */
  characterId: string;
  /** Initiative roll/score for this participant */
  initiative: number;
}

/**
 * Represents a combat encounter within a game instance
 */
export interface Encounter {
  /** Unique identifier for the encounter */
  id: string;
  /** ID of the game instance this encounter belongs to */
  instanceId: string;
  /** Name of the encounter */
  name: string;
  /** Current round number */
  currentRound: number;
  /** Current initiative score being acted upon */
  currentInitiative: number;
  /** List of participants in initiative order */
  participants: EncounterParticipant[];
  /** When the encounter was created */
  createdAt: Date;
  /** When the encounter was last updated */
  lastUpdated: Date;
}
