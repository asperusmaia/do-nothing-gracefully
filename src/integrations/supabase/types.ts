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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          CONTATO: string | null
          created_at: string
          DATA: string | null
          HORA: string | null
          id: number
          NOME: string | null
          PROFISSIONAL: string | null
          STATUS: string | null
        }
        Insert: {
          CONTATO?: string | null
          created_at?: string
          DATA?: string | null
          HORA?: string | null
          id?: number
          NOME?: string | null
          PROFISSIONAL?: string | null
          STATUS?: string | null
        }
        Update: {
          CONTATO?: string | null
          created_at?: string
          DATA?: string | null
          HORA?: string | null
          id?: number
          NOME?: string | null
          PROFISSIONAL?: string | null
          STATUS?: string | null
        }
        Relationships: []
      }
      agendamentos_robustos: {
        Row: {
          CONTATO: string | null
          created_at: string | null
          DATA: string
          HORA: string
          id: number
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
          NOME?: string | null
          PROFISSIONAL?: string | null
          STATUS?:
            | Database["public"]["Enums"]["status_agendamento_robusto"]
            | null
        }
        Relationships: []
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
    }
    Views: {
      agendamento_publico: {
        Row: {
          CONTATO: string | null
          DATA: string | null
          HORA: string | null
          NOME: string | null
          PROFISSIONAL: string | null
          STATUS: string | null
        }
        Insert: {
          CONTATO?: string | null
          DATA?: string | null
          HORA?: string | null
          NOME?: string | null
          PROFISSIONAL?: string | null
          STATUS?: string | null
        }
        Update: {
          CONTATO?: string | null
          DATA?: string | null
          HORA?: string | null
          NOME?: string | null
          PROFISSIONAL?: string | null
          STATUS?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_available_slots: {
        Args: { numero_de_dias?: number; limite_horarios?: number }
        Returns: Json
      }
      get_client_future_appointments: {
        Args: { client_contact: string }
        Returns: Json
      }
      inserir_3x_e_parar: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
