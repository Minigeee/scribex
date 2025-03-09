export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string;
          description: string | null;
          icon_url: string | null;
          id: number;
          name: string;
          points: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: number;
          name: string;
          points?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: number;
          name?: string;
          points?: number | null;
        };
        Relationships: [];
      };
      article_examples: {
        Row: {
          content: string;
          content_layer_id: number | null;
          created_at: string;
          description: string | null;
          difficulty: number | null;
          has_rich_content: boolean | null;
          id: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          difficulty?: number | null;
          has_rich_content?: boolean | null;
          id?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          difficulty?: number | null;
          has_rich_content?: boolean | null;
          id?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'article_examples_content_layer_id_fkey';
            columns: ['content_layer_id'];
            isOneToOne: false;
            referencedRelation: 'content_layers';
            referencedColumns: ['id'];
          },
        ];
      };
      character_inventory: {
        Row: {
          acquired_at: string;
          character_id: string;
          created_at: string;
          equipped: boolean;
          id: string;
          item_template_id: string;
          quantity: number;
          updated_at: string;
        };
        Insert: {
          acquired_at?: string;
          character_id: string;
          created_at?: string;
          equipped?: boolean;
          id?: string;
          item_template_id: string;
          quantity?: number;
          updated_at?: string;
        };
        Update: {
          acquired_at?: string;
          character_id?: string;
          created_at?: string;
          equipped?: boolean;
          id?: string;
          item_template_id?: string;
          quantity?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'character_inventory_character_id_fkey';
            columns: ['character_id'];
            isOneToOne: false;
            referencedRelation: 'character_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'character_inventory_item_template_id_fkey';
            columns: ['item_template_id'];
            isOneToOne: false;
            referencedRelation: 'item_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      character_profiles: {
        Row: {
          character_class: string;
          created_at: string;
          currency: number;
          current_streak: number;
          experience_points: number;
          id: string;
          last_activity_date: string | null;
          level: number;
          longest_streak: number;
          stat_points_available: number;
          stats: Json;
          updated_at: string;
        };
        Insert: {
          character_class?: string;
          created_at?: string;
          currency?: number;
          current_streak?: number;
          experience_points?: number;
          id: string;
          last_activity_date?: string | null;
          level?: number;
          longest_streak?: number;
          stat_points_available?: number;
          stats?: Json;
          updated_at?: string;
        };
        Update: {
          character_class?: string;
          created_at?: string;
          currency?: number;
          current_streak?: number;
          experience_points?: number;
          id?: string;
          last_activity_date?: string | null;
          level?: number;
          longest_streak?: number;
          stat_points_available?: number;
          stats?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'character_profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      character_quests: {
        Row: {
          character_id: string;
          completed_at: string | null;
          created_at: string;
          id: string;
          project_id: string | null;
          quest_id: string;
          rewards_claimed: boolean | null;
          started_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          project_id?: string | null;
          quest_id: string;
          rewards_claimed?: boolean | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          project_id?: string | null;
          quest_id?: string;
          rewards_claimed?: boolean | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'character_quests_character_id_fkey';
            columns: ['character_id'];
            isOneToOne: false;
            referencedRelation: 'character_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'character_quests_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'character_quests_quest_id_fkey';
            columns: ['quest_id'];
            isOneToOne: false;
            referencedRelation: 'quests';
            referencedColumns: ['id'];
          },
        ];
      };
      character_skill_nodes: {
        Row: {
          character_id: string;
          completed_at: string | null;
          created_at: string;
          id: string;
          node_id: string;
          rewards_claimed: boolean | null;
          status: string;
          unlocked_at: string | null;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          node_id: string;
          rewards_claimed?: boolean | null;
          status?: string;
          unlocked_at?: string | null;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          node_id?: string;
          rewards_claimed?: boolean | null;
          status?: string;
          unlocked_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'character_skill_nodes_character_id_fkey';
            columns: ['character_id'];
            isOneToOne: false;
            referencedRelation: 'character_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'character_skill_nodes_node_id_fkey';
            columns: ['node_id'];
            isOneToOne: false;
            referencedRelation: 'skill_tree_nodes';
            referencedColumns: ['id'];
          },
        ];
      };
      classroom_members: {
        Row: {
          classroom_id: string;
          joined_at: string;
          role: string;
          user_id: string;
        };
        Insert: {
          classroom_id: string;
          joined_at?: string;
          role: string;
          user_id: string;
        };
        Update: {
          classroom_id?: string;
          joined_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'classroom_members_classroom_id_fkey';
            columns: ['classroom_id'];
            isOneToOne: false;
            referencedRelation: 'classrooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'classroom_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      classrooms: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          join_code: string;
          name: string;
          owner_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          join_code: string;
          name: string;
          owner_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          join_code?: string;
          name?: string;
          owner_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'classrooms_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      content_layers: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
          order_index: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
          order_index: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
          order_index?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          last_message_at: string;
          metadata: Json | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_message_at?: string;
          metadata?: Json | null;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_message_at?: string;
          metadata?: Json | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      exercise_templates: {
        Row: {
          content: string;
          content_layer_id: number | null;
          created_at: string;
          description: string | null;
          difficulty: number | null;
          id: number;
          solution_structure: Json | null;
          template_type: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          difficulty?: number | null;
          id?: number;
          solution_structure?: Json | null;
          template_type: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          difficulty?: number | null;
          id?: number;
          solution_structure?: Json | null;
          template_type?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exercise_templates_content_layer_id_fkey';
            columns: ['content_layer_id'];
            isOneToOne: false;
            referencedRelation: 'content_layers';
            referencedColumns: ['id'];
          },
        ];
      };
      exercises: {
        Row: {
          content: string;
          created_at: string;
          description: string | null;
          exercise_type: string;
          id: string;
          lesson_id: string | null;
          order_index: number | null;
          points: number | null;
          solution: Json | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          description?: string | null;
          exercise_type: string;
          id?: string;
          lesson_id?: string | null;
          order_index?: number | null;
          points?: number | null;
          solution?: Json | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          description?: string | null;
          exercise_type?: string;
          id?: string;
          lesson_id?: string | null;
          order_index?: number | null;
          points?: number | null;
          solution?: Json | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exercises_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      faction_members: {
        Row: {
          character_id: string;
          created_at: string;
          faction_id: string;
          id: string;
          joined_at: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          created_at?: string;
          faction_id: string;
          id?: string;
          joined_at?: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          created_at?: string;
          faction_id?: string;
          id?: string;
          joined_at?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'faction_members_character_id_fkey';
            columns: ['character_id'];
            isOneToOne: false;
            referencedRelation: 'character_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'faction_members_faction_id_fkey';
            columns: ['faction_id'];
            isOneToOne: false;
            referencedRelation: 'factions';
            referencedColumns: ['id'];
          },
        ];
      };
      factions: {
        Row: {
          classroom_id: string | null;
          created_at: string;
          description: string | null;
          icon_url: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          classroom_id?: string | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          classroom_id?: string | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'factions_classroom_id_fkey';
            columns: ['classroom_id'];
            isOneToOne: false;
            referencedRelation: 'classrooms';
            referencedColumns: ['id'];
          },
        ];
      };
      genres: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      item_templates: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          item_type: string;
          name: string;
          rarity: string;
          stat_bonuses: Json | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          item_type: string;
          name: string;
          rarity?: string;
          stat_bonuses?: Json | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          item_type?: string;
          name?: string;
          rarity?: string;
          stat_bonuses?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      leaderboards: {
        Row: {
          character_id: string;
          created_at: string;
          end_time: string;
          id: string;
          points: number;
          start_time: string;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          created_at?: string;
          end_time: string;
          id?: string;
          points?: number;
          start_time: string;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          created_at?: string;
          end_time?: string;
          id?: string;
          points?: number;
          start_time?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leaderboards_character_id_fkey';
            columns: ['character_id'];
            isOneToOne: false;
            referencedRelation: 'character_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_article_reads: {
        Row: {
          completed: boolean | null;
          first_read_at: string;
          id: string;
          last_read_at: string;
          lesson_id: string | null;
          read_count: number | null;
          user_id: string | null;
        };
        Insert: {
          completed?: boolean | null;
          first_read_at?: string;
          id?: string;
          last_read_at?: string;
          lesson_id?: string | null;
          read_count?: number | null;
          user_id?: string | null;
        };
        Update: {
          completed?: boolean | null;
          first_read_at?: string;
          id?: string;
          last_read_at?: string;
          lesson_id?: string | null;
          read_count?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lesson_article_reads_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lesson_article_reads_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      lessons: {
        Row: {
          article: string | null;
          content_layer_id: number | null;
          created_at: string;
          description: string | null;
          difficulty: number;
          has_rich_content: boolean | null;
          id: string;
          order_index: number | null;
          published: boolean | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          article?: string | null;
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          difficulty: number;
          has_rich_content?: boolean | null;
          id?: string;
          order_index?: number | null;
          published?: boolean | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          article?: string | null;
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          difficulty?: number;
          has_rich_content?: boolean | null;
          id?: string;
          order_index?: number | null;
          published?: boolean | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lessons_content_layer_id_fkey';
            columns: ['content_layer_id'];
            isOneToOne: false;
            referencedRelation: 'content_layers';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          role: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          role: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
          user_type: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
          user_type: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
          user_type?: string;
          username?: string;
        };
        Relationships: [];
      };
      project_revisions: {
        Row: {
          ai_feedback: string | null;
          content: string;
          created_at: string;
          id: string;
          project_id: string | null;
        };
        Insert: {
          ai_feedback?: string | null;
          content: string;
          created_at?: string;
          id?: string;
          project_id?: string | null;
        };
        Update: {
          ai_feedback?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          project_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'project_revisions_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          classroom_id: string | null;
          content: string | null;
          created_at: string;
          description: string | null;
          genre_id: number | null;
          id: string;
          metadata: Json | null;
          prompt: string | null;
          status: string;
          title: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          classroom_id?: string | null;
          content?: string | null;
          created_at?: string;
          description?: string | null;
          genre_id?: number | null;
          id?: string;
          metadata?: Json | null;
          prompt?: string | null;
          status: string;
          title: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          classroom_id?: string | null;
          content?: string | null;
          created_at?: string;
          description?: string | null;
          genre_id?: number | null;
          id?: string;
          metadata?: Json | null;
          prompt?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_classroom_id_fkey';
            columns: ['classroom_id'];
            isOneToOne: false;
            referencedRelation: 'classrooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'projects_genre_id_fkey';
            columns: ['genre_id'];
            isOneToOne: false;
            referencedRelation: 'genres';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      quests: {
        Row: {
          available_from: string | null;
          available_until: string | null;
          created_at: string;
          description: string | null;
          difficulty: number;
          genre_id: number | null;
          id: string;
          is_daily_quest: boolean;
          location_id: string | null;
          prerequisite_quests: string[] | null;
          prerequisite_stats: Json | null;
          prompt: string | null;
          prompt_expires_at: string | null;
          rewards: Json | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          available_from?: string | null;
          available_until?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: number;
          genre_id?: number | null;
          id?: string;
          is_daily_quest?: boolean;
          location_id?: string | null;
          prerequisite_quests?: string[] | null;
          prerequisite_stats?: Json | null;
          prompt?: string | null;
          prompt_expires_at?: string | null;
          rewards?: Json | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          available_from?: string | null;
          available_until?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: number;
          genre_id?: number | null;
          id?: string;
          is_daily_quest?: boolean;
          location_id?: string | null;
          prerequisite_quests?: string[] | null;
          prerequisite_stats?: Json | null;
          prompt?: string | null;
          prompt_expires_at?: string | null;
          rewards?: Json | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'quests_genre_id_fkey';
            columns: ['genre_id'];
            isOneToOne: false;
            referencedRelation: 'genres';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'quests_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'world_locations';
            referencedColumns: ['id'];
          },
        ];
      };
      reward_definitions: {
        Row: {
          created_at: string;
          id: string;
          reward_data: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reward_data: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reward_data?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      skill_tree_nodes: {
        Row: {
          content_layer_id: number | null;
          created_at: string;
          description: string | null;
          icon_url: string | null;
          id: string;
          lesson_id: string | null;
          node_type: string;
          position_x: number;
          position_y: number;
          prerequisite_nodes: string[] | null;
          rewards: Json | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          lesson_id?: string | null;
          node_type: string;
          position_x?: number;
          position_y?: number;
          prerequisite_nodes?: string[] | null;
          rewards?: Json | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          content_layer_id?: number | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          lesson_id?: string | null;
          node_type?: string;
          position_x?: number;
          position_y?: number;
          prerequisite_nodes?: string[] | null;
          rewards?: Json | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'skill_tree_nodes_content_layer_id_fkey';
            columns: ['content_layer_id'];
            isOneToOne: false;
            referencedRelation: 'content_layers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'skill_tree_nodes_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      user_achievements: {
        Row: {
          achievement_id: number;
          earned_at: string;
          user_id: string;
        };
        Insert: {
          achievement_id: number;
          earned_at?: string;
          user_id: string;
        };
        Update: {
          achievement_id?: number;
          earned_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey';
            columns: ['achievement_id'];
            isOneToOne: false;
            referencedRelation: 'achievements';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_achievements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_progress: {
        Row: {
          attempts: number | null;
          completed: boolean | null;
          exercise_id: string | null;
          id: string;
          last_attempt_at: string | null;
          lesson_id: string | null;
          score: number | null;
          user_answers: Json | null;
          user_id: string | null;
        };
        Insert: {
          attempts?: number | null;
          completed?: boolean | null;
          exercise_id?: string | null;
          id?: string;
          last_attempt_at?: string | null;
          lesson_id?: string | null;
          score?: number | null;
          user_answers?: Json | null;
          user_id?: string | null;
        };
        Update: {
          attempts?: number | null;
          completed?: boolean | null;
          exercise_id?: string | null;
          id?: string;
          last_attempt_at?: string | null;
          lesson_id?: string | null;
          score?: number | null;
          user_answers?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_progress_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_progress_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_progress_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      world_locations: {
        Row: {
          adjacent_locations: string[] | null;
          created_at: string;
          description: string | null;
          icon_url: string | null;
          id: string;
          initial_node: boolean;
          location_type: string;
          name: string;
          position_x: number;
          position_y: number;
          updated_at: string;
          world_id: string;
        };
        Insert: {
          adjacent_locations?: string[] | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          initial_node?: boolean;
          location_type: string;
          name: string;
          position_x?: number;
          position_y?: number;
          updated_at?: string;
          world_id: string;
        };
        Update: {
          adjacent_locations?: string[] | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          initial_node?: boolean;
          location_type?: string;
          name?: string;
          position_x?: number;
          position_y?: number;
          updated_at?: string;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'world_locations_world_id_fkey';
            columns: ['world_id'];
            isOneToOne: false;
            referencedRelation: 'worlds';
            referencedColumns: ['id'];
          },
        ];
      };
      world_node_status: {
        Row: {
          character_id: string;
          completed_at: string | null;
          created_at: string;
          id: string;
          location_id: string;
          status: string;
          unlocked_at: string | null;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          location_id: string;
          status?: string;
          unlocked_at?: string | null;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          location_id?: string;
          status?: string;
          unlocked_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'world_node_status_character_id_fkey';
            columns: ['character_id'];
            isOneToOne: false;
            referencedRelation: 'character_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'world_node_status_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'world_locations';
            referencedColumns: ['id'];
          },
        ];
      };
      worlds: {
        Row: {
          classroom_id: string;
          created_at: string;
          data: Json;
          description: string | null;
          id: string;
          name: string;
          status_text: string | null;
          updated_at: string;
        };
        Insert: {
          classroom_id: string;
          created_at?: string;
          data?: Json;
          description?: string | null;
          id?: string;
          name: string;
          status_text?: string | null;
          updated_at?: string;
        };
        Update: {
          classroom_id?: string;
          created_at?: string;
          data?: Json;
          description?: string | null;
          id?: string;
          name?: string;
          status_text?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'worlds_classroom_id_fkey';
            columns: ['classroom_id'];
            isOneToOne: false;
            referencedRelation: 'classrooms';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      allocate_stats: {
        Args: {
          p_character_id: string;
          p_stat_changes: Json;
        };
        Returns: boolean;
      };
      can_view_project: {
        Args: {
          project_id: string;
        };
        Returns: boolean;
      };
      can_view_user_progress: {
        Args: {
          progress_user_id: string;
        };
        Returns: boolean;
      };
      complete_quest: {
        Args: {
          p_character_id: string;
          p_quest_id: string;
          p_project_id: string;
        };
        Returns: boolean;
      };
      create_character_profile: {
        Args: {
          user_id: string;
          character_class?: string;
        };
        Returns: string;
      };
      create_classroom: {
        Args: {
          classroom_name: string;
          classroom_description: string;
          owner_id: string;
        };
        Returns: string;
      };
      create_lesson_from_templates: {
        Args: {
          lesson_title: string;
          lesson_description: string;
          content_layer_id: number;
          difficulty: number;
          article_content: string;
          has_rich_content: boolean;
          template_ids: number[];
          creator_id: string;
        };
        Returns: string;
      };
      get_available_quests: {
        Args: {
          p_character_id: string;
        };
        Returns: {
          quest_id: string;
          title: string;
          description: string;
          quest_type: string;
          location_id: string;
          location_name: string;
          genre_id: number;
          genre_name: string;
          difficulty: number;
          is_daily_quest: boolean;
          prompt: string;
          word_count_target: number;
          available_from: string;
          available_until: string;
          status: string;
          rewards: Json;
        }[];
      };
      get_teacher_classroom_ids: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      get_user_progress_stats: {
        Args: {
          user_id: string;
        };
        Returns: {
          total_exercises: number;
          completed_exercises: number;
          average_score: number;
          total_lessons: number;
          lessons_with_articles_read: number;
          lessons_completed: number;
          content_layer_id: number;
          content_layer_name: string;
          layer_exercises: number;
          layer_completed: number;
          layer_average_score: number;
          layer_lessons: number;
          layer_lessons_read: number;
        }[];
      };
      get_user_writing_activity: {
        Args: {
          user_id: string;
          limit_count?: number;
        };
        Returns: {
          activity_type: string;
          activity_date: string;
          project_id: string;
          project_title: string;
          genre_name: string;
          words_count: number;
          exercise_id: string;
          exercise_title: string;
          lesson_id: string;
          lesson_title: string;
          score: number;
        }[];
      };
      get_writing_prompts: {
        Args: {
          genre_id?: number;
          count?: number;
        };
        Returns: {
          prompt_text: string;
          genre_name: string;
          word_count_suggestion: number;
        }[];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_classroom_member: {
        Args: {
          classroom_id: string;
        };
        Returns: boolean;
      };
      is_classroom_teacher: {
        Args: {
          classroom_id: string;
        };
        Returns: boolean;
      };
      join_classroom_by_code: {
        Args: {
          join_code: string;
          user_id: string;
        };
        Returns: {
          success: boolean;
          message: string;
          classroom_id: string;
          classroom_name: string;
        }[];
      };
      mark_lesson_article_read: {
        Args: {
          lesson_id: string;
          user_id: string;
          mark_as_completed?: boolean;
        };
        Returns: boolean;
      };
      process_node_completion: {
        Args: {
          p_character_id: string;
          p_node_id: string;
        };
        Returns: boolean;
      };
      retry_node_rewards: {
        Args: {
          p_character_id: string;
          p_node_id: string;
        };
        Returns: boolean;
      };
      retry_quest_rewards: {
        Args: {
          p_character_id: string;
          p_quest_id: string;
        };
        Returns: boolean;
      };
      update_character_stat: {
        Args: {
          p_character_id: string;
          p_stat_name: string;
          p_value: number;
        };
        Returns: boolean;
      };
    };
    Enums: {
      reward_type: 'experience' | 'currency' | 'stat' | 'item';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
