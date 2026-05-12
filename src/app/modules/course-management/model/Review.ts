export type Review = {
  id: string
  courseId: string
  userId: string
  rating: number
  comment: string | undefined
  createdAt: string
  user?: {
    id: string
    fullName: string
    avatarUrl: string | undefined
  }
}

export type ReviewFormValues = {
  rating: number
  comment: string
}

export const REVIEW_FORM_DEFAULTS: ReviewFormValues = {
  rating: 0,
  comment: '',
}

export type CourseRatingSummary = {
  avgRating: number
  reviewCount: number
}
