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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          payment_status: string | null
          session_date: string
          session_time: string
          status: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          payment_status?: string | null
          session_date: string
          session_time: string
          status?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          payment_status?: string | null
          session_date?: string
          session_time?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          message_type: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          message_type?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      code_snippets: {
        Row: {
          code: string
          created_at: string | null
          id: string
          language: string | null
          output: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          language?: string | null
          output?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          language?: string | null
          output?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_snippets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string
          id: string
          image_url: string | null
          instructor: string
          price: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: string
          id?: string
          image_url?: string | null
          instructor: string
          price: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string
          id?: string
          image_url?: string | null
          instructor?: string
          price?: number
          title?: string
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          chat_enabled: boolean | null
          course_id: string | null
          created_at: string | null
          current_participants: number | null
          description: string | null
          id: string
          instructor_id: string
          max_participants: number | null
          mute_all: boolean | null
          recording_url: string | null
          scheduled_end: string
          scheduled_start: string
          session_link: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          chat_enabled?: boolean | null
          course_id?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          id?: string
          instructor_id: string
          max_participants?: number | null
          mute_all?: boolean | null
          recording_url?: string | null
          scheduled_end: string
          scheduled_start: string
          session_link?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          chat_enabled?: boolean | null
          course_id?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          id?: string
          instructor_id?: string
          max_participants?: number | null
          mute_all?: boolean | null
          recording_url?: string | null
          scheduled_end?: string
          scheduled_start?: string
          session_link?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          content: string | null
          id: string
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          id?: string
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          id?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          audio_enabled: boolean | null
          id: string
          joined_at: string | null
          left_at: string | null
          session_id: string
          status: string | null
          user_id: string
          video_enabled: boolean | null
        }
        Insert: {
          audio_enabled?: boolean | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          session_id: string
          status?: string | null
          user_id: string
          video_enabled?: boolean | null
        }
        Update: {
          audio_enabled?: boolean | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          session_id?: string
          status?: string | null
          user_id?: string
          video_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recordings: {
        Row: {
          available_until: string | null
          created_at: string | null
          duration: number | null
          file_size: number | null
          id: string
          recording_url: string
          session_id: string
        }
        Insert: {
          available_until?: string | null
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          recording_url: string
          session_id: string
        }
        Update: {
          available_until?: string | null
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          recording_url?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          default_audio_enabled: boolean | null
          default_video_enabled: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          default_audio_enabled?: boolean | null
          default_video_enabled?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          default_audio_enabled?: boolean | null
          default_video_enabled?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "student"
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
      app_role: ["admin", "instructor", "student"],
    },
  },
} as const
