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
      import_batches: {
        Row: {
          batch_name: string
          completed_at: string | null
          created_at: string
          duplicate_records: number
          error_report: Json
          id: string
          import_status: string
          records_flagged: number
          records_imported: number
          records_updated: number
          rejected_records: number
          source: string
          started_at: string
          total_records_received: number
        }
        Insert: {
          batch_name: string
          completed_at?: string | null
          created_at?: string
          duplicate_records?: number
          error_report?: Json
          id?: string
          import_status?: string
          records_flagged?: number
          records_imported?: number
          records_updated?: number
          rejected_records?: number
          source: string
          started_at?: string
          total_records_received?: number
        }
        Update: {
          batch_name?: string
          completed_at?: string | null
          created_at?: string
          duplicate_records?: number
          error_report?: Json
          id?: string
          import_status?: string
          records_flagged?: number
          records_imported?: number
          records_updated?: number
          rejected_records?: number
          source?: string
          started_at?: string
          total_records_received?: number
        }
        Relationships: []
      }
      nafdac_products: {
        Row: {
          active_ingredients: Json
          applicant_name: string | null
          approval_date: string | null
          atc_code: string | null
          composition: Json | null
          created_at: string
          derived_verification_status: string
          dosage_form: string | null
          first_imported_at: string
          id: string
          ingredient_synonyms: Json
          last_updated_at: string
          last_verified_at: string
          manufacturer_name: string | null
          marketing_category: string | null
          pack_size: string | null
          product_category: string | null
          product_detail_url: string | null
          product_information_url: string | null
          product_name: string
          raw_payload: Json
          registration_expiry_date: string | null
          registration_number: string | null
          review_flags: Json
          route_of_administration: string | null
          source_product_id: string
          source_status: string
          strength: string | null
          updated_at: string
        }
        Insert: {
          active_ingredients?: Json
          applicant_name?: string | null
          approval_date?: string | null
          atc_code?: string | null
          composition?: Json | null
          created_at?: string
          derived_verification_status?: string
          dosage_form?: string | null
          first_imported_at?: string
          id?: string
          ingredient_synonyms?: Json
          last_updated_at?: string
          last_verified_at?: string
          manufacturer_name?: string | null
          marketing_category?: string | null
          pack_size?: string | null
          product_category?: string | null
          product_detail_url?: string | null
          product_information_url?: string | null
          product_name: string
          raw_payload?: Json
          registration_expiry_date?: string | null
          registration_number?: string | null
          review_flags?: Json
          route_of_administration?: string | null
          source_product_id: string
          source_status?: string
          strength?: string | null
          updated_at?: string
        }
        Update: {
          active_ingredients?: Json
          applicant_name?: string | null
          approval_date?: string | null
          atc_code?: string | null
          composition?: Json | null
          created_at?: string
          derived_verification_status?: string
          dosage_form?: string | null
          first_imported_at?: string
          id?: string
          ingredient_synonyms?: Json
          last_updated_at?: string
          last_verified_at?: string
          manufacturer_name?: string | null
          marketing_category?: string | null
          pack_size?: string | null
          product_category?: string | null
          product_detail_url?: string | null
          product_information_url?: string | null
          product_name?: string
          raw_payload?: Json
          registration_expiry_date?: string | null
          registration_number?: string | null
          review_flags?: Json
          route_of_administration?: string | null
          source_product_id?: string
          source_status?: string
          strength?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_ingredients: {
        Row: {
          composition_details: Json | null
          created_at: string
          id: string
          ingredient_name: string
          ingredient_synonyms: Json
          product_id: string
          strength: string | null
        }
        Insert: {
          composition_details?: Json | null
          created_at?: string
          id?: string
          ingredient_name: string
          ingredient_synonyms?: Json
          product_id: string
          strength?: string | null
        }
        Update: {
          composition_details?: Json | null
          created_at?: string
          id?: string
          ingredient_name?: string
          ingredient_synonyms?: Json
          product_id?: string
          strength?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "nafdac_products"
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
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      registration_status_history: {
        Row: {
          created_at: string
          id: string
          new_status: string
          previous_status: string
          product_id: string
          source_batch_id: string | null
          source_observed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_status: string
          previous_status: string
          product_id: string
          source_batch_id?: string | null
          source_observed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: string
          previous_status?: string
          product_id?: string
          source_batch_id?: string | null
          source_observed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_status_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "nafdac_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_status_history_source_batch_id_fkey"
            columns: ["source_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      staging_records: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          processed_at: string | null
          raw_payload: Json
          registration_number: string | null
          source_product_id: string | null
          validation_errors: Json
          validation_status: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          processed_at?: string | null
          raw_payload: Json
          registration_number?: string | null
          source_product_id?: string | null
          validation_errors?: Json
          validation_status?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          raw_payload?: Json
          registration_number?: string | null
          source_product_id?: string | null
          validation_errors?: Json
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staging_records_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_nafdac_import: {
        Args: { _batch_name: string; _source: string; _total?: number }
        Returns: string
      }
      finish_nafdac_import: {
        Args: { _batch_id: string; _errors?: Json; _status: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      nafdac_is_iso_date: { Args: { _value: string }; Returns: boolean }
      process_nafdac_import_chunk: {
        Args: { _batch_id: string; _records: Json }
        Returns: Json
      }
      search_nafdac_products: {
        Args: { _limit?: number; _query: string }
        Returns: {
          active_ingredients: Json
          applicant_name: string
          approval_date: string
          composition: Json
          derived_verification_status: string
          dosage_form: string
          last_verified_at: string
          manufacturer_name: string
          marketing_category: string
          pack_size: string
          product_category: string
          product_detail_url: string
          product_name: string
          registration_expiry_date: string
          registration_number: string
          review_flags: Json
          route_of_administration: string
          source_status: string
          strength: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
