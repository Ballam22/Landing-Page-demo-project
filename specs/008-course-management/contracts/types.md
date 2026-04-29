# TypeScript Interface Contracts: Course Management (008)

These are the authoritative type definitions that all layers (model, repository, service, controller, components) must conform to.

---

## Core Models (`src/app/modules/course-management/model/`)

### `Course.ts`

```typescript
export type CourseStatus = 'Draft' | 'Published' | 'Archived'

export type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  thumbnail_path: string | null
  thumbnail_url: string | null  // Derived: public URL from storage, not stored in DB
  status: CourseStatus
  sort_order: number
  created_at: string
  updated_at: string
  category?: { id: string; name: string }  // Joined on fetch
}

export type CourseFormValues = {
  title: string
  slug: string
  description: string
  category_id: string
  thumbnail_file: File | null
  status: CourseStatus
  sort_order: number
}
```

### `Section.ts`

```typescript
export type Section = {
  id: string
  course_id: string
  title: string
  sort_order: number
  created_at: string
  updated_at: string
  lessons?: Lesson[]  // Joined on fetch
}

export type SectionFormValues = {
  title: string
  sort_order: number
}
```

### `Lesson.ts`

```typescript
export type Lesson = {
  id: string
  section_id: string
  title: string
  description: string | null
  video_path: string | null
  video_signed_url: string | null  // Generated fresh on load, not stored
  duration: number | null          // Seconds
  sort_order: number
  is_free: boolean
  created_at: string
  updated_at: string
}

export type LessonFormValues = {
  title: string
  description: string
  video_file: File | null
  duration: number | null
  sort_order: number
  is_free: boolean
}
```

### `Enrollment.ts`

```typescript
export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  completed_at: string | null
  progress_percent: number  // Computed: 0–100
  user?: { id: string; full_name: string; email: string }
  course?: { id: string; title: string }
}

export type EnrollUserFormValues = {
  user_id: string
  course_id: string
}
```

### `LessonProgress.ts`

```typescript
export type LessonProgress = {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
}
```

---

## Repository Contracts (`src/app/modules/course-management/repository/`)

### `courseRepository.ts`

```typescript
getCourses(): Promise<Course[]>
getCourseById(id: string): Promise<Course>
createCourse(data: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'thumbnail_url' | 'category'>): Promise<Course>
updateCourse(id: string, data: Partial<Course>): Promise<Course>
deleteCourse(id: string): Promise<void>  // Throws if enrollments exist
slugExists(slug: string, excludeId?: string): Promise<boolean>
uploadThumbnail(courseId: string, file: File): Promise<string>  // Returns storage path
getPublicThumbnailUrl(path: string): string
```

### `sectionRepository.ts`

```typescript
getSectionsByCourse(courseId: string): Promise<Section[]>
createSection(data: Omit<Section, 'id' | 'created_at' | 'updated_at' | 'lessons'>): Promise<Section>
updateSection(id: string, data: Partial<SectionFormValues>): Promise<Section>
deleteSection(id: string): Promise<void>
reorderSections(courseId: string, orderedIds: string[]): Promise<void>
```

### `lessonRepository.ts`

```typescript
getLessonsBySection(sectionId: string): Promise<Lesson[]>
createLesson(data: Omit<Lesson, 'id' | 'created_at' | 'updated_at' | 'video_signed_url'>): Promise<Lesson>
updateLesson(id: string, data: Partial<LessonFormValues & { video_path?: string }>): Promise<Lesson>
deleteLesson(id: string): Promise<void>
reorderLessons(sectionId: string, orderedIds: string[]): Promise<void>
uploadVideo(lessonId: string, file: File): Promise<string>   // Returns storage path
getSignedVideoUrl(path: string): Promise<string>             // Expires in 3600s
```

### `enrollmentRepository.ts`

```typescript
getEnrollments(): Promise<Enrollment[]>
enrollUser(data: EnrollUserFormValues): Promise<Enrollment>
removeEnrollment(id: string): Promise<void>
getProgressPercent(enrollmentId: string): Promise<number>
```

---

## Controller Contracts (`src/app/modules/course-management/controller/`)

All controllers return React Query `UseQueryResult` / `UseMutationResult` shaped objects. Components must not call repositories directly.

```typescript
// useCourseController.ts
useCourses(): UseQueryResult<Course[]>
useCourse(id: string): UseQueryResult<Course>
useCreateCourse(): UseMutationResult<Course, Error, CourseFormValues>
useUpdateCourse(): UseMutationResult<Course, Error, { id: string } & CourseFormValues>
useDeleteCourse(): UseMutationResult<void, Error, string>

// useSectionController.ts
useSections(courseId: string): UseQueryResult<Section[]>
useCreateSection(): UseMutationResult<Section, Error, SectionFormValues & { course_id: string }>
useUpdateSection(): UseMutationResult<Section, Error, { id: string } & SectionFormValues>
useDeleteSection(): UseMutationResult<void, Error, string>
useReorderSections(): UseMutationResult<void, Error, { courseId: string; orderedIds: string[] }>

// useLessonController.ts
useLessons(sectionId: string): UseQueryResult<Lesson[]>
useCreateLesson(): UseMutationResult<Lesson, Error, LessonFormValues & { section_id: string }>
useUpdateLesson(): UseMutationResult<Lesson, Error, { id: string } & LessonFormValues>
useDeleteLesson(): UseMutationResult<void, Error, string>
useReorderLessons(): UseMutationResult<void, Error, { sectionId: string; orderedIds: string[] }>

// useEnrollmentController.ts
useEnrollments(): UseQueryResult<Enrollment[]>
useEnrollUser(): UseMutationResult<Enrollment, Error, EnrollUserFormValues>
useRemoveEnrollment(): UseMutationResult<void, Error, string>
```
