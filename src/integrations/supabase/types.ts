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
      assignments: {
        Row: {
          assigned_by: string | null
          assignee_id: string | null
          created_at: string
          id: string
          submission_id: string
        }
        Insert: {
          assigned_by?: string | null
          assignee_id?: string | null
          created_at?: string
          id?: string
          submission_id: string
        }
        Update: {
          assigned_by?: string | null
          assignee_id?: string | null
          created_at?: string
          id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          size_bytes: number
          storage_path: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          size_bytes: number
          storage_path: string
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      submission_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["submission_status"] | null
          id: string
          note: string | null
          submission_id: string
          to_status: Database["public"]["Enums"]["submission_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["submission_status"] | null
          id?: string
          note?: string | null
          submission_id: string
          to_status: Database["public"]["Enums"]["submission_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["submission_status"] | null
          id?: string
          note?: string | null
          submission_id?: string
          to_status?: Database["public"]["Enums"]["submission_status"]
        }
        Relationships: [
          {
            foreignKeyName: "submission_history_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_public: boolean
          submission_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_public?: boolean
          submission_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_public?: boolean
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_notes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_public: {
        Row: {
          category: Database["public"]["Enums"]["submission_category"]
          id: string
          is_demo: boolean
          is_published: boolean
          locality: string
          public_id: string
          public_summary: string
          public_title: string
          status: Database["public"]["Enums"]["submission_status"]
          submission_id: string
          submitted_at: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at: string
          ward: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["submission_category"]
          id?: string
          is_demo?: boolean
          is_published?: boolean
          locality: string
          public_id: string
          public_summary: string
          public_title: string
          status?: Database["public"]["Enums"]["submission_status"]
          submission_id: string
          submitted_at?: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          ward?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["submission_category"]
          id?: string
          is_demo?: boolean
          is_published?: boolean
          locality?: string
          public_id?: string
          public_summary?: string
          public_title?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submission_id?: string
          submitted_at?: string
          type?: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_public_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_rate_limits: {
        Row: {
          created_at: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          ip_hash: string
        }
        Update: {
          created_at?: string
          ip_hash?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["submission_category"]
          consent: boolean
          created_at: string
          description: string
          email: string | null
          id: string
          is_demo: boolean
          landmark: string | null
          locality: string
          moderation: Database["public"]["Enums"]["moderation_status"]
          name: string | null
          phone: string | null
          preferred_contact: Database["public"]["Enums"]["contact_method"]
          public_id: string
          seq: number
          status: Database["public"]["Enums"]["submission_status"]
          subject: string
          tracking_token: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at: string
          ward: string | null
          year: number
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["submission_category"]
          consent?: boolean
          created_at?: string
          description: string
          email?: string | null
          id?: string
          is_demo?: boolean
          landmark?: string | null
          locality: string
          moderation?: Database["public"]["Enums"]["moderation_status"]
          name?: string | null
          phone?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          public_id: string
          seq: number
          status?: Database["public"]["Enums"]["submission_status"]
          subject: string
          tracking_token?: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          ward?: string | null
          year: number
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["submission_category"]
          consent?: boolean
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          is_demo?: boolean
          landmark?: string | null
          locality?: string
          moderation?: Database["public"]["Enums"]["moderation_status"]
          name?: string | null
          phone?: string | null
          preferred_contact?: Database["public"]["Enums"]["contact_method"]
          public_id?: string
          seq?: number
          status?: Database["public"]["Enums"]["submission_status"]
          subject?: string
          tracking_token?: string
          type?: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          ward?: string | null
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      yearly_counters: {
        Row: {
          last_seq: number
          year: number
        }
        Insert: {
          last_seq?: number
          year: number
        }
        Update: {
          last_seq?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_team_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "volunteer"
      contact_method: "none" | "phone" | "email" | "whatsapp"
      moderation_status: "pending" | "approved" | "rejected"
      submission_category:
        | "roads"
        | "streetlights"
        | "garbage"
        | "water"
        | "sewerage"
        | "traffic"
        | "parks"
        | "education"
        | "senior_citizens"
        | "accessibility"
        | "environment"
        | "public_safety"
        | "other"
      submission_status:
        | "received"
        | "under_review"
        | "referred"
        | "awaiting_update"
        | "resolved"
        | "closed"
      submission_type: "issue" | "question" | "idea" | "view"
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
    Enums: {
      app_role: ["admin", "moderator", "volunteer"],
      contact_method: ["none", "phone", "email", "whatsapp"],
      moderation_status: ["pending", "approved", "rejected"],
      submission_category: [
        "roads",
        "streetlights",
        "garbage",
        "water",
        "sewerage",
        "traffic",
        "parks",
        "education",
        "senior_citizens",
        "accessibility",
        "environment",
        "public_safety",
        "other",
      ],
      submission_status: [
        "received",
        "under_review",
        "referred",
        "awaiting_update",
        "resolved",
        "closed",
      ],
      submission_type: ["issue", "question", "idea", "view"],
    },
  },
} as const
