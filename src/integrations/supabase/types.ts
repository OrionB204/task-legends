export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      available_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          diamond_amount: number
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          diamond_amount: number
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          diamond_amount?: number
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      custom_rewards: {
        Row: {
          created_at: string
          description: string | null
          gold_cost: number
          id: string
          name: string
          times_purchased: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gold_cost?: number
          id?: string
          name: string
          times_purchased?: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gold_cost?: number
          id?: string
          name?: string
          times_purchased?: number
          user_id?: string
        }
        Relationships: []
      }
      diamond_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_used: boolean
          used_at: string | null
          used_by: string | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by?: string | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by?: string | null
          value?: number
        }
        Relationships: []
      }
      diamond_requests: {
        Row: {
          code: string | null
          created_at: string
          diamonds_amount: number
          email: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          diamonds_amount: number
          email: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          diamonds_amount?: number
          email?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      diamond_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_codes: {
        Row: {
          code: string
          created_at: string | null
          diamond_amount: number
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          diamond_amount: number
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          diamond_amount?: number
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      guild_announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string
          guild_id: string
          id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          guild_id: string
          id?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          guild_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_announcements_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          created_at: string
          description: string | null
          emblem_color: string | null
          id: string
          leader_id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emblem_color?: string | null
          id?: string
          leader_id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emblem_color?: string | null
          id?: string
          leader_id?: string
          name?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_positive: boolean
          last_completed: string | null
          streak: number
          times_completed: number
          times_failed: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          is_positive?: boolean
          last_completed?: string | null
          streak?: number
          times_completed?: number
          times_failed?: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_positive?: boolean
          last_completed?: string | null
          streak?: number
          times_completed?: number
          times_failed?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          item_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string
          channel_type: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          channel_id: string
          channel_type: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          channel_id?: string
          channel_type?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: []
      }
      online_status: {
        Row: {
          is_online: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_hp: number
          current_mana: number
          current_xp: number
          diamonds: number
          equipped_hat: string | null
          equipped_mount: string | null
          equipped_skin: string | null
          gold: number
          id: string
          is_pro: boolean
          level: number
          max_hp: number
          max_mana: number
          player_class: Database["public"]["Enums"]["player_class"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_hp?: number
          current_mana?: number
          current_xp?: number
          diamonds?: number
          equipped_hat?: string | null
          equipped_mount?: string | null
          equipped_skin?: string | null
          gold?: number
          id?: string
          is_pro?: boolean
          level?: number
          max_hp?: number
          max_mana?: number
          player_class?: Database["public"]["Enums"]["player_class"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_hp?: number
          current_mana?: number
          current_xp?: number
          diamonds?: number
          equipped_hat?: string | null
          equipped_mount?: string | null
          equipped_skin?: string | null
          gold?: number
          id?: string
          is_pro?: boolean
          level?: number
          max_hp?: number
          max_mana?: number
          player_class?: Database["public"]["Enums"]["player_class"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      pvp_duels: {
        Row: {
          challenged_hp: number
          challenged_id: string
          challenger_hp: number
          challenger_id: string
          created_at: string
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
          winner_id: string | null
        }
        Insert: {
          challenged_hp?: number
          challenged_id: string
          challenger_hp?: number
          challenger_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          challenged_hp?: number
          challenged_id?: string
          challenger_hp?: number
          challenger_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      pvp_selected_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          contest_reason: string | null
          contested: boolean
          created_at: string
          damage_dealt: number
          duel_id: string
          evidence_url: string | null
          id: string
          locked: boolean
          task_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          contest_reason?: string | null
          contested?: boolean
          created_at?: string
          damage_dealt?: number
          duel_id: string
          evidence_url?: string | null
          id?: string
          locked?: boolean
          task_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          contest_reason?: string | null
          contested?: boolean
          created_at?: string
          damage_dealt?: number
          duel_id?: string
          evidence_url?: string | null
          id?: string
          locked?: boolean
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_selected_tasks_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "pvp_duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_selected_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      raid_members: {
        Row: {
          damage_dealt: number
          id: string
          is_leader: boolean
          joined_at: string
          raid_id: string
          user_id: string
        }
        Insert: {
          damage_dealt?: number
          id?: string
          is_leader?: boolean
          joined_at?: string
          raid_id: string
          user_id: string
        }
        Update: {
          damage_dealt?: number
          id?: string
          is_leader?: boolean
          joined_at?: string
          raid_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raid_members_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "raids"
            referencedColumns: ["id"]
          },
        ]
      }
      raids: {
        Row: {
          boss_current_hp: number
          boss_damage: number
          boss_max_hp: number
          boss_name: string
          created_at: string
          deadline: string
          id: string
          leader_id: string
          name: string
          status: string
        }
        Insert: {
          boss_current_hp?: number
          boss_damage?: number
          boss_max_hp?: number
          boss_name: string
          created_at?: string
          deadline: string
          id?: string
          leader_id: string
          name: string
          status?: string
        }
        Update: {
          boss_current_hp?: number
          boss_damage?: number
          boss_max_hp?: number
          boss_name?: string
          created_at?: string
          deadline?: string
          id?: string
          leader_id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      redemption_codes: {
        Row: {
          admin_code: string | null
          admin_notes: string | null
          code: string
          created_at: string
          diamonds_spent: number | null
          email_sent: boolean | null
          id: string
          legacy_gold_spent: number
          pix_key: string | null
          processed_at: string | null
          real_value: number
          status: string
          user_id: string
        }
        Insert: {
          admin_code?: string | null
          admin_notes?: string | null
          code: string
          created_at?: string
          diamonds_spent?: number | null
          email_sent?: boolean | null
          id?: string
          legacy_gold_spent: number
          pix_key?: string | null
          processed_at?: string | null
          real_value: number
          status?: string
          user_id: string
        }
        Update: {
          admin_code?: string | null
          admin_notes?: string | null
          code?: string
          created_at?: string
          diamonds_spent?: number | null
          email_sent?: boolean | null
          id?: string
          legacy_gold_spent?: number
          pix_key?: string | null
          processed_at?: string | null
          real_value?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_purchases: {
        Row: {
          gold_spent: number
          id: string
          purchased_at: string
          reward_id: string
          user_id: string
        }
        Insert: {
          gold_spent: number
          id?: string
          purchased_at?: string
          reward_id: string
          user_id: string
        }
        Update: {
          gold_spent?: number
          id?: string
          purchased_at?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_purchases_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "custom_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_items: {
        Row: {
          created_at: string
          description: string | null
          effect_type: string | null
          effect_value: number | null
          id: string
          image_url: string | null
          item_type: string
          name: string
          price_diamonds: number | null
          price_gold: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          effect_type?: string | null
          effect_value?: number | null
          id?: string
          image_url?: string | null
          item_type: string
          name: string
          price_diamonds?: number | null
          price_gold?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          effect_type?: string | null
          effect_value?: number | null
          id?: string
          image_url?: string | null
          item_type?: string
          name?: string
          price_diamonds?: number | null
          price_gold?: number | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string
          duel_id: string | null
          id: string
          reported_user_id: string | null
          resolved_at: string | null
          status: string
          subject: string
          ticket_type: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          duel_id?: string | null
          id?: string
          reported_user_id?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_type: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          duel_id?: string | null
          id?: string
          reported_user_id?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_type?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["task_difficulty"]
          due_date: string | null
          gold_reward: number
          id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["task_difficulty"]
          due_date?: string | null
          gold_reward?: number
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["task_difficulty"]
          due_date?: string | null
          gold_reward?: number
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_pvp_duel: { Args: { duel_id_param: string }; Returns: undefined }
      apply_daily_penalties: { Args: never; Returns: Json }
      generate_redemption_code: { Args: never; Returns: string }
      redeem_diamond_code: { Args: { code_input: string }; Returns: Json }
      xp_for_level: { Args: { lvl: number }; Returns: number }
    }
    Enums: {
      player_class:
        | "apprentice"
        | "warrior"
        | "mage"
        | "rogue"
        | "cleric"
        | "paladin"
      task_difficulty: "easy" | "medium" | "hard"
      task_status: "pending" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      player_class: [
        "apprentice",
        "warrior",
        "mage",
        "rogue",
        "cleric",
        "paladin",
      ],
      task_difficulty: ["easy", "medium", "hard"],
      task_status: ["pending", "completed", "failed"],
    },
  },
} as const
