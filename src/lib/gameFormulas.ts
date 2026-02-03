// Game formulas for TaskQuest RPG (Habitica-style progression)

export type PlayerClass = 'apprentice' | 'warrior' | 'mage' | 'rogue' | 'cleric' | 'paladin';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

// XP required to reach a level: Habitica-inspired formula
// (n² + 24n + 475) / 2 - Makes leveling progressively harder
export function xpForLevel(level: number): number {
  return Math.floor((level * level + 24 * level + 475) / 2);
}

// XP required for next level from current level
export function xpToNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1);
}

// Get total XP accumulated at a certain level
export function totalXpAtLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    // We sum the XP needed for each level up: Lvl 1->2 (xpForLevel(2)), Lvl 2->3 (xpForLevel(3)), etc.
    total += xpForLevel(i + 1);
  }
  return total;
}

// Difficulty multipliers
export const DIFFICULTY_MULTIPLIERS: Record<TaskDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

// XP rewards per difficulty (REDUCED for slower progression)
export const XP_REWARDS: Record<TaskDifficulty, number> = {
  easy: 5,
  medium: 12,
  hard: 25,
};

// Gold rewards per difficulty (REDUCED - gold is now scarce)
export const GOLD_REWARDS: Record<TaskDifficulty, number> = {
  easy: 2,
  medium: 5,
  hard: 12,
};

// Habit XP rewards (positive habits give XP)
export const HABIT_XP_REWARD = 3;

// Habit HP damage (negative habits hurt HP)
export const HABIT_HP_DAMAGE = 5;

// Habit HP heal (positive habits heal HP)
export const HABIT_HP_HEAL = 3;

// Class defense modifiers (reduces damage)
export const CLASS_DEFENSE: Record<PlayerClass, number> = {
  apprentice: 1,
  warrior: 1.5, // 50% less damage
  mage: 0.8,
  rogue: 1,
  cleric: 1,
  paladin: 1.2, // 20% less damage
};

// Class mana multipliers
export const CLASS_MANA_MULTIPLIER: Record<PlayerClass, number> = {
  apprentice: 1,
  warrior: 1,
  mage: 1.5, // 50% more mana
  rogue: 1,
  cleric: 1.2,
  paladin: 1,
};

// Class XP loss reduction (when failing tasks)
export const CLASS_XP_LOSS_REDUCTION: Record<PlayerClass, number> = {
  apprentice: 1,
  warrior: 1,
  mage: 1,
  rogue: 1,
  cleric: 1,
  paladin: 0.5, // Loses 50% less XP
};

// Class HP regeneration bonus (when completing habits)
export const CLASS_HP_REGEN_BONUS: Record<PlayerClass, number> = {
  apprentice: 0,
  warrior: 0,
  mage: 0,
  rogue: 0,
  cleric: 10, // Extra 10 HP
  paladin: 5,
};

// Class item drop chance bonus
export const CLASS_DROP_BONUS: Record<PlayerClass, number> = {
  apprentice: 0,
  warrior: 0,
  mage: 0,
  rogue: 0.15, // 15% more drop chance
  cleric: 0,
  paladin: 0,
};

export interface PlayerAttributes {
  strength: number;
  intelligence: number;
  constitution: number;
  perception: number;
}

// Calculate max HP based on Constitution
export function calculateMaxHp(baseHp: number, constitution: number): number {
  return baseHp + (constitution * 5);
}

// Calculate max Mana based on Intelligence
export function calculateMaxMana(baseMana: number, intelligence: number): number {
  return baseMana + (intelligence * 5);
}

// Calculate damage from failed task influenced by Constitution
export function calculateDamage(
  level: number,
  difficulty: TaskDifficulty,
  playerClass: PlayerClass,
  constitution: number = 0
): number {
  const difficultyFactor = DIFFICULTY_MULTIPLIERS[difficulty] * 2.5;
  const defense = CLASS_DEFENSE[playerClass];
  const damageReduction = constitution * 0.5; // Each point reduces 0.5 damage
  const rawDamage = (level * difficultyFactor) / defense;
  return Math.max(1, Math.ceil(rawDamage - damageReduction));
}

// XP reward influenced by Intelligence
export function calculateXpGain(difficulty: TaskDifficulty, intelligence: number = 0): number {
  const baseXP = XP_REWARDS[difficulty];
  const bonusXP = intelligence * 0.5; // Each point gives 0.5 extra XP
  return Math.ceil(baseXP + bonusXP);
}

// Gold reward influenced by Perception
export function calculateGoldGain(difficulty: TaskDifficulty, perception: number = 0): number {
  const baseGold = GOLD_REWARDS[difficulty];
  const bonusGold = perception * 0.2; // Each point gives 0.2 extra Gold
  return Math.ceil(baseGold + bonusGold);
}

// Mana reward influenced by Class and Intelligence
export function calculateManaGain(difficulty: TaskDifficulty, playerClass: PlayerClass, intelligence: number = 0): number {
  const baseMana = DIFFICULTY_MULTIPLIERS[difficulty] * 2;
  const classMultiplier = CLASS_MANA_MULTIPLIER[playerClass];
  const bonusMana = intelligence * 0.2;
  return Math.ceil((baseMana * classMultiplier) + bonusMana);
}

// Raid damage influenced by level
// Base damage is multiplied by (1 + level * 0.02) - 2% extra damage per level
export function calculateRaidDamage(baseDamage: number, level: number): number {
  const levelMultiplier = 1 + (level * 0.02);
  return Math.ceil(baseDamage * levelMultiplier);
}

// Check if player can level up
export function canLevelUp(currentLevel: number, currentXp: number): boolean {
  return currentXp >= xpToNextLevel(currentLevel);
}

// Calculate new level and remaining XP after leveling up
export function processLevelUp(
  currentLevel: number,
  currentXp: number
): { newLevel: number; remainingXp: number } {
  let level = currentLevel;
  let xp = currentXp;

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level++;
  }

  return { newLevel: level, remainingXp: xp };
}

// Get class display info
export const CLASS_INFO: Record<PlayerClass, { name: string; description: string; skill: string; icon: string }> = {
  apprentice: {
    name: 'Aprendiz',
    description: 'Um aventureiro iniciante buscando seu caminho',
    skill: 'Nenhuma habilidade ativa ainda.',
    icon: '🎓',
  },
  warrior: {
    name: 'Guerreiro',
    description: 'Reduz o dano recebido por tarefas falhadas em 50%',
    skill: '🛡️ BALUARTE: Absorve 30% do dano que os aliados receberiam de ataques do Boss na Raid.',
    icon: '⚔️',
  },
  mage: {
    name: 'Mago',
    description: 'Ganha 50% mais Mana por tarefa completada',
    skill: '🔮 ECO ARCANO: A cada 3 tarefas completadas, libera uma explosão que causa 50% de dano extra no Boss.',
    icon: '🔮',
  },
  rogue: {
    name: 'Ladino',
    description: 'Maior chance de drop de itens (15% bônus)',
    skill: '🏹 SARAIVADA: A cada 3 tarefas completadas, dispara uma rajada que causa 30% de dano extra no Boss.',
    icon: '🗡️',
  },
  cleric: {
    name: 'Clérigo',
    description: 'Regenera 10 HP extra ao completar hábitos',
    skill: '✨ ORAÇÃO COLETIVA: A cada 3 tarefas completadas, cura 10% do HP de TODOS os aliados na Raid.',
    icon: '✨',
  },
  paladin: {
    name: 'Paladino',
    description: 'Perde 50% menos XP ao falhar tarefas',
    skill: '🛡️ AURA DE SACRIFÍCIO: Reduz passivamente 10% do dano de todos os membros da Raid.',
    icon: '🛡️',
  },
};

// Level required to choose a class
export const CLASS_UNLOCK_LEVEL = 10;

// Free task limit
export const FREE_TASK_LIMIT = 4;

// Free habit limit
export const FREE_HABIT_LIMIT = 4;

// Pro upgrade cost in diamonds
export const PRO_UPGRADE_COST = 5;
