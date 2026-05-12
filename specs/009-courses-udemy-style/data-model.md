# Data Model: Courses — Udemy-Style Curriculum, Pricing & Reviews

**Branch**: `009-courses-udemy-style` | **Date**: 2026-04-29

---

## Existing Tables (relevant fields only)

### `courses`
| Column          | Type        | Notes                                      |
|-----------------|-------------|--------------------------------------------|
| id              | uuid PK     |                                            |
| title           | text        |                                            |
| slug            | text unique |                                            |
| description     | text        | nullable                                   |
| category_id     | uuid FK     | → categories.id, nullable                  |
| thumbnail_path  | text        | nullable; Supabase Storage path            |
| status          | text        | 'Draft' \| 'Published' \| 'Archived'       |
| sort_order      | int4        | default 0                                  |
| **price**       | **numeric** | **new column — already added via SQL; default 0.00; null treated as 0.00** |
| created_at      | timestamptz |                                            |
| updated_at      | timestamptz |                                            |

### `sections`
| Column     | Type        | Notes                        |
|------------|-------------|------------------------------|
| id         | uuid PK     |                              |
| course_id  | uuid FK     | → courses.id CASCADE DELETE  |
| title      | text        |                              |
| sort_order | int4        |                              |
| created_at | timestamptz |                              |
| updated_at | timestamptz |                              |

### `lessons`
| Column      | Type        | Notes                         |
|-------------|-------------|-------------------------------|
| id          | uuid PK     |                               |
| section_id  | uuid FK     | → sections.id CASCADE DELETE  |
| title       | text        |                               |
| description | text        | nullable                      |
| video_path  | text        | nullable; private bucket path |
| duration    | int4        | nullable; seconds             |
| sort_order  | int4        |                               |
| is_free     | boolean     | default false                 |
| created_at  | timestamptz |                               |
| updated_at  | timestamptz |                               |

### `enrollments`
| Column      | Type        | Notes                    |
|-------------|-------------|--------------------------|
| id          | uuid PK     |                          |
| user_id     | uuid FK     | → users.id               |
| course_id   | uuid FK     | → courses.id             |
| enrolled_at | timestamptz | default now()            |
| completed_at| timestamptz | nullable                 |

### `lesson_progress`
| Column       | Type        | Notes                  |
|--------------|-------------|------------------------|
| id           | uuid PK     |                        |
| user_id      | uuid FK     | → users.id             |
| lesson_id    | uuid FK     | → lessons.id           |
| completed    | boolean     | default false          |
| completed_at | timestamptz | nullable               |

---

## New Table

### `reviews`
| Column     | Type        | Notes                                              |
|------------|-------------|----------------------------------------------------|
| id         | uuid PK     | default gen_random_uuid()                          |
| course_id  | uuid FK     | → courses.id ON DELETE CASCADE                     |
| user_id    | uuid FK     | → users.id (auth user UUID)                        |
| rating     | int2        | 1–5, NOT NULL, CHECK (rating >= 1 AND rating <= 5) |
| comment    | text        | nullable                                           |
| created_at | timestamptz | default now()                                      |

**Constraints**: UNIQUE (course_id, user_id) — one review per user per course.

**RLS Policies needed**:
```sql
-- Allow any authenticated user to read reviews
CREATE POLICY "reviews_read" ON public.reviews
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert their own review
CREATE POLICY "reviews_insert" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

---

## Derived / Computed Values

### Course Aggregate Rating
Computed client-side in `reviewService.ts` from fetched reviews:
```
avgRating = sum(reviews.rating) / reviews.length   → rounded to 1 decimal
reviewCount = reviews.length
```

### Section Summary (accordion header)
Computed client-side from fetched lessons for a section:
```
lessonCount = section.lessons.length
totalDuration = sum(lesson.duration ?? 0) across section.lessons   → seconds, formatted as "Xh Ym" or "Y min"
```

### Lesson Status (per current user)
Derived in the accordion component:
```
if (userIsEnrolled === false) → 'locked'
else if (lesson_progress row exists AND completed === true) → 'completed'
else → 'in-progress'
```

### Featured Course per Category (dashboard)
Queried in repository:
```sql
SELECT DISTINCT ON (category_id) *
FROM courses
WHERE status = 'Published' AND category_id IS NOT NULL
ORDER BY category_id, sort_order ASC
```

---

## Entity Relationships (summary)

```
categories ──────── course_id ────► courses
                                       │
                        ┌──────────────┼──────────────┐
                        ▼              ▼               ▼
                     sections      enrollments      reviews
                        │          (user_id,        (user_id,
                        │          course_id)        course_id,
                        ▼                            rating)
                     lessons
                        │
                        ▼
                  lesson_progress
                  (user_id, lesson_id, completed)
```
