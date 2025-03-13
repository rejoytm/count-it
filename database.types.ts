export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer: {
        Row: {
          customer_id: string
          email: string | null
          image_url: string | null
          is_archived: boolean
          name: string
          tax_registration_number: string | null
        }
        Insert: {
          customer_id?: string
          email?: string | null
          image_url?: string | null
          is_archived?: boolean
          name: string
          tax_registration_number?: string | null
        }
        Update: {
          customer_id?: string
          email?: string | null
          image_url?: string | null
          is_archived?: boolean
          name?: string
          tax_registration_number?: string | null
        }
        Relationships: []
      }
      customer_product_pricing: {
        Row: {
          customer_id: string
          product_id: string
          sales_tax_id: string | null
          unit_price: number
        }
        Insert: {
          customer_id: string
          product_id: string
          sales_tax_id?: string | null
          unit_price: number
        }
        Update: {
          customer_id?: string
          product_id?: string
          sales_tax_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_product_price_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_product_price_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "customer_product_price_sales_tax_id_fkey"
            columns: ["sales_tax_id"]
            isOneToOne: false
            referencedRelation: "sales_tax"
            referencedColumns: ["sales_tax_id"]
          },
        ]
      }
      invoice: {
        Row: {
          created_at: string
          customer_id: string
          invoice_date: string
          invoice_id: string
          invoice_number: string
          is_void: boolean
          notes: string | null
          paid_amount: number
          payment_status: Database["public"]["Enums"]["invoice_payment_status"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          invoice_date: string
          invoice_id?: string
          invoice_number: string
          is_void?: boolean
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["invoice_payment_status"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          invoice_date?: string
          invoice_id?: string
          invoice_number?: string
          is_void?: boolean
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["invoice_payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoice_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      invoice_line_item: {
        Row: {
          delivery_note_number: string | null
          description: string | null
          invoice_id: string
          line_item_id: string
          product_id: string
          quantity: number
          sales_tax_id: string | null
          unit_price: number
        }
        Insert: {
          delivery_note_number?: string | null
          description?: string | null
          invoice_id: string
          line_item_id?: string
          product_id: string
          quantity: number
          sales_tax_id?: string | null
          unit_price: number
        }
        Update: {
          delivery_note_number?: string | null
          description?: string | null
          invoice_id?: string
          line_item_id?: string
          product_id?: string
          quantity?: number
          sales_tax_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_item_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_item_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_financial_report"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "invoice_line_item_sales_tax_id_fkey"
            columns: ["sales_tax_id"]
            isOneToOne: false
            referencedRelation: "sales_tax"
            referencedColumns: ["sales_tax_id"]
          },
        ]
      }
      key_value: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          category_id: string | null
          is_archived: boolean
          name: string
          product_id: string
          sales_tax_id: string | null
          unit_price: number | null
        }
        Insert: {
          category_id?: string | null
          is_archived?: boolean
          name: string
          product_id?: string
          sales_tax_id?: string | null
          unit_price?: number | null
        }
        Update: {
          category_id?: string | null
          is_archived?: boolean
          name?: string
          product_id?: string
          sales_tax_id?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "invoice_financial_report"
            referencedColumns: ["product_category_id"]
          },
          {
            foreignKeyName: "product_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "product_sales_tax_id_fkey"
            columns: ["sales_tax_id"]
            isOneToOne: false
            referencedRelation: "sales_tax"
            referencedColumns: ["sales_tax_id"]
          },
        ]
      }
      product_category: {
        Row: {
          category_id: string
          name: string
          position: number
        }
        Insert: {
          category_id?: string
          name: string
          position: number
        }
        Update: {
          category_id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      product_inventory: {
        Row: {
          allow_sales_when_out_of_stock: boolean
          low_stock_threshold: number
          product_id: string
          stock: number
        }
        Insert: {
          allow_sales_when_out_of_stock: boolean
          low_stock_threshold: number
          product_id: string
          stock: number
        }
        Update: {
          allow_sales_when_out_of_stock?: boolean
          low_stock_threshold?: number
          product_id?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      sales_tax: {
        Row: {
          abbreviation: string
          is_archived: boolean
          is_recoverable: boolean
          name: string
          rate: number
          sales_tax_id: string
        }
        Insert: {
          abbreviation: string
          is_archived?: boolean
          is_recoverable: boolean
          name: string
          rate: number
          sales_tax_id?: string
        }
        Update: {
          abbreviation?: string
          is_archived?: boolean
          is_recoverable?: boolean
          name?: string
          rate?: number
          sales_tax_id?: string
        }
        Relationships: []
      }
      wave_id_mapping: {
        Row: {
          entity_type: Database["public"]["Enums"]["entity_type"]
          replacement_id: string
          wave_id: string
        }
        Insert: {
          entity_type: Database["public"]["Enums"]["entity_type"]
          replacement_id: string
          wave_id: string
        }
        Update: {
          entity_type?: Database["public"]["Enums"]["entity_type"]
          replacement_id?: string
          wave_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      invoice_financial_report: {
        Row: {
          customer_id: string | null
          customer_name: string | null
          invoice_date: string | null
          invoice_id: string | null
          product_category_id: string | null
          product_category_name: string | null
          product_id: string | null
          product_name: string | null
          sales_tax_amount: number | null
          subtotal_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "invoice_line_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
        ]
      }
    }
    Functions: {
      create_customer: {
        Args: {
          customer_data: Json
        }
        Returns: string
      }
      create_invoice: {
        Args: {
          invoice_data: Json
        }
        Returns: string
      }
      generate_activity_report: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: Json
      }
      keep_alive: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_customer: {
        Args: {
          customer_data: Json
        }
        Returns: string
      }
      update_invoice: {
        Args: {
          invoice_data: Json
        }
        Returns: string
      }
    }
    Enums: {
      entity_type: "product" | "sales_tax" | "customer" | "invoice"
      invoice_payment_status: "unpaid" | "partially_paid" | "paid" | "overpaid"
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
