export interface PvPDuel {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_hp: number;
  challenged_hp: number;
  status: 'pending' | 'selecting' | 'active' | 'completed' | 'cancelled';
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface PvPSelectedTask {
  id: string;
  duel_id: string;
  user_id: string;
  task_id: string;
  locked: boolean;
  completed: boolean;
  evidence_url: string | null;
  contested: boolean;
  contest_reason: string | null;
  damage_dealt: number;
  completed_at: string | null;
  created_at: string;
  task?: {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    xp_reward: number;
    gold_reward: number;
  };
}

export interface PvPParticipant {
  id: string;
  username: string;
  level: number;
  player_class: string;
  hp: number;
  selectedTasks: PvPSelectedTask[];
  locked: boolean;
}

export const PVP_DAMAGE = {
  medium: 15,
  hard: 25,
} as const;

export const REQUIRED_TASKS = 5;
export const MAX_HP = 100;
