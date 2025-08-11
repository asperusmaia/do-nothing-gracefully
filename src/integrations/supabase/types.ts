export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agendamentos_robustos: {
        Row: {
          CONTATO: string | null
          created_at: string | null
          DATA: string
          HORA: string
          id: number
          loja_id: string | null
          NOME: string | null
          PROFISSIONAL: string | null
          STATUS:
            | Database["public"]["Enums"]["status_agendamento_robusto"]
            | null
        }
        Insert: {
          CONTATO?: string | null
          created_at?: string | null
          DATA: string
          HORA: string
          id?: number
          loja_id?: string | null
          NOME?: string | null
          PROFISSIONAL?: string | null
          STATUS?:
            | Database["public"]["Enums"]["status_agendamento_robusto"]
            | null
        }
        Update: {
          CONTATO?: string | null
          created_at?: string | null
          DATA?: string
          HORA?: string
          id?: number
          loja_id?: string | null
          NOME?: string | null
          PROFISSIONAL?: string | null
          STATUS?:
            | Database["public"]["Enums"]["status_agendamento_robusto"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_robustos_loja_fk"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "info_loja"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_ativo: {
        Row: {
          created_at: string
          id: number
          num: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          num?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          num?: number | null
        }
        Relationships: []
      }
      cadastro: {
        Row: {
          contato: string
          created_at: string
          data_nascimento: string
          id: number
          nome: string
          serviços_preferidos: string
        }
        Insert: {
          contato: string
          created_at?: string
          data_nascimento: string
          id?: number
          nome: string
          serviços_preferidos: string
        }
        Update: {
          contato?: string
          created_at?: string
          data_nascimento?: string
          id?: number
          nome?: string
          serviços_preferidos?: string
        }
        Relationships: []
      }
      feriados: {
        Row: {
          data: string
          descricao: string
        }
        Insert: {
          data: string
          descricao: string
        }
        Update: {
          data?: string
          descricao?: string
        }
        Relationships: []
      }
      info_loja: {
        Row: {
          address: string | null
          closing_time: string
          id: string
          instructions: string | null
          maps_url: string | null
          name: string
          opening_time: string
          phone: string | null
          slot_interval_minutes: number
        }
        Insert: {
          address?: string | null
          closing_time?: string
          id?: string
          instructions?: string | null
          maps_url?: string | null
          name: string
          opening_time?: string
          phone?: string | null
          slot_interval_minutes?: number
        }
        Update: {
          address?: string | null
          closing_time?: string
          id?: string
          instructions?: string | null
          maps_url?: string | null
          name?: string
          opening_time?: string
          phone?: string | null
          slot_interval_minutes?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      status_agendamento_robusto: "AGENDADO" | "REAGENDADO" | "CANCELADO"
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
      status_agendamento_robusto: ["AGENDADO", "REAGENDADO", "CANCELADO"],
    },
  },
} as const
