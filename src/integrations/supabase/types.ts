export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_accounts: {
        Row: {
          created_at: string;
          email: string;
          name: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          name?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          name?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          admin_notes: string | null;
          booking_date: string;
          contact_name: string;
          created_at: string;
          duration_hours: number;
          email: string;
          format: string;
          id: string;
          phone: string;
          players_count: number;
          price_inr: number;
          requirements: string | null;
          slot_id: string;
          status: string;
          team_name: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          booking_date: string;
          contact_name: string;
          created_at?: string;
          duration_hours?: number;
          email: string;
          format?: string;
          id?: string;
          phone: string;
          players_count?: number;
          price_inr?: number;
          requirements?: string | null;
          slot_id: string;
          status?: string;
          team_name: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          booking_date?: string;
          contact_name?: string;
          created_at?: string;
          duration_hours?: number;
          email?: string;
          format?: string;
          id?: string;
          phone?: string;
          players_count?: number;
          price_inr?: number;
          requirements?: string | null;
          slot_id?: string;
          status?: string;
          team_name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "ground_slots";
            referencedColumns: ["id"];
          },
        ];
      };
      challenges: {
        Row: {
          admin_notes: string | null;
          ball_type: string;
          contact_name: string;
          created_at: string;
          email: string;
          format: string;
          id: string;
          match_id: string | null;
          message: string | null;
          phone: string;
          preferred_date: string;
          preferred_time: string;
          proposed_date: string | null;
          proposed_time: string | null;
          status: string;
          team_name: string;
          updated_at: string;
          venue: string;
        };
        Insert: {
          admin_notes?: string | null;
          ball_type?: string;
          contact_name: string;
          created_at?: string;
          email: string;
          format?: string;
          id?: string;
          match_id?: string | null;
          message?: string | null;
          phone: string;
          preferred_date: string;
          preferred_time: string;
          proposed_date?: string | null;
          proposed_time?: string | null;
          status?: string;
          team_name: string;
          updated_at?: string;
          venue: string;
        };
        Update: {
          admin_notes?: string | null;
          ball_type?: string;
          contact_name?: string;
          created_at?: string;
          email?: string;
          format?: string;
          id?: string;
          match_id?: string | null;
          message?: string | null;
          phone?: string;
          preferred_date?: string;
          preferred_time?: string;
          proposed_date?: string | null;
          proposed_time?: string | null;
          status?: string;
          team_name?: string;
          updated_at?: string;
          venue?: string;
        };
        Relationships: [
          {
            foreignKeyName: "challenges_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      gallery: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          image_url: string;
          sort_order: number;
          title: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          image_url: string;
          sort_order?: number;
          title?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          image_url?: string;
          sort_order?: number;
          title?: string;
        };
        Relationships: [];
      };
      ground_blocks: {
        Row: {
          block_date: string;
          created_at: string;
          id: string;
          reason: string | null;
          slot_id: string | null;
        };
        Insert: {
          block_date: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
          slot_id?: string | null;
        };
        Update: {
          block_date?: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
          slot_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ground_blocks_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "ground_slots";
            referencedColumns: ["id"];
          },
        ];
      };
      ground_slots: {
        Row: {
          active: boolean;
          end_time: string;
          extra_charges_inr: number;
          extra_charges_note: string | null;
          id: string;
          label: string;
          sort_order: number;
          start_time: string;
          updated_at: string;
          weekday_price_inr: number;
          weekend_price_inr: number;
        };
        Insert: {
          active?: boolean;
          end_time: string;
          extra_charges_inr?: number;
          extra_charges_note?: string | null;
          id?: string;
          label: string;
          sort_order?: number;
          start_time: string;
          updated_at?: string;
          weekday_price_inr?: number;
          weekend_price_inr?: number;
        };
        Update: {
          active?: boolean;
          end_time?: string;
          extra_charges_inr?: number;
          extra_charges_note?: string | null;
          id?: string;
          label?: string;
          sort_order?: number;
          start_time?: string;
          updated_at?: string;
          weekday_price_inr?: number;
          weekend_price_inr?: number;
        };
        Relationships: [];
      };
      grounds: {
        Row: {
          ball_types: string[];
          capacity: string;
          description: string;
          facilities: string[];
          id: string;
          location: string;
          name: string;
          photos: string[];
          pitch_type: string;
          updated_at: string;
        };
        Insert: {
          ball_types?: string[];
          capacity?: string;
          description?: string;
          facilities?: string[];
          id?: string;
          location?: string;
          name?: string;
          photos?: string[];
          pitch_type?: string;
          updated_at?: string;
        };
        Update: {
          ball_types?: string[];
          capacity?: string;
          description?: string;
          facilities?: string[];
          id?: string;
          location?: string;
          name?: string;
          photos?: string[];
          pitch_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          ball_type: string;
          created_at: string;
          format: string;
          id: string;
          match_date: string;
          match_time: string;
          notes: string | null;
          opponent: string;
          opponent_score: string | null;
          our_score: string | null;
          player_of_match: string | null;
          result: string | null;
          status: string;
          summary: string | null;
          updated_at: string;
          venue: string;
        };
        Insert: {
          ball_type?: string;
          created_at?: string;
          format?: string;
          id?: string;
          match_date: string;
          match_time?: string;
          notes?: string | null;
          opponent: string;
          opponent_score?: string | null;
          our_score?: string | null;
          player_of_match?: string | null;
          result?: string | null;
          status?: string;
          summary?: string | null;
          updated_at?: string;
          venue: string;
        };
        Update: {
          ball_type?: string;
          created_at?: string;
          format?: string;
          id?: string;
          match_date?: string;
          match_time?: string;
          notes?: string | null;
          opponent?: string;
          opponent_score?: string | null;
          our_score?: string | null;
          player_of_match?: string | null;
          result?: string | null;
          status?: string;
          summary?: string | null;
          updated_at?: string;
          venue?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          kind: string;
          read: boolean;
          title: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind: string;
          read?: boolean;
          title: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          read?: boolean;
          title?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          additional_role: string;
          batting_style: string | null;
          bio: string | null;
          bowling_style: string | null;
          created_at: string;
          id: string;
          jersey_number: number | null;
          matches: number;
          name: string;
          photo_url: string | null;
          role: string;
          runs: number;
          sort_order: number;
          updated_at: string;
          wickets: number;
        };
        Insert: {
          additional_role?: string;
          batting_style?: string | null;
          bio?: string | null;
          bowling_style?: string | null;
          created_at?: string;
          id?: string;
          jersey_number?: number | null;
          matches?: number;
          name: string;
          photo_url?: string | null;
          role?: string;
          runs?: number;
          sort_order?: number;
          updated_at?: string;
          wickets?: number;
        };
        Update: {
          additional_role?: string;
          batting_style?: string | null;
          bio?: string | null;
          bowling_style?: string | null;
          created_at?: string;
          id?: string;
          jersey_number?: number | null;
          matches?: number;
          name?: string;
          photo_url?: string | null;
          role?: string;
          runs?: number;
          sort_order?: number;
          updated_at?: string;
          wickets?: number;
        };
        Relationships: [];
      };
      team_settings: {
        Row: {
          about: string;
          address: string;
          email: string;
          facebook_url: string | null;
          id: string;
          instagram_url: string | null;
          logo_url: string | null;
          losses: number;
          maps_url: string | null;
          matches_played: number;
          phone: string;
          tagline: string;
          team_name: string;
          updated_at: string;
          whatsapp_number: string;
          wins: number;
          youtube_url: string | null;
        };
        Insert: {
          about?: string;
          address?: string;
          email?: string;
          facebook_url?: string | null;
          id?: string;
          instagram_url?: string | null;
          logo_url?: string | null;
          losses?: number;
          maps_url?: string | null;
          matches_played?: number;
          phone?: string;
          tagline?: string;
          team_name?: string;
          updated_at?: string;
          whatsapp_number?: string;
          wins?: number;
          youtube_url?: string | null;
        };
        Update: {
          about?: string;
          address?: string;
          email?: string;
          facebook_url?: string | null;
          id?: string;
          instagram_url?: string | null;
          logo_url?: string | null;
          losses?: number;
          maps_url?: string | null;
          matches_played?: number;
          phone?: string;
          tagline?: string;
          team_name?: string;
          updated_at?: string;
          whatsapp_number?: string;
          wins?: number;
          youtube_url?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      assign_player_leadership: {
        Args: { _additional_role: string; _player_id: string };
        Returns: undefined;
      };
      ground_availability: {
        Args: { _date: string };
        Returns: {
          end_time: string;
          label: string;
          price_inr: number;
          slot_id: string;
          start_time: string;
          status: string;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      slot_price: {
        Args: { _date: string; _slot_id: string };
        Returns: number;
      };
    };
    Enums: {
      app_role: "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const;
