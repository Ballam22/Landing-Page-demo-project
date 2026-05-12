# Data Model: Public Landing Page

**Branch**: `010-public-landing-page` | **Date**: 2026-05-12

---

## Read-Only Tables (existing, no schema changes)

### `courses`
| Column         | Type    | Landing Page Use                        |
|----------------|---------|-----------------------------------------|
| id             | uuid    | Link to /courses/:id                    |
| title          | text    | Course card title                       |
| thumbnail_path | text    | Thumbnail image via Storage public URL  |
| category_id    | uuid FK | Category badge on course card           |
| price          | numeric | Price badge ("Free" or "€X.XX")         |
| status         | text    | Filter: `status = 'Published'` only     |
| sort_order     | int4    | ORDER BY sort_order ASC (up to 6)       |

### `categories`
| Column | Type | Landing Page Use                            |
|--------|------|---------------------------------------------|
| id     | uuid | Group courses by category                   |
| name   | text | Category card label + course card badge     |

### `reviews`
| Column     | Type  | Landing Page Use                          |
|------------|-------|-------------------------------------------|
| id         | uuid  | Key                                       |
| course_id  | uuid  | Join to courses for course title          |
| user_id    | uuid  | Join to users for name + avatar           |
| rating     | int2  | Star display + ORDER BY rating DESC       |
| comment    | text  | Testimonial body (optional)               |
| created_at | timestamptz | Tie-break for top 3 ORDER BY      |

### `users` (joined from reviews)
| Column     | Type | Landing Page Use                 |
|------------|------|----------------------------------|
| id         | uuid | Join key                         |
| full_name  | text | Reviewer name on testimonial     |
| avatar_url | text | Avatar image or initials fallback|

### `enrollments`
| Column  | Type | Landing Page Use                              |
|---------|------|-----------------------------------------------|
| user_id | uuid | Distinct count → "Total Students" stat        |

### `blog_posts`
| Column          | Type  | Landing Page Use                      |
|-----------------|-------|---------------------------------------|
| id              | uuid  | Key                                   |
| title           | text  | Blog card title                       |
| excerpt         | text  | Blog card preview text                |
| content         | text  | Fallback preview if no excerpt        |
| featured_image_path | text | Blog card image via Storage URL   |
| category_id     | uuid  | Badge (join categories)               |
| status          | text  | Filter: `status = 'Published'` only   |
| published_at    | timestamptz | ORDER BY DESC (latest 3)        |

---

## Required Supabase RLS Policies (setup task)

All policies grant the `anon` role read-only access:

```sql
-- courses (anonymous read)
CREATE POLICY "landing_courses_read" ON public.courses
  FOR SELECT TO anon USING (true);

-- categories (anonymous read)
CREATE POLICY "landing_categories_read" ON public.categories
  FOR SELECT TO anon USING (true);

-- reviews (anonymous read)
CREATE POLICY "landing_reviews_read" ON public.reviews
  FOR SELECT TO anon USING (true);

-- enrollments (anonymous read — count only)
CREATE POLICY "landing_enrollments_read" ON public.enrollments
  FOR SELECT TO anon USING (true);

-- blog_posts (anonymous read)
CREATE POLICY "landing_blog_posts_read" ON public.blog_posts
  FOR SELECT TO anon USING (true);

-- users (anonymous read — for review author names/avatars)
CREATE POLICY "landing_users_read" ON public.users
  FOR SELECT TO anon USING (true);
```

> Note: Check if `anon` access is already enabled per table before running — duplicate policies will error.

---

## Derived / Computed Values

### Platform Stats
Computed from DB queries:
```
totalCourses    = COUNT(*) FROM courses WHERE status = 'Published'
totalStudents   = COUNT(DISTINCT user_id) FROM enrollments
totalReviews    = COUNT(*) FROM reviews
publishedBlogs  = COUNT(*) FROM blog_posts WHERE status = 'Published'
```

### Category Course Count
```
courseCount[categoryId] = COUNT(*) FROM courses
  WHERE status = 'Published' AND category_id = categoryId
```

### Featured Courses Average Rating
Merged client-side from the ratings query (same as 009 implementation):
```
avgRating[courseId] = AVG(rating) FROM reviews WHERE course_id = courseId
```
Computed from the full reviews array fetched for stats (or a separate lightweight query).

---

## No New Tables

This feature is entirely read-only. No new tables, columns, or migrations are required beyond the RLS policies above.
