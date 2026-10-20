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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      escrow_orders: {
        Row: {
          amount_pi: number
          buyer_uid: string | null
          buyer_username: string | null
          completed_at: string | null
          created_at: string
          id: string
          listing_id: string | null
          order_code: string
          pi_payment_id: string | null
          release_at: string | null
          seller_username: string | null
          status: Database["public"]["Enums"]["escrow_status"]
          submitted_at: string | null
          txid: string | null
          updated_at: string
        }
        Insert: {
          amount_pi: number
          buyer_uid?: string | null
          buyer_username?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          order_code: string
          pi_payment_id?: string | null
          release_at?: string | null
          seller_username?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          submitted_at?: string | null
          txid?: string | null
          updated_at?: string
        }
        Update: {
          amount_pi?: number
          buyer_uid?: string | null
          buyer_username?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          order_code?: string
          pi_payment_id?: string | null
          release_at?: string | null
          seller_username?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          submitted_at?: string | null
          txid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          active: boolean
          badge: string
          category: string
          created_at: string
          delivery: string | null
          id: string
          image_url: string | null
          price_pi: number
          seller_username: string
          stock: number | null
          title: string
        }
        Insert: {
          active?: boolean
          badge?: string
          category: string
          created_at?: string
          delivery?: string | null
          id?: string
          image_url?: string | null
          price_pi: number
          seller_username: string
          stock?: number | null
          title: string
        }
        Update: {
          active?: boolean
          badge?: string
          category?: string
          created_at?: string
          delivery?: string | null
          id?: string
          image_url?: string | null
          price_pi?: number
          seller_username?: string
          stock?: number | null
          title?: string
        }
        Relationships: []
      }
      scam_reports: {
        Row: {
          created_at: string
          description: string
          evidence_urls: string[]
          id: string
          moderator_note: string | null
          order_id: string | null
          reporter_username: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          description: string
          evidence_urls?: string[]
          id?: string
          moderator_note?: string | null
          order_id?: string | null
          reporter_username?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          description?: string
          evidence_urls?: string[]
          id?: string
          moderator_note?: string | null
          order_id?: string | null
          reporter_username?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "scam_reports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "escrow_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      escrow_status:
        | "created"
        | "deposited"
        | "in_progress"
        | "submitted"
        | "completed"
        | "disputed"
        | "refunded"
      report_status: "open" | "approved_release" | "refunded" | "dismissed"
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
      escrow_status: [
        "created",
        "deposited",
        "in_progress",
        "submitted",
        "completed",
        "disputed",
        "refunded",
      ],
      report_status: ["open", "approved_release", "refunded", "dismissed"],
    },
  },
} as const
