export interface Character {
  id: string;
  name: string;
  level: number;
  class: string;
  race: string;
  hitPoints: {
    current: number;
    maximum: number;
  };
  armorClass: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: Record<string, number>;
  proficiencies: string[];
  equipment: string[];
}

export interface GameInstance {
  id: string;
  name: string;
  date: Date;
  characters: string[]; // Character IDs
  encounters: string[]; // Encounter IDs
  notes: string;
  experiencePoints?: number;
}

export interface Encounter {
  id: string;
  name: string;
  gameInstanceId: string;
  participants: {
    characterId: string;
    initiative: number;
    status: string;
    hitPoints?: number;
    conditions?: string[];
  }[];
  notes: string;
  isActive: boolean;
  round: number;
}
