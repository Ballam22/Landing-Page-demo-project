import type {Review, ReviewFormValues, CourseRatingSummary} from '../model/Review'
import {
  getReviewsByCourse,
  createReview,
  getUserReviewForCourse,
} from '../repository/reviewRepository'

export async function fetchReviews(courseId: string): Promise<Review[]> {
  return getReviewsByCourse(courseId)
}

export async function fetchUserReview(
  courseId: string,
  userId: string
): Promise<Review | null> {
  return getUserReviewForCourse(courseId, userId)
}

export async function submitReview(
  courseId: string,
  userId: string,
  values: ReviewFormValues
): Promise<Review> {
  return createReview(courseId, userId, values)
}

export function computeRatingSummary(reviews: Review[]): CourseRatingSummary {
  if (reviews.length === 0) return {avgRating: 0, reviewCount: 0}
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return {
    avgRating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  }
}
