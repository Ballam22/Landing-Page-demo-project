export type Enrollment = {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  completedAt: string | undefined
  progressPercent: number
  user?: {id: string; fullName: string; email: string}
  course?: {id: string; title: string}
}

export type EnrollUserFormValues = {
  userId: string
  courseId: string
}

export const ENROLL_USER_FORM_DEFAULTS: EnrollUserFormValues = {
  userId: '',
  courseId: '',
}
