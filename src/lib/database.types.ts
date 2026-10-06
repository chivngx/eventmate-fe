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
          position_id: string | null
          status: string | null
          student_id: string
          student_note: string | null
        }
        Insert: {
          applied_at?: string | null
          attendance_status?: string | null
          event_id: string
          id?: string
          position_id?: string | null
          status?: string | null
          student_id: string
          student_note?: string | null
        }
        Update: {
          applied_at?: string | null
          attendance_status?: string | null
          event_id?: string
          id?: string
          position_id?: string | null
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
            foreignKeyName: "applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "event_positions"
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
      event_positions: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          salary_amount: number
          salary_type: string
          slots_needed: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          salary_amount?: number
          salary_type?: string
          slots_needed?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          salary_amount?: number
          salary_type?: string
          slots_needed?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_positions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          application_deadline: string | null
          benefits: string | null
          bumped_at: string | null
          category: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string | null
          id: string
          is_urgent: boolean | null
          location: string | null
          organizer_id: string
          payment_method: string | null
          plan_tier: string | null
          position_type: string | null
          qr_checkin_code: string | null
          salary_amount: number | null
          salary_type: string | null
          slots_needed: number | null
          slug: string | null
          start_time: string | null
          status: string | null
          title: string
          ward_id: number | null
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string | null
          bumped_at?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          is_urgent?: boolean | null
          location?: string | null
          organizer_id: string
          payment_method?: string | null
          plan_tier?: string | null
          position_type?: string | null
          qr_checkin_code?: string | null
          salary_amount?: number | null
          salary_type?: string | null
          slots_needed?: number | null
          slug?: string | null
          start_time?: string | null
          status?: string | null
          title: string
          ward_id?: number | null
        }
        Update: {
          application_deadline?: string | null
          benefits?: string | null
          bumped_at?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          is_urgent?: boolean | null
          location?: string | null
          organizer_id?: string
          payment_method?: string | null
          plan_tier?: string | null
          position_type?: string | null
          qr_checkin_code?: string | null
          salary_amount?: number | null
          salary_type?: string | null
          slots_needed?: number | null
          slug?: string | null
          start_time?: string | null
          status?: string | null
          title?: string
          ward_id?: number | null
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
      feedbacks: {
        Row: {
          admin_note: string | null
          category: string
          content: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          rating: number | null
          role: string | null
          status: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          category?: string
          content: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          rating?: number | null
          role?: string | null
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          category?: string
          content?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          rating?: number | null
          role?: string | null
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_user_id_fkey"
            columns: ["user_id"]
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
          is_read: boolean | null
          sender_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
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
          birth_year: number | null
          created_at: string
          cv_completion_percent: number | null
          email: string
          experiences: Json | null
          full_name: string
          gender: string | null
          id: string
          id_card_hash: string | null
          is_premium: boolean
          is_verified: boolean | null
          map_embed_url: string | null
          mst: string | null
          phone: string | null
          premium_until: string | null
          reliability_score: number | null
          role: string
          single_event_credits: number
          skills: string | null
          slug: string | null
          social_link: string | null
          university: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          cv_completion_percent?: number | null
          email: string
          experiences?: Json | null
          full_name: string
          gender?: string | null
          id: string
          id_card_hash?: string | null
          is_premium?: boolean
          is_verified?: boolean | null
          map_embed_url?: string | null
          mst?: string | null
          phone?: string | null
          premium_until?: string | null
          reliability_score?: number | null
          role: string
          single_event_credits?: number
          skills?: string | null
          slug?: string | null
          social_link?: string | null
          university?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          cv_completion_percent?: number | null
          email?: string
          experiences?: Json | null
          full_name?: string
          gender?: string | null
          id?: string
          id_card_hash?: string | null
          is_premium?: boolean
          is_verified?: boolean | null
          map_embed_url?: string | null
          mst?: string | null
          phone?: string | null
          premium_until?: string | null
          reliability_score?: number | null
          role?: string
          single_event_credits?: number
          skills?: string | null
          slug?: string | null
          social_link?: string | null
          university?: string | null
          website?: string | null
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
      transactions: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          id: string
          order_code: number | null
          payment_link_id: string | null
          payment_method: string
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string
          id?: string
          order_code?: number | null
          payment_link_id?: string | null
          payment_method: string
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          id?: string
          order_code?: number | null
          payment_link_id?: string | null
          payment_method?: string
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
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
      activate_premium_or_credits: {
        Args: {
          p_amount: number
          p_billing_cycle: string
          p_payment_method: string
          p_plan_id: string
        }
        Returns: Json
      }
      complete_checkout_transaction: {
        Args: {
          p_amount: number
          p_billing_cycle: string
          p_payment_method: string
          p_plan_id: string
        }
        Returns: Json
      }
      confirm_payos_payment: { Args: { p_order_code: number }; Returns: Json }
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
