# Type Contracts: Public Landing Page

**Branch**: `010-public-landing-page` | **Date**: 2026-05-12

---

## New Types (`src/app/pages/landing/model.ts`)

```ts
export type PublicCourse = {
  id: string
  title: string
  thumbnailUrl: string | undefined
  categoryId: string | undefined
  categoryName: string | undefined
  price: number
  avgRating: number        // 0 if no reviews
  status: string
}

export type PublicCategory = {
  id: string
  name: string
  courseCount: number
}

export type PublicReview = {
  id: string
  courseId: string
  courseTitle: string
  rating: number
  comment: string | undefined
  createdAt: string
  user: {
    fullName: string
    avatarUrl: string | undefined
  } | undefined
}

export type PublicBlogPost = {
  id: string
  title: string
  excerpt: string | undefined
  featuredImageUrl: string | undefined
  categoryName: string | undefined
  publishedAt: string | undefined
}

export type LandingStats = {
  totalCourses: number
  totalStudents: number
  totalReviews: number
  publishedBlogs: number
}
```

---

## Repository Contract (`src/app/pages/landing/landingRepository.ts`)

```ts
getPublicCourses(): Promise<PublicCourse[]>
  // SELECT published courses ordered by sort_order ASC LIMIT 6
  // Joins categories(id, name); merges avgRating from reviews aggregation

getPublicCategories(): Promise<PublicCategory[]>
  // SELECT all categories; for each, COUNT published courses
  // Returns array ordered by name ASC

getLandingStats(): Promise<LandingStats>
  // COUNT published courses, COUNT DISTINCT user_id from enrollments,
  // COUNT reviews, COUNT published blog_posts

getTopReviews(): Promise<PublicReview[]>
  // SELECT top 3 reviews ORDER BY rating DESC, created_at DESC
  // Joins users(full_name, avatar_url), courses(title)

getLatestBlogPosts(): Promise<PublicBlogPost[]>
  // SELECT 3 most recent published blog_posts ORDER BY published_at DESC
  // Joins categories(name); maps featured_image_path → public URL
```

---

## Component Props

### `LandingHero`
```ts
// No props — static content + Link navigation
```

### `LandingCourseCard`
```ts
type Props = {
  course: PublicCourse
}
```

### `LandingCategoryCard`
```ts
type Props = {
  category: PublicCategory
}
```

### `LandingStatsBar`
```ts
type Props = {
  stats: LandingStats
  isLoading: boolean
}
```

### `LandingBlogCard`
```ts
type Props = {
  post: PublicBlogPost
}
```

### `LandingReviewCard`
```ts
type Props = {
  review: PublicReview
}
```

### `LandingFooter`
```ts
// No props — static content + Link navigation
```

---

## i18n Keys (new — `LANDING.*`)

```
LANDING.PLATFORM_NAME          "LearnHub"
LANDING.TAGLINE                "Expand your skills, advance your career."
LANDING.HERO_HEADLINE          "Learn Without Limits"
LANDING.HERO_SUBHEADLINE       "Explore hundreds of courses taught by industry experts."
LANDING.BROWSE_COURSES         "Browse Courses"
LANDING.SIGN_IN                "Sign In"
LANDING.FEATURED_COURSES       "Featured Courses"
LANDING.VIEW_ALL_COURSES       "View All Courses"
LANDING.NO_COURSES             "No courses available yet."
LANDING.CATEGORIES_TITLE       "Browse by Category"
LANDING.COURSES_COUNT          "{count} courses"
LANDING.STATS_TOTAL_COURSES    "Total Courses"
LANDING.STATS_STUDENTS         "Students Enrolled"
LANDING.STATS_REVIEWS          "Reviews"
LANDING.STATS_BLOGS            "Blog Posts"
LANDING.LATEST_BLOGS           "Latest from the Blog"
LANDING.NO_BLOGS               "No posts available yet."
LANDING.READ_MORE              "Read More"
LANDING.TESTIMONIALS_TITLE     "What Our Students Say"
LANDING.FOOTER_TAGLINE         "Expand your skills, advance your career."
LANDING.FOOTER_HOME            "Home"
LANDING.FOOTER_SIGN_IN         "Sign In"
LANDING.FOOTER_COPYRIGHT       "© {year} LearnHub. All rights reserved."
LANDING.FREE                   "Free"
LANDING.PRICE_FORMAT           "€{price}"
```
