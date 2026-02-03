// Social types for TaskQuest - manually defined since DB types not yet synced

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  emblem_color: string;
  leader_id: string;
  created_at: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface GuildAnnouncement {
  id: string;
  guild_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Raid {
  id: string;
  name: string;
  boss_name: string;
  boss_max_hp: number;
  boss_current_hp: number;
  boss_damage: number;
  deadline: string;
  status: 'active' | 'victory' | 'failed';
  leader_id: string;
  created_at: string;
}

export interface RaidMember {
  id: string;
  raid_id: string;
  user_id: string;
  damage_dealt: number;
  is_leader: boolean;
  joined_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  channel_type: 'raid' | 'guild';
  channel_id: string;
  created_at: string;
}

export interface OnlineStatus {
  user_id: string;
  last_seen: string;
  is_online: boolean;
}

// Boss templates for raids
export const BOSS_TEMPLATES = [
  { name: 'Dragão de Fogo', hp: 1000, damage: 25, emoji: '🐉' },
  { name: 'Hydra de Código', hp: 1500, damage: 30, emoji: '🐍' },
  { name: 'Golem de Pedra', hp: 800, damage: 20, emoji: '🗿' },
  { name: 'Fênix Sombria', hp: 1200, damage: 35, emoji: '🔥' },
  { name: 'Kraken Abissal', hp: 2000, damage: 40, emoji: '🦑' },
];
