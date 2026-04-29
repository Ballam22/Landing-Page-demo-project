export type Lesson = {
  id: string
  sectionId: string
  title: string
  description: string | undefined
  videoPath: string | undefined
  videoSignedUrl: string | undefined
  duration: number | undefined
  sortOrder: number
  isFree: boolean
  createdAt: string
  updatedAt: string
}

export type LessonFormValues = {
  title: string
  description: string
  videoFile: File | null
  duration: number | undefined
  sortOrder: number
  isFree: boolean
}

export const LESSON_FORM_DEFAULTS: LessonFormValues = {
  title: '',
  description: '',
  videoFile: null,
  duration: undefined,
  sortOrder: 0,
  isFree: false,
}
