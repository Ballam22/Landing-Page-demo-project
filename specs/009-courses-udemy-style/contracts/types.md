# Type Contracts: Courses — Udemy-Style Curriculum, Pricing & Reviews

**Branch**: `009-courses-udemy-style` | **Date**: 2026-04-29

---

## Updated Types

### `Course` (update `src/app/modules/course-management/model/Course.ts`)

Add `price` field:

```ts
export type Course = {
  id: string
  title: string
  slug: string
  description: string | undefined
  categoryId: string | undefined
  thumbnailPath: string | undefined
  thumbnailUrl: string | undefined
  status: CourseStatus
  sortOrder: number
  price: number                          // ← NEW; null DB value mapped to 0
  createdAt: string
  updatedAt: string
  category?: {id: string; name: string}
  avgRating?: number                     // ← NEW optional; computed from reviews
  reviewCount?: number                   // ← NEW optional; computed from reviews
}

export type CourseFormValues = {
  title: string
  slug: string
  description: string
  categoryId: string
  thumbnailFile: File | null
  status: CourseStatus
  sortOrder: number
  price: number                          // ← NEW
}

export const COURSE_FORM_DEFAULTS: CourseFormValues = {
  title: '',
  slug: '',
  description: '',
  categoryId: '',
  thumbnailFile: null,
  status: 'Draft',
  sortOrder: 0,
  price: 0,                              // ← NEW
}
```

---

## New Types

### `Review` (`src/app/modules/course-management/model/Review.ts`)

```ts
export type Review = {
  id: string
  courseId: string
  userId: string
  rating: number          // 1–5
  comment: string | undefined
  createdAt: string
  user?: {
    id: string
    fullName: string
    avatarUrl: string | undefined
  }
}

export type ReviewFormValues = {
  rating: number          // 1–5
  comment: string
}

export const REVIEW_FORM_DEFAULTS: ReviewFormValues = {
  rating: 0,
  comment: '',
}

export type CourseRatingSummary = {
  avgRating: number       // rounded to 1 decimal
  reviewCount: number
}
```

---

## Repository Contracts

### `reviewRepository.ts`

```ts
getReviewsByCourse(courseId: string): Promise<Review[]>
  // Joins users(id, full_name, avatar_url); orders by created_at DESC

createReview(courseId: string, userId: string, values: ReviewFormValues): Promise<Review>
  // Inserts into reviews; select with user join on return

getUserReviewForCourse(courseId: string, userId: string): Promise<Review | null>
  // Returns null if not found (no error)

getAverageRatingsByCourse(): Promise<{courseId: string; avgRating: number; reviewCount: number}[]>
  // Fetches all reviews, groups and aggregates client-side
```

### `courseRepository.ts` (additions)

```ts
getCourseWithSections(courseId: string): Promise<Course & {sections: (Section & {lessons: Lesson[]})[]}>
  // Used by CourseDetailPage — single query for course + sections + lessons

getFeaturedCoursesByCategory(): Promise<{category: {id: string; name: string}; course: Course | null}[]>
  // Returns one published course per category (lowest sort_order); course null if category has none
```

---

## Controller Contracts

### `useCourseDetailController(courseId: string)`

```ts
export type UseCourseDetailResult = {
  course: (Course & {sections: (Section & {lessons: Lesson[]})[]}) | undefined
  isLoading: boolean
  error: Error | null
  isEnrolled: boolean
  enroll: () => Promise<void>
  enrolling: boolean
}
```

### `useReviewController(courseId: string)`

```ts
export type UseReviewControllerResult = {
  reviews: Review[]
  ratingSummary: CourseRatingSummary
  isLoading: boolean
  error: Error | null
  userReview: Review | null           // null = not yet reviewed
  submitReview: (values: ReviewFormValues) => Promise<void>
  submitting: boolean
}
```

---

## Component Props

### `CourseAccordion`

```ts
type Props = {
  sections: (Section & {lessons: Lesson[]})[]
  lessonProgress: LessonProgress[]    // for the current user; empty if not enrolled
  isEnrolled: boolean
}
```

### `CoursePricingCTA`

```ts
type Props = {
  price: number
  isEnrolled: boolean
  onEnroll: () => Promise<void>
  enrolling: boolean
}
```

### `StarRating`

```ts
type Props = {
  value: number           // current rating (0 = none selected)
  max?: number            // default 5
  interactive?: boolean   // false = display only
  onChange?: (rating: number) => void
}
```

### `ReviewForm`

```ts
type Props = {
  onSubmit: (values: ReviewFormValues) => Promise<void>
  submitting: boolean
}
```

### `CourseReviews`

```ts
type Props = {
  courseId: string
  currentUserId: string | undefined
  isEnrolled: boolean
}
// Internally uses useReviewController
```

### `FeaturedCategoryCard`

```ts
type Props = {
  category: {id: string; name: string}
  course: Course | null              // null = show placeholder
}
```
