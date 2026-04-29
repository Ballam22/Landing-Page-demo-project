# Quickstart: Course Management Module (008)

## Prerequisites

- Supabase project running with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Existing `categories` and `users` tables

## Step 1: Run the Migration

In the Supabase SQL Editor, run `migrations/013_course_management.sql`.

This creates: `courses`, `sections`, `lessons`, `enrollments`, `lesson_progress` tables with all indexes and cascade rules.

## Step 2: Create Storage Buckets

In the Supabase dashboard → Storage:

1. Create bucket **`course-thumbnails`** — set to **Public**
2. Create bucket **`course-videos`** — set to **Private**

## Step 3: Add Routes

In `src/app/routing/PrivateRoutes.tsx`, add lazy-loaded routes:

```tsx
const CourseManagementPage = React.lazy(() =>
  import('../modules/course-management/CourseManagementPage')
)

// Inside the Demo1 layout route group:
<Route path='course-management/*' element={<CourseManagementPage />} />
```

## Step 4: Add Sidebar Entry

In `src/_metronic/layout/components/sidebar/sidebar-menu/SidebarMenuMain.tsx`, add a menu item pointing to `/course-management`.

## Step 5: Add i18n Keys

Add the following keys to each locale file under `src/_metronic/i18n/`:

```
COURSE_MANAGEMENT.TITLE
COURSE_MANAGEMENT.COURSES.LIST_TITLE
COURSE_MANAGEMENT.COURSES.ADD
COURSE_MANAGEMENT.COURSES.EDIT
COURSE_MANAGEMENT.COURSES.DELETE_CONFIRM
COURSE_MANAGEMENT.SECTIONS.TITLE
COURSE_MANAGEMENT.LESSONS.TITLE
COURSE_MANAGEMENT.ENROLLMENTS.TITLE
COURSE_MANAGEMENT.ENROLLMENTS.ENROLL_USER
```

## Step 6: Verify

1. Navigate to `/course-management` — course list page loads.
2. Click "Add Course" — form opens, thumbnail uploads, save creates a row.
3. Open the course edit page — sections and lessons panel visible.
4. Add a lesson with a video — playback uses signed URL, download button absent.
5. Navigate to Enrollment Management — enroll a user, verify progress % shows.

## Module Source Layout

```
src/app/modules/course-management/
├── model/
│   ├── Course.ts
│   ├── Section.ts
│   ├── Lesson.ts
│   ├── Enrollment.ts
│   └── LessonProgress.ts
├── repository/
│   ├── courseRepository.ts
│   ├── sectionRepository.ts
│   ├── lessonRepository.ts
│   └── enrollmentRepository.ts
├── service/
│   ├── courseService.ts
│   ├── sectionService.ts
│   ├── lessonService.ts
│   └── enrollmentService.ts
├── controller/
│   ├── useCourseController.ts
│   ├── useSectionController.ts
│   ├── useLessonController.ts
│   └── useEnrollmentController.ts
├── course-list/
│   ├── CourseListPage.tsx
│   └── components/
│       ├── CoursesTable.tsx
│       └── DeleteCourseDialog.tsx
├── course-form/
│   ├── CourseFormPage.tsx
│   └── components/
│       ├── CourseFormFields.tsx
│       └── ThumbnailUpload.tsx
├── section-lesson/
│   └── components/
│       ├── SectionList.tsx
│       ├── SectionForm.tsx
│       ├── LessonList.tsx
│       ├── LessonForm.tsx
│       └── VideoPlayer.tsx
├── enrollment/
│   ├── EnrollmentPage.tsx
│   └── components/
│       ├── EnrollmentsTable.tsx
│       └── EnrollUserModal.tsx
├── CourseManagementPage.tsx
└── CourseManagement.css
```
