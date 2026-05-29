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
      comm_participants: {
        Row: {
          created_at: string
          display_name: string
          label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          label: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      comm_topics: {
        Row: {
          awaiting_label: string | null
          category: string
          created_at: string
          created_by: string | null
          created_label: string
          description: string
          id: string
          last_activity_at: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          awaiting_label?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          created_label?: string
          description?: string
          id?: string
          last_activity_at?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          awaiting_label?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          created_label?: string
          description?: string
          id?: string
          last_activity_at?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comm_messages: {
        Row: {
          author_label: string
          author_user_id: string | null
          body: string
          created_at: string
          format: string
          id: string
          replied: boolean
          replied_at: string | null
          replied_by_label: string | null
          reply_to_id: string | null
          requires_reply: boolean
          topic_id: string
        }
        Insert: {
          author_label?: string
          author_user_id?: string | null
          body?: string
          created_at?: string
          format?: string
          id?: string
          replied?: boolean
          replied_at?: string | null
          replied_by_label?: string | null
          reply_to_id?: string | null
          requires_reply?: boolean
          topic_id: string
        }
        Update: {
          author_label?: string
          author_user_id?: string | null
          body?: string
          created_at?: string
          format?: string
          id?: string
          replied?: boolean
          replied_at?: string | null
          replied_by_label?: string | null
          reply_to_id?: string | null
          requires_reply?: boolean
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comm_messages_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "comm_topics"
            referencedColumns: ["id"]
          }
        ]
      }
      comm_attachments: {
        Row: {
          created_at: string
          file_name: string | null
          file_path: string | null
          id: string
          kind: string
          message_id: string | null
          mime_type: string
          note: string | null
          size_bytes: number
          title: string | null
          topic_id: string
          uploaded_by: string | null
          uploaded_label: string
          url: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          kind?: string
          message_id?: string | null
          mime_type?: string
          note?: string | null
          size_bytes?: number
          title?: string | null
          topic_id: string
          uploaded_by?: string | null
          uploaded_label?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          kind?: string
          message_id?: string | null
          mime_type?: string
          note?: string | null
          size_bytes?: number
          title?: string | null
          topic_id?: string
          uploaded_by?: string | null
          uploaded_label?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comm_attachments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "comm_topics"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_discounts: {
        Row: {
          created_at: string
          customer_user_id: string
          discount_type: string
          id: string
          percent: number
          target_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_user_id: string
          discount_type: string
          id?: string
          percent?: number
          target_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_user_id?: string
          discount_type?: string
          id?: string
          percent?: number
          target_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_services: {
        Row: {
          admin_note: string | null
          created_at: string
          customer_user_id: string
          ended_at: string | null
          id: string
          monthly_price: number | null
          plan: string | null
          service_type: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          customer_user_id: string
          ended_at?: string | null
          id?: string
          monthly_price?: number | null
          plan?: string | null
          service_type: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          customer_user_id?: string
          ended_at?: string | null
          id?: string
          monthly_price?: number | null
          plan?: string | null
          service_type?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      feed_config: {
        Row: {
          created_at: string
          feed_url: string
          id: string
          last_sync: string | null
          mapping_rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          feed_url?: string
          id?: string
          last_sync?: string | null
          mapping_rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          feed_url?: string
          id?: string
          last_sync?: string | null
          mapping_rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      feed_sync_logs: {
        Row: {
          id: string
          items_processed_count: number
          message: string | null
          status: string
          timestamp: string
        }
        Insert: {
          id?: string
          items_processed_count?: number
          message?: string | null
          status: string
          timestamp?: string
        }
        Update: {
          id?: string
          items_processed_count?: number
          message?: string | null
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          admin_manual_override: boolean
          admin_notes: string | null
          category_text: string | null
          content_hash: string | null
          created_at: string
          custom_margin: number | null
          description_is: string | null
          ean: string | null
          id: string
          image_url: string | null
          image_urls: string[]
          is_featured: boolean
          last_synced_at: string | null
          manual_price_isk: number | null
          manufacturer: string | null
          original_description_cz: string | null
          original_name_cz: string | null
          product_name_is: string | null
          sku: string
          stock_quantity: number
          supplier_price: number | null
          updated_at: string
        }
        Insert: {
          admin_manual_override?: boolean
          admin_notes?: string | null
          category_text?: string | null
          content_hash?: string | null
          created_at?: string
          custom_margin?: number | null
          description_is?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          is_featured?: boolean
          last_synced_at?: string | null
          manual_price_isk?: number | null
          manufacturer?: string | null
          original_description_cz?: string | null
          original_name_cz?: string | null
          product_name_is?: string | null
          sku: string
          stock_quantity?: number
          supplier_price?: number | null
          updated_at?: string
        }
        Update: {
          admin_manual_override?: boolean
          admin_notes?: string | null
          category_text?: string | null
          content_hash?: string | null
          created_at?: string
          custom_margin?: number | null
          description_is?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          is_featured?: boolean
          last_synced_at?: string | null
          manual_price_isk?: number | null
          manufacturer?: string | null
          original_description_cz?: string | null
          original_name_cz?: string | null
          product_name_is?: string | null
          sku?: string
          stock_quantity?: number
          supplier_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          base_discount: number
          company_name: string
          created_at: string
          ico: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_discount?: number
          company_name?: string
          created_at?: string
          ico?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_discount?: number
          company_name?: string
          created_at?: string
          ico?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      translation_cache: {
        Row: {
          created_at: string
          id: string
          source_hash: string
          source_lang: string
          source_text: string
          target_lang: string
          translated_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_hash: string
          source_lang?: string
          source_text: string
          target_lang?: string
          translated_text: string
        }
        Update: {
          created_at?: string
          id?: string
          source_hash?: string
          source_lang?: string
          source_text?: string
          target_lang?: string
          translated_text?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
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
      comm_is_participant: {
        Args: Record<string, never>
        Returns: boolean
      }
      comm_my_label: {
        Args: Record<string, never>
        Returns: string
      }
      comm_add_participant_by_email: {
        Args: {
          p_email: string
          p_label: string
          p_display_name?: string
        }
        Returns: string
      }
      comm_remove_participant: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      comm_list_participants: {
        Args: Record<string, never>
        Returns: {
          user_id: string
          label: string
          display_name: string
          email: string
          created_at: string
        }[]
      }
      comm_resolve_question: {
        Args: {
          p_message: string
          p_resolved?: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "lead" | "b2b_approved"
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
      app_role: ["admin", "customer", "lead", "b2b_approved"],
    },
  },
} as const
