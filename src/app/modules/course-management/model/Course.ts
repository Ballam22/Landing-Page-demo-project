export type CourseStatus = 'Draft' | 'Published' | 'Archived'

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
  createdAt: string
  updatedAt: string
  category?: {id: string; name: string}
}

export type CourseFormValues = {
  title: string
  slug: string
  description: string
  categoryId: string
  thumbnailFile: File | null
  status: CourseStatus
  sortOrder: number
}

export const COURSE_FORM_DEFAULTS: CourseFormValues = {
  title: '',
  slug: '',
  description: '',
  categoryId: '',
  thumbnailFile: null,
  status: 'Draft',
  sortOrder: 0,
}
