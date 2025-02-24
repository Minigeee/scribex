export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: number
          name: string
          points: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          name: string
          points?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      classroom_members: {
        Row: {
          classroom_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          classroom_id: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          classroom_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_members_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          join_code: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          join_code: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          join_code?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_layers: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          order_index: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          content: string
          created_at: string
          description: string | null
          exercise_type: string
          id: string
          lesson_id: string | null
          order_index: number | null
          points: number | null
          solution: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          exercise_type: string
          id?: string
          lesson_id?: string | null
          order_index?: number | null
          points?: number | null
          solution?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          exercise_type?: string
          id?: string
          lesson_id?: string | null
          order_index?: number | null
          points?: number | null
          solution?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content_layer_id: number | null
          created_at: string
          description: string | null
          difficulty: number
          id: string
          order_index: number | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content_layer_id?: number | null
          created_at?: string
          description?: string | null
          difficulty: number
          id?: string
          order_index?: number | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content_layer_id?: number | null
          created_at?: string
          description?: string | null
          difficulty?: number
          id?: string
          order_index?: number | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_content_layer_id_fkey"
            columns: ["content_layer_id"]
            isOneToOne: false
            referencedRelation: "content_layers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_type: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          user_type: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_type?: string
          username?: string
        }
        Relationships: []
      }
      project_revisions: {
        Row: {
          ai_feedback: string | null
          content: string
          created_at: string
          id: string
          project_id: string | null
        }
        Insert: {
          ai_feedback?: string | null
          content: string
          created_at?: string
          id?: string
          project_id?: string | null
        }
        Update: {
          ai_feedback?: string | null
          content?: string
          created_at?: string
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_revisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          classroom_id: string | null
          content: string | null
          created_at: string
          description: string | null
          genre_id: number | null
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          classroom_id?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          genre_id?: number | null
          id?: string
          status: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          classroom_id?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          genre_id?: number | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: number
          earned_at: string
          user_id: string
        }
        Insert: {
          achievement_id: number
          earned_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: number
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          attempts: number | null
          completed: boolean | null
          exercise_id: string | null
          id: string
          last_attempt_at: string | null
          lesson_id: string | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          completed?: boolean | null
          exercise_id?: string | null
          id?: string
          last_attempt_at?: string | null
          lesson_id?: string | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          completed?: boolean | null
          exercise_id?: string | null
          id?: string
          last_attempt_at?: string | null
          lesson_id?: string | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_project: {
        Args: {
          project_id: string
        }
        Returns: boolean
      }
      can_view_user_progress: {
        Args: {
          progress_user_id: string
        }
        Returns: boolean
      }
      create_classroom: {
        Args: {
          classroom_name: string
          classroom_description: string
          owner_id: string
        }
        Returns: string
      }
      get_teacher_classroom_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_progress_stats: {
        Args: {
          user_id: string
        }
        Returns: {
          total_exercises: number
          completed_exercises: number
          average_score: number
          content_layer_id: number
          content_layer_name: string
          layer_exercises: number
          layer_completed: number
          layer_average_score: number
        }[]
      }
      get_user_writing_activity: {
        Args: {
          user_id: string
          limit_count?: number
        }
        Returns: {
          activity_type: string
          activity_date: string
          project_id: string
          project_title: string
          genre_name: string
          words_count: number
          exercise_id: string
          exercise_title: string
          lesson_title: string
          score: number
        }[]
      }
      get_writing_prompts: {
        Args: {
          genre_id?: number
          count?: number
        }
        Returns: {
          prompt_text: string
          genre_name: string
          word_count_suggestion: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_classroom_member: {
        Args: {
          classroom_id: string
        }
        Returns: boolean
      }
      is_classroom_teacher: {
        Args: {
          classroom_id: string
        }
        Returns: boolean
      }
      join_classroom_by_code: {
        Args: {
          join_code: string
          user_id: string
        }
        Returns: {
          success: boolean
          message: string
          classroom_id: string
          classroom_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

