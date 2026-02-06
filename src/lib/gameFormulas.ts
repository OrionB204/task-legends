// Game formulas for TaskQuest RPG (Habitica Logic + Custom Perception)

export type PlayerClass = 'apprentice' | 'warrior' | 'mage' | 'rogue' | 'cleric' | 'paladin';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

// ----------------------------------------------------------------------
// ATTRIBUTE DEFINITIONS & BASE STATS
// ----------------------------------------------------------------------
// 1. Strength (Força): Boss Damage, Crit Chance (Increases opportunity for bonus XP/Gold)
// 2. Intelligence (Inteligência): XP Gain, Max Mana
// 3. Constitution (Constituição): Damage Reduction (Reduces damage from missed dailies/bad habits)
// 4. Perception (Percepção): Gold Gain (Strictly +1 Gold per point as requested)

export interface PlayerAttributes {
  strength: number;
  intelligence: number;
  constitution: number;
  perception: number;
}

// Base stats for classes (Habitica-inspired distributions approx)
export const CLASS_BASE_STATS: Record<PlayerClass, PlayerAttributes> = {
  apprentice: { strength: 0, intelligence: 0, constitution: 0, perception: 0 },
  warrior: { strength: 3, intelligence: 0, constitution: 2, perception: 0 },
  mage: { strength: 0, intelligence: 4, constitution: 0, perception: 1 },
  rogue: { strength: 1, intelligence: 0, constitution: 0, perception: 4 },
  cleric: { strength: 0, intelligence: 1, constitution: 3, perception: 1 },
  paladin: { strength: 2, intelligence: 0, constitution: 3, perception: 0 },
};

// ----------------------------------------------------------------------
// CONSTANTS & MULTIPLIERS
// ----------------------------------------------------------------------

// XP required to reach a level
export function xpForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.floor((level * level + 24 * level + 475) / 2);
}

export function xpToNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1);
}

export function totalXpAtLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i + 1);
  return total;
}

// Check if player can level up
export function canLevelUp(currentLevel: number, currentXp: number): boolean {
  const xpNeeded = xpToNextLevel(currentLevel);
  return currentXp >= xpNeeded;
}

// Process level up and return new level and remaining XP
export function processLevelUp(currentLevel: number, currentXp: number): { newLevel: number; remainingXp: number } {
  let level = currentLevel;
  let xp = currentXp;

  while (canLevelUp(level, xp)) {
    const xpNeeded = xpToNextLevel(level);
    xp -= xpNeeded;
    level++;
  }

  return { newLevel: level, remainingXp: xp };
}


export const DIFFICULTY_MULTIPLIERS: Record<TaskDifficulty, number> = {
  easy: 1, medium: 1.5, hard: 2,
};

// Base Rewards
export const XP_REWARDS: Record<TaskDifficulty, number> = {
  easy: 10, medium: 20, hard: 40,
};

export const GOLD_REWARDS: Record<TaskDifficulty, number> = {
  easy: 1, medium: 2.5, hard: 5,
};

export const HABIT_XP_REWARD = 5;
export const HABIT_HP_DAMAGE = 10; // Base damage
export const HABIT_HP_HEAL = 5;

// ----------------------------------------------------------------------
// CALCULATIONS
// ----------------------------------------------------------------------

// 1. Max HP: Habitica Standard is 50 Fixed.
export function calculateMaxHp(level: number, constitution: number): number {
  return 50;
}

// 2. Max Mana: Base (50) + Intelligence
export function calculateMaxMana(level: number, intelligence: number, baseMana: number = 50): number {
  return baseMana + intelligence;
}

// 3. Damage Taken: Reduced by Constitution
// A simple % reduction per point. e.g. 0.5% per point? Or Habitica's complex formula?
// Habitica: mod = 1 - (Con / 250)? No, let's go with 1% per point (capped) for simplicity and impact.
export function calculateDamage(
  level: number,
  difficulty: TaskDifficulty,
  constitution: number = 0
): number {
  const baseDmg = DIFFICULTY_MULTIPLIERS[difficulty] * HABIT_HP_DAMAGE;

  // Cap reduction at 75%
  const reductionPct = Math.min(constitution * 0.01, 0.75);

  return Math.max(1, Math.ceil(baseDmg * (1 - reductionPct)));
}

// 4. Crit Chance: Based on Strength (Habitica Logic)
// Returns probability 0.0 to 1.0
export function calculateCritChance(strength: number): number {
  // 0.4% per point of Strength
  return Math.min(strength * 0.004, 0.75);
}

// 5. XP Gain: Base + Intel% + Crit(Str)
export function calculateXpGain(difficulty: TaskDifficulty, intelligence: number = 0, strength: number = 0): { xp: number, isCrit: boolean } {
  let xp = XP_REWARDS[difficulty];

  // Intel Bonus: +2% per point (Habitica is usually diminishing returns but linear is fine for now)
  const intelMultiplier = 1 + (intelligence * 0.02);
  xp = xp * intelMultiplier;

  // Crit Check
  const critChance = calculateCritChance(strength);
  const isCrit = Math.random() < critChance;

  if (isCrit) {
    xp = xp * 1.5; // 1.5x Multiplier on Crit
  }

  return { xp: Math.ceil(xp), isCrit };
}

// 6. Gold Gain: Base + Perception (+1 Flat) + Crit(Str)
export function calculateGoldGain(difficulty: TaskDifficulty, perception: number = 0, strength: number = 0): { gold: number, isCrit: boolean } {
  let gold = GOLD_REWARDS[difficulty];

  // User Rule: "a cada ponto upado aumenta em uma unidade o farm de ouro"
  gold = gold + perception;

  // Crit Check
  const critChance = calculateCritChance(strength);
  const isCrit = Math.random() < critChance;

  if (isCrit) {
    gold = gold * 1.5;
  }

  return { gold: Number(gold.toFixed(2)), isCrit };
}

// 7. Raid Damage: Strength based
export function calculateRaidDamage(baseDamage: number, strength: number): { damage: number, isCrit: boolean } {
  // Str increases raw damage. 
  const strMultiplier = 1 + (strength * 0.05); // 5% per point
  let damage = baseDamage * strMultiplier;

  const critChance = calculateCritChance(strength);
  const isCrit = Math.random() < critChance;

  if (isCrit) {
    damage *= 2.0;
  }

  return { damage: Math.ceil(damage), isCrit };
}

// Drop Rate: Fixed (Perception does NOT affect drops anymore per user request)
export function calculateDropRateMultiplier(perception: number): number {
  return 1.0;
}

// 8. Dodge Chance: Based on Perception (NEW MECHANIC)
// This calculates the chance to dodge Boss counter-attacks in raids
export function calculateDodgeChance(perception: number): number {
  // 0.5% per point of Perception, max 50%
  return Math.min(perception * 0.005, 0.50);
}


// ----------------------------------------------------------------------
// LEGACY / COMPATIBILITY EXPORTS
// ----------------------------------------------------------------------
// Keeping these to avoid breaking imports in other files, but they do nothing now.
export const CLASS_DEFENSE: Record<PlayerClass, number> = {
  apprentice: 1, warrior: 1, mage: 1, rogue: 1, cleric: 1, paladin: 1
};
export const CLASS_MANA_MULTIPLIER: Record<PlayerClass, number> = {
  apprentice: 1, warrior: 1, mage: 1, rogue: 1, cleric: 1, paladin: 1
};
export const CLASS_XP_LOSS_REDUCTION: Record<PlayerClass, number> = {
  apprentice: 1, warrior: 1, mage: 1, rogue: 1, cleric: 1, paladin: 1
};
export const CLASS_HP_REGEN_BONUS: Record<PlayerClass, number> = {
  apprentice: 0, warrior: 0, mage: 0, rogue: 0, cleric: 0, paladin: 0
};
export const CLASS_DROP_BONUS: Record<PlayerClass, number> = {
  apprentice: 0, warrior: 0, mage: 0, rogue: 0, cleric: 0, paladin: 0
};

// Class visual info (Descriptions updated)
export const CLASS_INFO: Record<PlayerClass, { name: string; description: string; skill: string; icon: string }> = {
  apprentice: { name: 'Aprendiz', description: 'Início da jornada.', skill: '-', icon: '🎓' },
  warrior: { name: 'Guerreiro', description: 'Foco em Força e Críticos.', skill: 'Críticos Devastadores', icon: '⚔️' },
  mage: { name: 'Mago', description: 'Mestre de XP e Mana.', skill: 'Fluxo de Mana', icon: '🔮' },
  rogue: { name: 'Ladino', description: 'Ouro e Percepção.', skill: 'Mãos Leves', icon: '🗡️' },
  cleric: { name: 'Clérigo', description: 'Resistência e Cura.', skill: 'Cura Passiva', icon: '✨' },
  paladin: { name: 'Paladino', description: 'Defesa e Força.', skill: 'Baluarte', icon: '🛡️' },
};

export const CLASS_UNLOCK_LEVEL = 10;
export const FREE_TASK_LIMIT = 4;
export const FREE_HABIT_LIMIT = 4;
export const PRO_UPGRADE_COST = 5;
