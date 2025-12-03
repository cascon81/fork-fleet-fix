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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          alugueis_ativos: number
          cnpj: string
          contato: string
          created_at: string
          email: string
          endereco: string
          id: string
          nome: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alugueis_ativos?: number
          cnpj: string
          contato: string
          created_at?: string
          email: string
          endereco: string
          id?: string
          nome: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alugueis_ativos?: number
          cnpj?: string
          contato?: string
          created_at?: string
          email?: string
          endereco?: string
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forklifts: {
        Row: {
          ano_fabricacao: number
          capacidade: string
          created_at: string
          horas_uso: number
          id: string
          marca: string
          modelo: string
          placa: string
          proxima_manutencao: string | null
          status: Database["public"]["Enums"]["forklift_status"]
          ultima_manutencao: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano_fabricacao: number
          capacidade: string
          created_at?: string
          horas_uso?: number
          id?: string
          marca: string
          modelo: string
          placa: string
          proxima_manutencao?: string | null
          status?: Database["public"]["Enums"]["forklift_status"]
          ultima_manutencao?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano_fabricacao?: number
          capacidade?: string
          created_at?: string
          horas_uso?: number
          id?: string
          marca?: string
          modelo?: string
          placa?: string
          proxima_manutencao?: string | null
          status?: Database["public"]["Enums"]["forklift_status"]
          ultima_manutencao?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenances: {
        Row: {
          created_at: string
          custo: number | null
          data_agendada: string
          data_conclusao: string | null
          descricao: string
          forklift_id: string
          id: string
          status: Database["public"]["Enums"]["maintenance_status"]
          tipo: Database["public"]["Enums"]["maintenance_tipo"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custo?: number | null
          data_agendada: string
          data_conclusao?: string | null
          descricao: string
          forklift_id: string
          id?: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          tipo: Database["public"]["Enums"]["maintenance_tipo"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custo?: number | null
          data_agendada?: string
          data_conclusao?: string | null
          descricao?: string
          forklift_id?: string
          id?: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          tipo?: Database["public"]["Enums"]["maintenance_tipo"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_maintenances_forklift"
            columns: ["forklift_id"]
            isOneToOne: false
            referencedRelation: "forklifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenances_forklift_id_fkey"
            columns: ["forklift_id"]
            isOneToOne: false
            referencedRelation: "forklifts"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          cliente: string
          created_at: string
          data_fim: string
          data_inicio: string
          forklift_id: string
          id: string
          status: Database["public"]["Enums"]["rental_status"]
          updated_at: string
          user_id: string
          valor_diaria: number
        }
        Insert: {
          cliente: string
          created_at?: string
          data_fim: string
          data_inicio: string
          forklift_id: string
          id?: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          user_id: string
          valor_diaria: number
        }
        Update: {
          cliente?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          forklift_id?: string
          id?: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          user_id?: string
          valor_diaria?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_rentals_forklift"
            columns: ["forklift_id"]
            isOneToOne: false
            referencedRelation: "forklifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_forklift_id_fkey"
            columns: ["forklift_id"]
            isOneToOne: false
            referencedRelation: "forklifts"
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
      forklift_status: "disponivel" | "alugada" | "manutencao"
      maintenance_status: "agendada" | "em_andamento" | "concluida"
      maintenance_tipo: "preventiva" | "corretiva"
      rental_status: "ativo" | "finalizado" | "atrasado"
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
      forklift_status: ["disponivel", "alugada", "manutencao"],
      maintenance_status: ["agendada", "em_andamento", "concluida"],
      maintenance_tipo: ["preventiva", "corretiva"],
      rental_status: ["ativo", "finalizado", "atrasado"],
    },
  },
} as const
