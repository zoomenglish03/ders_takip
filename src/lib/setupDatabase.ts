import { supabase } from './supabase';

export async function setupDatabase() {
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS classes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      total_lessons integer NOT NULL DEFAULT 0,
      phone_number text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS students (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
      name text NOT NULL,
      phone_number text,
      created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
      lesson_date date NOT NULL DEFAULT CURRENT_DATE,
      subject text NOT NULL,
      notes text DEFAULT '',
      created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
      message text NOT NULL,
      sent_at timestamptz DEFAULT now(),
      status text NOT NULL DEFAULT 'pending'
    );

    ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE students ENABLE ROW LEVEL SECURITY;
    ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view classes' AND tablename = 'classes') THEN
        CREATE POLICY "Public can view classes" ON classes FOR SELECT TO public USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert classes' AND tablename = 'classes') THEN
        CREATE POLICY "Public can insert classes" ON classes FOR INSERT TO public WITH CHECK (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can update classes' AND tablename = 'classes') THEN
        CREATE POLICY "Public can update classes" ON classes FOR UPDATE TO public USING (true) WITH CHECK (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can delete classes' AND tablename = 'classes') THEN
        CREATE POLICY "Public can delete classes" ON classes FOR DELETE TO public USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view students' AND tablename = 'students') THEN
        CREATE POLICY "Public can view students" ON students FOR SELECT TO public USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert students' AND tablename = 'students') THEN
        CREATE POLICY "Public can insert students" ON students FOR INSERT TO public WITH CHECK (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can update students' AND tablename = 'students') THEN
        CREATE POLICY "Public can update students" ON students FOR UPDATE TO public USING (true) WITH CHECK (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can delete students' AND tablename = 'students') THEN
        CREATE POLICY "Public can delete students" ON students FOR DELETE TO public USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view lessons' AND tablename = 'lessons') THEN
        CREATE POLICY "Public can view lessons" ON lessons FOR SELECT TO public USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert lessons' AND tablename = 'lessons') THEN
        CREATE POLICY "Public can insert lessons" ON lessons FOR INSERT TO public WITH CHECK (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can update lessons' AND tablename = 'lessons') THEN
        CREATE POLICY "Public can update lessons" ON lessons FOR UPDATE TO public USING (true) WITH CHECK (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can delete lessons' AND tablename = 'lessons') THEN
        CREATE POLICY "Public can delete lessons" ON lessons FOR DELETE TO public USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Public can view notifications" ON notifications FOR SELECT TO public USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Public can insert notifications" ON notifications FOR INSERT TO public WITH CHECK (true);
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON lessons(class_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons(lesson_date);
    CREATE INDEX IF NOT EXISTS idx_notifications_class_id ON notifications(class_id);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSql });

    if (error) {
      console.error('Database setup error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Database setup error:', error);
    return { success: false, error };
  }
}
