# Data Model: Course Management Module (008)

## Entity Overview

```
categories (existing)
    │
    └─< courses
            │
            └─< sections
                    │
                    └─< lessons
                            │
                            └─< lesson_progress >─── users (existing)
            │
enrollments >────────────────────────────────────── users (existing)
```

---

## Table Definitions

### `courses`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| title | TEXT | NOT NULL | |
| slug | TEXT | NOT NULL, UNIQUE | URL-safe, auto-generated from title |
| description | TEXT | nullable | |
| category_id | UUID | FK → categories(id), nullable | |
| thumbnail_path | TEXT | nullable | Storage path in `course-thumbnails` bucket |
| status | TEXT | NOT NULL, DEFAULT 'Draft' | CHECK IN ('Draft','Published','Archived') |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_courses_status`, `idx_courses_slug` (UNIQUE), `idx_courses_category_id`

**Deletion rule**: BLOCKED if any enrollment references this course (checked in service layer before DELETE).

---

### `sections`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| course_id | UUID | NOT NULL, FK → courses(id) ON DELETE CASCADE | |
| title | TEXT | NOT NULL | |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_sections_course_id`

**Deletion rule**: CASCADE deletes lessons → CASCADE deletes lesson_progress.

---

### `lessons`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| section_id | UUID | NOT NULL, FK → sections(id) ON DELETE CASCADE | |
| title | TEXT | NOT NULL | |
| description | TEXT | nullable | |
| video_path | TEXT | nullable | Storage path in `course-videos` private bucket |
| duration | INTEGER | nullable | Duration in seconds |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | |
| is_free | BOOLEAN | NOT NULL, DEFAULT false | Free preview flag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_lessons_section_id`

**Video access**: Never expose `video_path` directly. Always generate a signed URL via `supabase.storage.from('course-videos').createSignedUrl(video_path, 3600)` on load.

---

### `enrollments`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | NOT NULL, FK → users(id) | |
| course_id | UUID | NOT NULL, FK → courses(id) ON DELETE RESTRICT | |
| enrolled_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| completed_at | TIMESTAMPTZ | nullable | Set when all lessons completed |

**Unique constraint**: `(user_id, course_id)`

**Indexes**: `idx_enrollments_user_id`, `idx_enrollments_course_id`

**Progress**: Computed on read as `COUNT(lesson_progress WHERE completed=true) / COUNT(lessons in course) * 100`.

---

### `lesson_progress`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | NOT NULL, FK → users(id) | |
| lesson_id | UUID | NOT NULL, FK → lessons(id) ON DELETE CASCADE | |
| completed | BOOLEAN | NOT NULL, DEFAULT false | |
| completed_at | TIMESTAMPTZ | nullable | Set when completed = true |

**Unique constraint**: `(user_id, lesson_id)`

**Indexes**: `idx_lesson_progress_user_id`, `idx_lesson_progress_lesson_id`

---

## Storage Buckets

| Bucket | Access | Upload Path Pattern | URL Retrieval |
|---|---|---|---|
| `course-thumbnails` | Public | `{courseId}/{filename}` | `getPublicUrl(path)` |
| `course-videos` | Private | `{lessonId}/{filename}` | `createSignedUrl(path, 3600)` |

---

## State Transitions

### Course Status

```
Draft ──► Published ──► Archived
  ▲            │
  └────────────┘  (can revert to Draft)
```

---

## Migration File

Filename: `migrations/013_course_management.sql`

Covers:
1. `CREATE TABLE courses` with constraints and indexes
2. `CREATE TABLE sections` with FK and cascade
3. `CREATE TABLE lessons` with FK and cascade
4. `CREATE TABLE enrollments` with unique constraint
5. `CREATE TABLE lesson_progress` with unique constraint
6. RLS policies (if Supabase RLS is enabled for admin-only access)
7. `updated_at` trigger for `courses`, `sections`, `lessons`
