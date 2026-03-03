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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      activity_vectors: {
        Row: {
          id: string
          metadata: Json | null
          recorded_at: string
          source: string
          user_id: string
          weight: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          recorded_at?: string
          source: string
          user_id: string
          weight?: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          recorded_at?: string
          source?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          content: string
          created_at: string
          generated_at: string
          id: string
          insight_type: string
          intelligence_score: number | null
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          generated_at?: string
          id?: string
          insight_type: string
          intelligence_score?: number | null
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          generated_at?: string
          id?: string
          insight_type?: string
          intelligence_score?: number | null
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          ended_at: string | null
          id: string
          label: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          label?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          label?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      github_accounts: {
        Row: {
          avatar_url: string | null
          created_at: string
          encrypted_token: string
          id: string
          is_default: boolean
          last_sync_at: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          encrypted_token: string
          id?: string
          is_default?: boolean
          last_sync_at?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          encrypted_token?: string
          id?: string
          is_default?: boolean
          last_sync_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      github_sync_logs: {
        Row: {
          commits_synced: number | null
          duration_ms: number | null
          error_message: string | null
          github_account_id: string
          id: string
          status: string
          synced_at: string
          user_id: string
        }
        Insert: {
          commits_synced?: number | null
          duration_ms?: number | null
          error_message?: string | null
          github_account_id: string
          id?: string
          status?: string
          synced_at?: string
          user_id: string
        }
        Update: {
          commits_synced?: number | null
          duration_ms?: number | null
          error_message?: string | null
          github_account_id?: string
          id?: string
          status?: string
          synced_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_sync_logs_github_account_id_fkey"
            columns: ["github_account_id"]
            isOneToOne: false
            referencedRelation: "github_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      productivity_metrics: {
        Row: {
          calculated_at: string
          commit_count: number
          created_at: string
          daily_score: number
          focus_minutes: number
          github_account_id: string | null
          id: string
          metadata: Json | null
          streak: number
          user_id: string
          weekly_score: number
        }
        Insert: {
          calculated_at?: string
          commit_count?: number
          created_at?: string
          daily_score?: number
          focus_minutes?: number
          github_account_id?: string | null
          id?: string
          metadata?: Json | null
          streak?: number
          user_id: string
          weekly_score?: number
        }
        Update: {
          calculated_at?: string
          commit_count?: number
          created_at?: string
          daily_score?: number
          focus_minutes?: number
          github_account_id?: string | null
          id?: string
          metadata?: Json | null
          streak?: number
          user_id?: string
          weekly_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "productivity_metrics_github_account_id_fkey"
            columns: ["github_account_id"]
            isOneToOne: false
            referencedRelation: "github_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repo_commits: {
        Row: {
          author: string | null
          commit_sha: string
          committed_at: string
          created_at: string
          github_account_id: string | null
          id: string
          message: string
          tracked_repo_id: string
          user_id: string
        }
        Insert: {
          author?: string | null
          commit_sha: string
          committed_at: string
          created_at?: string
          github_account_id?: string | null
          id?: string
          message: string
          tracked_repo_id: string
          user_id: string
        }
        Update: {
          author?: string | null
          commit_sha?: string
          committed_at?: string
          created_at?: string
          github_account_id?: string | null
          id?: string
          message?: string
          tracked_repo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repo_commits_github_account_id_fkey"
            columns: ["github_account_id"]
            isOneToOne: false
            referencedRelation: "github_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repo_commits_tracked_repo_id_fkey"
            columns: ["tracked_repo_id"]
            isOneToOne: false
            referencedRelation: "tracked_repos"
            referencedColumns: ["id"]
          },
        ]
      }
      repo_stats: {
        Row: {
          active_branches: number
          activity_score: number
          created_at: string
          github_account_id: string | null
          id: string
          last_commit_at: string | null
          open_prs: number
          stars: number
          synced_at: string
          total_commits: number
          tracked_repo_id: string
          updated_at: string
          user_id: string
          weekly_streak: number
        }
        Insert: {
          active_branches?: number
          activity_score?: number
          created_at?: string
          github_account_id?: string | null
          id?: string
          last_commit_at?: string | null
          open_prs?: number
          stars?: number
          synced_at?: string
          total_commits?: number
          tracked_repo_id: string
          updated_at?: string
          user_id: string
          weekly_streak?: number
        }
        Update: {
          active_branches?: number
          activity_score?: number
          created_at?: string
          github_account_id?: string | null
          id?: string
          last_commit_at?: string | null
          open_prs?: number
          stars?: number
          synced_at?: string
          total_commits?: number
          tracked_repo_id?: string
          updated_at?: string
          user_id?: string
          weekly_streak?: number
        }
        Relationships: [
          {
            foreignKeyName: "repo_stats_github_account_id_fkey"
            columns: ["github_account_id"]
            isOneToOne: false
            referencedRelation: "github_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repo_stats_tracked_repo_id_fkey"
            columns: ["tracked_repo_id"]
            isOneToOne: true
            referencedRelation: "tracked_repos"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tracked_repos: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          github_account_id: string | null
          id: string
          repo_name: string
          repo_owner: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          github_account_id?: string | null
          id?: string
          repo_name: string
          repo_owner: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          github_account_id?: string | null
          id?: string
          repo_name?: string
          repo_owner?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_repos_github_account_id_fkey"
            columns: ["github_account_id"]
            isOneToOne: false
            referencedRelation: "github_accounts"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
