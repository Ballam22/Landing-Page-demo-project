-- Migration: 013_course_management
-- Creates: courses, sections, lessons, enrollments, lesson_progress

-- ============================================================
-- courses
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  description   TEXT,
  category_id   UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
  thumbnail_path TEXT,
  status        TEXT        NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
  sort_order    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_status      ON public.courses(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);

-- ============================================================
-- sections
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sections (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sections_course_id ON public.sections(course_id);

-- ============================================================
-- lessons
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  UUID        NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  video_path  TEXT,
  duration    INTEGER,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_free     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON public.lessons(section_id);

-- ============================================================
-- enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id   ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- ============================================================
-- lesson_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id   ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_courses_updated_at') THEN
    CREATE TRIGGER trg_courses_updated_at
      BEFORE UPDATE ON public.courses
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sections_updated_at') THEN
    CREATE TRIGGER trg_sections_updated_at
      BEFORE UPDATE ON public.sections
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lessons_updated_at') THEN
    CREATE TRIGGER trg_lessons_updated_at
      BEFORE UPDATE ON public.lessons
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
