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
      authors: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["post_category"]
          cover_image: string | null
          created_at: string
          id: string
          published: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: Database["public"]["Enums"]["post_category"]
          cover_image?: string | null
          created_at?: string
          id?: string
          published?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["post_category"]
          cover_image?: string | null
          created_at?: string
          id?: string
          published?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      post_translations: {
        Row: {
          content: Json | null
          description: string | null
          id: string
          language: Database["public"]["Enums"]["supported_language"]
          post_id: string
          title: string
        }
        Insert: {
          content?: Json | null
          description?: string | null
          id?: string
          language: Database["public"]["Enums"]["supported_language"]
          post_id: string
          title: string
        }
        Update: {
          content?: Json | null
          description?: string | null
          id?: string
          language?: Database["public"]["Enums"]["supported_language"]
          post_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_translations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_meta: {
        Row: {
          github_url: string | null
          live_demo_url: string | null
          post_id: string
          tech_stack: string[] | null
        }
        Insert: {
          github_url?: string | null
          live_demo_url?: string | null
          post_id: string
          tech_stack?: string[] | null
        }
        Update: {
          github_url?: string | null
          live_demo_url?: string | null
          post_id?: string
          tech_stack?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_meta_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
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
      post_category: "technology" | "project"
      supported_language: "ar" | "en" | "ru"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]