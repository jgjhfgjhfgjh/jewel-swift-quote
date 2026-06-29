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
            foreignKeyName: "comm_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "comm_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comm_attachments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "comm_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      comm_messages: {
        Row: {
          author_label: string
          author_name: string | null
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
          author_name?: string | null
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
          author_name?: string | null
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
            foreignKeyName: "comm_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "comm_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comm_messages_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "comm_topics"
            referencedColumns: ["id"]
          },
        ]
      }
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
      comm_tasks: {
        Row: {
          assignee_label: string | null
          created_at: string
          created_by: string | null
          created_label: string
          done: boolean
          done_at: string | null
          done_by_label: string | null
          due_date: string | null
          id: string
          sort_order: number
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          assignee_label?: string | null
          created_at?: string
          created_by?: string | null
          created_label?: string
          done?: boolean
          done_at?: string | null
          done_by_label?: string | null
          due_date?: string | null
          id?: string
          sort_order?: number
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          assignee_label?: string | null
          created_at?: string
          created_by?: string | null
          created_label?: string
          done?: boolean
          done_at?: string | null
          done_by_label?: string | null
          due_date?: string | null
          id?: string
          sort_order?: number
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comm_tasks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "comm_topics"
            referencedColumns: ["id"]
          },
        ]
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
      content_audit: {
        Row: {
          copy_status: string
          is_live: boolean
          node_id: string
          notes: string | null
          reviewer: string | null
          structure_checks: Json
          structure_status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          copy_status?: string
          is_live?: boolean
          node_id: string
          notes?: string | null
          reviewer?: string | null
          structure_checks?: Json
          structure_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          copy_status?: string
          is_live?: boolean
          node_id?: string
          notes?: string | null
          reviewer?: string | null
          structure_checks?: Json
          structure_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      customer_discounts: {
        Row: {
          created_at: string | null
          customer_user_id: string | null
          discount_type: string | null
          id: string
          percent: number | null
          target_key: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_user_id?: string | null
          discount_type?: string | null
          id?: string
          percent?: number | null
          target_key?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_user_id?: string | null
          discount_type?: string | null
          id?: string
          percent?: number | null
          target_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_services: {
        Row: {
          created_at: string
          customer_user_id: string
          ended_at: string | null
          id: string
          monthly_price: number | null
          plan: string | null
          service_type: string
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_user_id: string
          ended_at?: string | null
          id?: string
          monthly_price?: number | null
          plan?: string | null
          service_type: string
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_user_id?: string
          ended_at?: string | null
          id?: string
          monthly_price?: number | null
          plan?: string | null
          service_type?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      deal_products: {
        Row: {
          attr_material: string
          attr_movement: string
          attr_size: string
          available: number
          brand: string
          collection: string
          created_at: string
          deal_id: string
          ean: string
          gender: string
          id: string
          image_url: string | null
          item_status: string
          retail_price: number
          sku: string
          sort_order: number
          wholesale_tier1: number
          wholesale_tier2: number
          wholesale_tier3: number
        }
        Insert: {
          attr_material?: string
          attr_movement?: string
          attr_size?: string
          available?: number
          brand?: string
          collection?: string
          created_at?: string
          deal_id: string
          ean?: string
          gender?: string
          id?: string
          image_url?: string | null
          item_status?: string
          retail_price?: number
          sku?: string
          sort_order?: number
          wholesale_tier1?: number
          wholesale_tier2?: number
          wholesale_tier3?: number
        }
        Update: {
          attr_material?: string
          attr_movement?: string
          attr_size?: string
          available?: number
          brand?: string
          collection?: string
          created_at?: string
          deal_id?: string
          ean?: string
          gender?: string
          id?: string
          image_url?: string | null
          item_status?: string
          retail_price?: number
          sku?: string
          sort_order?: number
          wholesale_tier1?: number
          wholesale_tier2?: number
          wholesale_tier3?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_products_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          brands: string[]
          category: string
          created_at: string
          created_by: string | null
          currency: string
          deadline: string
          delivery_weeks_max: number
          delivery_weeks_min: number
          deposit_percent: number
          description: string
          hero_image_url: string | null
          id: string
          payment_terms: string
          slug: string
          source_path: string | null
          starts_at: string
          status: string
          subtitle: string
          supplier: string
          tiers: Json
          title: string
          updated_at: string
        }
        Insert: {
          brands?: string[]
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deadline: string
          delivery_weeks_max?: number
          delivery_weeks_min?: number
          deposit_percent?: number
          description?: string
          hero_image_url?: string | null
          id?: string
          payment_terms?: string
          slug: string
          source_path?: string | null
          starts_at?: string
          status?: string
          subtitle?: string
          supplier?: string
          tiers?: Json
          title: string
          updated_at?: string
        }
        Update: {
          brands?: string[]
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deadline?: string
          delivery_weeks_max?: number
          delivery_weeks_min?: number
          deposit_percent?: number
          description?: string
          hero_image_url?: string | null
          id?: string
          payment_terms?: string
          slug?: string
          source_path?: string | null
          starts_at?: string
          status?: string
          subtitle?: string
          supplier?: string
          tiers?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dodavatele: {
        Row: {
          created_at: string | null
          feed_url: string
          id: string
          nazev: string
          posledni_sync: string | null
        }
        Insert: {
          created_at?: string | null
          feed_url: string
          id?: string
          nazev: string
          posledni_sync?: string | null
        }
        Update: {
          created_at?: string | null
          feed_url?: string
          id?: string
          nazev?: string
          posledni_sync?: string | null
        }
        Relationships: []
      }
      order_emails: {
        Row: {
          created_at: string
          error: string | null
          id: string
          kind: string
          order_id: string
          recipient: string
          status: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          order_id: string
          recipient?: string
          status?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          order_id?: string
          recipient?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_emails_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount_percent: number
          discount_source: string
          ean: string
          id: string
          line_total: number
          manufacturer: string
          name: string
          order_id: string
          produkt_id: string | null
          quantity: number
          sku: string
          supplier_product_id: string
          unit_price: number
          unit_purchase_price: number
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          discount_source?: string
          ean?: string
          id?: string
          line_total?: number
          manufacturer?: string
          name?: string
          order_id: string
          produkt_id?: string | null
          quantity: number
          sku?: string
          supplier_product_id?: string
          unit_price?: number
          unit_purchase_price?: number
        }
        Update: {
          created_at?: string
          discount_percent?: number
          discount_source?: string
          ean?: string
          id?: string
          line_total?: number
          manufacturer?: string
          name?: string
          order_id?: string
          produkt_id?: string | null
          quantity?: number
          sku?: string
          supplier_product_id?: string
          unit_price?: number
          unit_purchase_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_produkt_id_fkey"
            columns: ["produkt_id"]
            isOneToOne: false
            referencedRelation: "produkty"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string
          branding: string
          cancelled_at: string | null
          cod_amount: number | null
          created_at: string
          currency: string
          customer_note: string
          delivered_at: string | null
          external_ref: string | null
          forwarded_at: string | null
          id: string
          items_subtotal: number
          margin_total: number
          order_number: string
          order_type: string
          paid_at: string | null
          partner_user_id: string
          payment_mode: string
          purchase_subtotal: number
          ship_to_city: string
          ship_to_company: string
          ship_to_country: string
          ship_to_email: string
          ship_to_name: string
          ship_to_phone: string
          ship_to_street: string
          ship_to_zip: string
          shipped_at: string | null
          shipping_code: string
          shipping_method_id: string | null
          shipping_name: string
          shipping_price: number
          status: string
          submitted_at: string
          supplier_ref: string | null
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          vat_amount: number
          vat_mode: string
          vat_rate: number
        }
        Insert: {
          admin_note?: string
          branding?: string
          cancelled_at?: string | null
          cod_amount?: number | null
          created_at?: string
          currency?: string
          customer_note?: string
          delivered_at?: string | null
          external_ref?: string | null
          forwarded_at?: string | null
          id?: string
          items_subtotal?: number
          margin_total?: number
          order_number?: string
          order_type: string
          paid_at?: string | null
          partner_user_id: string
          payment_mode?: string
          purchase_subtotal?: number
          ship_to_city?: string
          ship_to_company?: string
          ship_to_country?: string
          ship_to_email?: string
          ship_to_name?: string
          ship_to_phone?: string
          ship_to_street?: string
          ship_to_zip?: string
          shipped_at?: string | null
          shipping_code?: string
          shipping_method_id?: string | null
          shipping_name?: string
          shipping_price?: number
          status?: string
          submitted_at?: string
          supplier_ref?: string | null
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          vat_amount?: number
          vat_mode?: string
          vat_rate?: number
        }
        Update: {
          admin_note?: string
          branding?: string
          cancelled_at?: string | null
          cod_amount?: number | null
          created_at?: string
          currency?: string
          customer_note?: string
          delivered_at?: string | null
          external_ref?: string | null
          forwarded_at?: string | null
          id?: string
          items_subtotal?: number
          margin_total?: number
          order_number?: string
          order_type?: string
          paid_at?: string | null
          partner_user_id?: string
          payment_mode?: string
          purchase_subtotal?: number
          ship_to_city?: string
          ship_to_company?: string
          ship_to_country?: string
          ship_to_email?: string
          ship_to_name?: string
          ship_to_phone?: string
          ship_to_street?: string
          ship_to_zip?: string
          shipped_at?: string | null
          shipping_code?: string
          shipping_method_id?: string | null
          shipping_name?: string
          shipping_price?: number
          status?: string
          submitted_at?: string
          supplier_ref?: string | null
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          vat_amount?: number
          vat_mode?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      preklad_slovnik: {
        Row: {
          id: string
          jazyk: string
          original_text: string
          preklad: string
        }
        Insert: {
          id?: string
          jazyk: string
          original_text: string
          preklad: string
        }
        Update: {
          id?: string
          jazyk?: string
          original_text?: string
          preklad?: string
        }
        Relationships: []
      }
      produkty: {
        Row: {
          category_text: string | null
          content_hash: string | null
          created_at: string | null
          daystodelivery: string | null
          ean: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_new: boolean | null
          long_description: string | null
          manufacturer: string | null
          package_weight: number | null
          preklad_en_hotovy: boolean | null
          preklad_is_hotovy: boolean | null
          product_id: string
          product_name: string | null
          retail_price: number | null
          sale: boolean | null
          short_description: string | null
          sku: string
          stock: number | null
          updated_at: string | null
          warranty: number | null
          weight: number | null
          wholesale_discount: string | null
          wholesale_price: number | null
        }
        Insert: {
          category_text?: string | null
          content_hash?: string | null
          created_at?: string | null
          daystodelivery?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_new?: boolean | null
          long_description?: string | null
          manufacturer?: string | null
          package_weight?: number | null
          preklad_en_hotovy?: boolean | null
          preklad_is_hotovy?: boolean | null
          product_id: string
          product_name?: string | null
          retail_price?: number | null
          sale?: boolean | null
          short_description?: string | null
          sku: string
          stock?: number | null
          updated_at?: string | null
          warranty?: number | null
          weight?: number | null
          wholesale_discount?: string | null
          wholesale_price?: number | null
        }
        Update: {
          category_text?: string | null
          content_hash?: string | null
          created_at?: string | null
          daystodelivery?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_new?: boolean | null
          long_description?: string | null
          manufacturer?: string | null
          package_weight?: number | null
          preklad_en_hotovy?: boolean | null
          preklad_is_hotovy?: boolean | null
          product_id?: string
          product_name?: string | null
          retail_price?: number | null
          sale?: boolean | null
          short_description?: string | null
          sku?: string
          stock?: number | null
          updated_at?: string | null
          warranty?: number | null
          weight?: number | null
          wholesale_discount?: string | null
          wholesale_price?: number | null
        }
        Relationships: []
      }
      produkty_obrazky: {
        Row: {
          id: string
          je_hlavni: boolean | null
          original_url: string
          poradi: number | null
          produkt_id: string | null
          stazeno: boolean | null
          storage_path: string | null
        }
        Insert: {
          id?: string
          je_hlavni?: boolean | null
          original_url: string
          poradi?: number | null
          produkt_id?: string | null
          stazeno?: boolean | null
          storage_path?: string | null
        }
        Update: {
          id?: string
          je_hlavni?: boolean | null
          original_url?: string
          poradi?: number | null
          produkt_id?: string | null
          stazeno?: boolean | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produkty_obrazky_produkt_id_fkey"
            columns: ["produkt_id"]
            isOneToOne: false
            referencedRelation: "produkty"
            referencedColumns: ["id"]
          },
        ]
      }
      produkty_parametry: {
        Row: {
          hodnota: string
          id: string
          nazev: string
          produkt_id: string | null
        }
        Insert: {
          hodnota: string
          id?: string
          nazev: string
          produkt_id?: string | null
        }
        Update: {
          hodnota?: string
          id?: string
          nazev?: string
          produkt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produkty_parametry_produkt_id_fkey"
            columns: ["produkt_id"]
            isOneToOne: false
            referencedRelation: "produkty"
            referencedColumns: ["id"]
          },
        ]
      }
      produkty_preklady: {
        Row: {
          id: string
          jazyk: string
          long_description: string | null
          product_name: string | null
          produkt_id: string | null
          short_description: string | null
        }
        Insert: {
          id?: string
          jazyk: string
          long_description?: string | null
          product_name?: string | null
          produkt_id?: string | null
          short_description?: string | null
        }
        Update: {
          id?: string
          jazyk?: string
          long_description?: string | null
          product_name?: string | null
          produkt_id?: string | null
          short_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produkty_preklady_produkt_id_fkey"
            columns: ["produkt_id"]
            isOneToOne: false
            referencedRelation: "produkty"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_city: string | null
          address_street: string | null
          address_zip: string | null
          b2b_requested_at: string | null
          base_discount: number | null
          brand_logo_url: string | null
          brand_name: string | null
          company_name: string | null
          contact_emails: string[]
          contact_name: string | null
          country: string
          created_at: string | null
          credit_limit: number
          customer_user_id: string | null
          ico: string | null
          id: string
          notify_offers: boolean
          notify_orders: boolean
          payment_terms: string
          phone: string | null
          primary_contact_email: string | null
          updated_at: string | null
          user_id: string | null
          vat_id: string | null
        }
        Insert: {
          address_city?: string | null
          address_street?: string | null
          address_zip?: string | null
          b2b_requested_at?: string | null
          base_discount?: number | null
          brand_logo_url?: string | null
          brand_name?: string | null
          company_name?: string | null
          contact_emails?: string[]
          contact_name?: string | null
          country?: string
          created_at?: string | null
          credit_limit?: number
          customer_user_id?: string | null
          ico?: string | null
          id: string
          notify_offers?: boolean
          notify_orders?: boolean
          payment_terms?: string
          phone?: string | null
          primary_contact_email?: string | null
          updated_at?: string | null
          user_id?: string | null
          vat_id?: string | null
        }
        Update: {
          address_city?: string | null
          address_street?: string | null
          address_zip?: string | null
          b2b_requested_at?: string | null
          base_discount?: number | null
          brand_logo_url?: string | null
          brand_name?: string | null
          company_name?: string | null
          contact_emails?: string[]
          contact_name?: string | null
          country?: string
          created_at?: string | null
          credit_limit?: number
          customer_user_id?: string | null
          ico?: string | null
          id?: string
          notify_offers?: boolean
          notify_orders?: boolean
          payment_terms?: string
          phone?: string | null
          primary_contact_email?: string | null
          updated_at?: string | null
          user_id?: string | null
          vat_id?: string | null
        }
        Relationships: []
      }
      shipping_methods: {
        Row: {
          active: boolean
          carrier: string
          cod_supported: boolean
          code: string
          created_at: string
          id: string
          name: string
          price_eur: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          carrier?: string
          cod_supported?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
          price_eur?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          carrier?: string
          cod_supported?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
          price_eur?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      supplier_orders: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          id: string
          last_error: string | null
          order_id: string
          payload: Json
          sent_at: string | null
          status: string
          supplier_response: Json | null
          updated_at: string
        }
        Insert: {
          attempts?: number
          channel?: string
          created_at?: string
          id?: string
          last_error?: string | null
          order_id: string
          payload?: Json
          sent_at?: string | null
          status?: string
          supplier_response?: Json | null
          updated_at?: string
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          id?: string
          last_error?: string | null
          order_id?: string
          payload?: Json
          sent_at?: string | null
          status?: string
          supplier_response?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_customer_emails: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      build_supplier_payload: { Args: { p_order_id: string }; Returns: Json }
      cancel_order: { Args: { p_order_id: string }; Returns: Json }
      comm_add_participant_by_email: {
        Args: { p_display_name?: string; p_email: string; p_label: string }
        Returns: string
      }
      comm_display_name: { Args: { p_uid: string }; Returns: string }
      comm_is_participant: { Args: never; Returns: boolean }
      comm_list_participants: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          label: string
          user_id: string
        }[]
      }
      comm_my_label: { Args: never; Returns: string }
      comm_recompute_awaiting: { Args: { p_topic: string }; Returns: undefined }
      comm_remove_participant: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      comm_resolve_question: {
        Args: { p_message: string; p_resolved?: boolean }
        Returns: undefined
      }
      deals_is_admin: { Args: never; Returns: boolean }
      derive_manufacturer_from_category: {
        Args: { cat: string }
        Returns: string
      }
      filter_products_by_params: {
        Args: { p_genders?: string[]; p_params?: Json }
        Returns: string[]
      }
      get_aggregations: { Args: never; Returns: Json }
      get_brand_catalog: {
        Args: { p_top_n?: number }
        Returns: {
          categories: string[]
          in_stock: number
          jewelry: number
          manufacturer: string
          max_discount: number
          top_products: Json
          total: number
          watches: number
        }[]
      }
      get_param_options: {
        Args: never
        Returns: {
          moznosti: string[]
          nazev: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      mark_order_paid: { Args: { p_order_id: string }; Returns: Json }
      next_order_number: { Args: never; Returns: string }
      orders_is_admin: { Args: never; Returns: boolean }
      place_order: { Args: { p: Json }; Returns: Json }
      search_products: {
        Args: {
          p_brands?: string[]
          p_category_keywords?: string[]
          p_genders?: string[]
          p_ids?: string[]
          p_limit?: number
          p_min_discount?: number
          p_offset?: number
          p_params?: Json
          p_search?: string
          p_stock_only?: boolean
        }
        Returns: {
          category_text: string
          ean: string
          id: string
          image_url: string
          image_urls: string[]
          long_description: string
          manufacturer: string
          product_name: string
          retail_price: number
          short_description: string
          sku: string
          stock: number
          total_count: number
          wholesale_discount: string
          wholesale_price: number
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
    Enums: {},
  },
} as const
