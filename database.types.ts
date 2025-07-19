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
      post_media: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          file_path: string
          file_size: number | null
          file_url: string
          id: string
          media_type: string
          mime_type: string | null
          post_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path: string
          file_size?: number | null
          file_url: string
          id?: string
          media_type?: string
          mime_type?: string | null
          post_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path?: string
          file_size?: number | null
          file_url?: string
          id?: string
          media_type?: string
          mime_type?: string | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          approve_count: number | null
          cache_count: number | null
          coffee_count: number | null
          content: string | null
          created_at: string | null
          id: string
          parent_post_id: string | null
          reply_count: number | null
          repost_count: number | null
          repost_post_id: string | null
          star_count: number | null
          user_id: string
        }
        Insert: {
          approve_count?: number | null
          cache_count?: number | null
          coffee_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          parent_post_id?: string | null
          reply_count?: number | null
          repost_count?: number | null
          repost_post_id?: string | null
          star_count?: number | null
          user_id?: string
        }
        Update: {
          approve_count?: number | null
          cache_count?: number | null
          coffee_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          parent_post_id?: string | null
          reply_count?: number | null
          repost_count?: number | null
          repost_post_id?: string | null
          star_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_repost_post_id_fkey"
            columns: ["repost_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_followers: {
        Row: {
          created_at: string | null
          follower_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          cover_image_url: string | null
          display_name: string
          follower_count: number | null
          following_count: number | null
          id: string
          image_url: string | null
          join_date: string | null
          location: string | null
          username: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          cover_image_url?: string | null
          display_name: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          image_url?: string | null
          join_date?: string | null
          location?: string | null
          username: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          cover_image_url?: string | null
          display_name?: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          image_url?: string | null
          join_date?: string | null
          location?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_orphaned_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_storage_object: {
        Args: { file_path: string }
        Returns: undefined
      }
      get_post_ancestry: {
        Args: { start_id: string }
        Returns: {
          id: string
          content: string
          created_at: string
          parent_post_id: string
          repost_post_id: string
          star_count: number
          coffee_count: number
          approve_count: number
          cache_count: number
          user: Json
          reaction: Json
          repost: Json
        }[]
      }
      get_random_unfollowed_users: {
        Args: { count: number }
        Returns: {
          bio: string | null
          cover_image_url: string | null
          display_name: string
          follower_count: number | null
          following_count: number | null
          id: string
          image_url: string | null
          join_date: string | null
          location: string | null
          username: string
          website: string | null
        }[]
      }
      get_replies_to_depth: {
        Args: { target_id: string; max_depth: number }
        Returns: {
          id: string
          content: string
          created_at: string
          parent_post_id: string
          repost_post_id: string
          star_count: number
          coffee_count: number
          approve_count: number
          cache_count: number
          level: number
          user: Json
          reaction: Json
        }[]
      }
      get_user_feed: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          content: string
          created_at: string
          parent_post_id: string
          repost_post_id: string
          reply_count: number
          repost_count: number
          star_count: number
          coffee_count: number
          approve_count: number
          cache_count: number
          user: Json
          reaction: Json
          repost: Json
        }[]
      }
      get_user_posts_by_username: {
        Args: { input_username: string }
        Returns: {
          id: string
          content: string
          created_at: string
          parent_post_id: string
          repost_post_id: string
          reply_count: number
          repost_count: number
          star_count: number
          coffee_count: number
          approve_count: number
          cache_count: number
          user: Json
          reaction: Json
          repost: Json
        }[]
      }
      toggle_follow: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      toggle_reaction: {
        Args: { input_post_id: string; input_reaction_type: string }
        Returns: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
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
