export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string
          name: string
          total_lessons: number
          phone_number: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          total_lessons?: number
          phone_number: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          total_lessons?: number
          phone_number?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          class_id: string
          name: string
          phone_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          phone_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          phone_number?: string | null
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          class_id: string
          lesson_date: string
          subject: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          lesson_date?: string
          subject: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          lesson_date?: string
          subject?: string
          notes?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          class_id: string
          message: string
          sent_at: string
          status: string
        }
        Insert: {
          id?: string
          class_id: string
          message: string
          sent_at?: string
          status?: string
        }
        Update: {
          id?: string
          class_id?: string
          message?: string
          sent_at?: string
          status?: string
        }
      }
    }
  }
}
