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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          attendance_status: string | null
          event_id: string
          id: string
          status: string | null
          student_id: string
          student_note: string | null
        }
        Insert: {
          applied_at?: string | null
          attendance_status?: string | null
          event_id: string
          id?: string
          status?: string | null
          student_id: string
          student_note?: string | null
        }
        Update: {
          applied_at?: string | null
          attendance_status?: string | null
          event_id?: string
          id?: string
          status?: string | null
          student_id?: string
          student_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          organizer_id: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          organizer_id?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          organizer_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      danang_wards: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      event_bookmarks: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_bookmarks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_bookmarks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: number
          name: string
          slug: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: number
          name: string
          slug?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: number
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          application_deadline: string | null
          benefits: string | null
          category: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string | null
          id: string
          location: string | null
          organizer_id: string
          payment_method: string | null
          position_type: string | null
          salary_amount: number | null
          salary_type: string | null
          slots_needed: number | null
          slug: string | null
          start_time: string | null
          status: string | null
          title: string
          ward_id: number | null
          zalo_group_link: string | null
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          organizer_id: string
          payment_method?: string | null
          position_type?: string | null
          salary_amount?: number | null
          salary_type?: string | null
          slots_needed?: number | null
          slug?: string | null
          start_time?: string | null
          status?: string | null
          title: string
          ward_id?: number | null
          zalo_group_link?: string | null
        }
        Update: {
          application_deadline?: string | null
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          organizer_id?: string
          payment_method?: string | null
          position_type?: string | null
          salary_amount?: number | null
          salary_type?: string | null
          slots_needed?: number | null
          slug?: string | null
          start_time?: string | null
          status?: string | null
          title?: string
          ward_id?: number | null
          zalo_group_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "danang_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          created_at: string
          event_id: string
          id: string
          meeting_link: string | null
          organizer_id: string
          scheduled_at: string
          status: string
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          meeting_link?: string | null
          organizer_id: string
          scheduled_at: string
          status?: string
          student_id: string
          title: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          meeting_link?: string | null
          organizer_id?: string
          scheduled_at?: string
          status?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_positions: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string | null
          id: string
          sender_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          company_images: string | null
          created_at: string
          cv_completion_percent: number | null
          email: string
          full_name: string
          height: number | null
          id: string
          is_premium: boolean
          mst: string | null
          phone: string | null
          premium_until: string | null
          reliability_score: number | null
          role: string
          scale: string | null
          shirt_size: string | null
          skills: string | null
          slug: string | null
          university: string | null
          website: string | null
          zalo_phone: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_images?: string | null
          created_at?: string
          cv_completion_percent?: number | null
          email: string
          full_name: string
          height?: number | null
          id: string
          is_premium?: boolean
          mst?: string | null
          phone?: string | null
          premium_until?: string | null
          reliability_score?: number | null
          role: string
          scale?: string | null
          shirt_size?: string | null
          skills?: string | null
          slug?: string | null
          university?: string | null
          website?: string | null
          zalo_phone?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_images?: string | null
          created_at?: string
          cv_completion_percent?: number | null
          email?: string
          full_name?: string
          height?: number | null
          id?: string
          is_premium?: boolean
          mst?: string | null
          phone?: string | null
          premium_until?: string | null
          reliability_score?: number | null
          role?: string
          scale?: string | null
          shirt_size?: string | null
          skills?: string | null
          slug?: string | null
          university?: string | null
          website?: string | null
          zalo_phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          event_id: string | null
          id: string
          rating: number | null
          reviewee_id: string | null
          reviewer_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          rating?: number | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          rating?: number | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
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
      slugify: { Args: { t: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
