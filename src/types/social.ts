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
  charge_meter?: number; // 0-100%
  charge_deadline?: string;
  is_stunned?: boolean;
  stunned_until?: string;
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

export interface BossTemplate {
  name: string;
  hp: number;
  damage: number;
  emoji: string;
  image: string;
  lore: string;
}

// Boss templates for raids
export const BOSS_TEMPLATES: BossTemplate[] = [
  {
    name: 'Ignis, o Devorador',
    hp: 1200,
    damage: 30,
    emoji: '🔥',
    image: '84-840679_blue-flame-boss-pixel-art-enemy-png-clipart.png',
    lore: 'Antigamente, a Chama Eterna de um vulcão místico trazia vida e calor ao mundo, mas a ganância dos seus guardiões enfraqueceu os selos que a protegiam. Esse desequilíbrio despertou Ignis, um dragão ancestral que consume a energia térmica de tudo ao seu redor. Ao se fundir com a Chama Eterna, ele condenou o continente a um inverno de cinzas. Heróis devem invadir o Vulcão da Ascensão Ardente para romper sua conexão antes que ele se torne imparável.'
  },
  {
    name: 'A Hydra dos Loops Literários',
    hp: 1500,
    damage: 30,
    emoji: '🐍',
    image: 'boss_hydra.png',
    lore: 'Nascida nas profundezas das Bibliotecas de Código Esquecidas, esta Hydra é a personificação dos erros de lógica e ciclos infinitos. Cada cabeça representa uma tarefa mal resolvida que gera dois novos problemas ao ser cortada. Somente um esforço coordenado de lógica e persistência pode silenciar seus chiados binários e libertar os sistemas de TasKLegends de seu controle paralisante.'
  },
  {
    name: 'Sir Galen, o Cavaleiro da Inércia',
    hp: 2000,
    damage: 40,
    emoji: '⚔️',
    image: 'images.png',
    lore: 'Antigo campeão da Ordem do Foco, Sir Galen foi corrompido pela Maldição da Procrastinação. Sua armadura, antes reluzente como o sol, agora é um amálgama pesado de prazos perdidos e promessas quebradas. Ele guarda as Portas da Disciplina, impedindo que novos heróis alcancem a maestria. Derrotá-lo não é apenas uma batalha de espadas, mas uma prova de que a vontade pode superar o peso do passado.'
  },
  {
    name: 'Xylo, o Olho Plasmático',
    hp: 1000,
    damage: 35,
    emoji: '👁️',
    image: 'images (1).png',
    lore: 'Vindo de uma dimensão onde a atenção é a moeda mais valiosa, Xylo é um observador cósmico que drena o foco daqueles que cruzam o seu caminho. Seu núcleo de plasma vibra na frequência das distrações mundanas, atraindo a mente dos heróis para longe de seus objetivos. Para derrotá-lo, o grupo deve manter uma concentração absoluta, provando que nem mesmo o brilho hipnótico do abismo pode desviá-los.'
  },
  {
    name: 'Glup, o Terror Geométrico',
    hp: 1300,
    damage: 25,
    emoji: '👾',
    image: 'desenho-de-pixel-de-monstro-dos-desenhos-animados_61878-709.avif',
    lore: 'Uma falha visual que ganhou vida nas névoas do Pântano Estagnado. Glup é formado por pixels instáveis que representam o progresso não salvo e o esforço desperdiçado. Ele se alimenta da confusão organizacional e da falta de método. Enfrentar esse monstro requer uma estratégia clara e movimentos precisos, ou os heróis serão absorvidos por sua forma amorfa e caótica.'
  },
  {
    name: 'Vaelith, a Soberana Esmeralda',
    hp: 3500,
    damage: 55,
    emoji: '🐉',
    image: 'images (11).jpg',
    lore: 'Diz a lenda que Vaelith nasceu do primeiro diamante purificado nos Fornos da Disciplina. Como protetora das riquezas de TasKLegends, ela só concede acesso aos Tesouros Divinos para aqueles que provarem valor através de conquistas hercúleas. No entanto, sua natureza dracônica a tornou possessiva, e agora ela desafia as guildas em um teste final de força e união. Ela é o desafio supremo entre os aventureiros e a glória eterna.'
  },
];
