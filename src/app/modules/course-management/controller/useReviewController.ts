import {useMutation, useQuery, useQueryClient} from 'react-query'
import type {Review, ReviewFormValues, CourseRatingSummary} from '../model/Review'
import {fetchReviews, fetchUserReview, submitReview, computeRatingSummary} from '../service/reviewService'

export type UseReviewControllerResult = {
  reviews: Review[]
  ratingSummary: CourseRatingSummary
  isLoading: boolean
  error: Error | null
  userReview: Review | null
  submitReview: (values: ReviewFormValues) => Promise<void>
  submitting: boolean
}

export function useReviewController(
  courseId: string,
  currentUserId: string | undefined
): UseReviewControllerResult {
  const queryClient = useQueryClient()

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery(
    ['reviews', courseId],
    () => fetchReviews(courseId),
    {staleTime: 0, enabled: !!courseId}
  )

  const {data: userReview = null, isLoading: userReviewLoading} = useQuery(
    ['user-review', courseId, currentUserId],
    () => fetchUserReview(courseId, currentUserId!),
    {staleTime: 0, enabled: !!courseId && !!currentUserId}
  )

  const ratingSummary = computeRatingSummary(reviews)

  const submitMutation = useMutation(
    (values: ReviewFormValues) => submitReview(courseId, currentUserId!, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', courseId])
        queryClient.invalidateQueries(['user-review', courseId, currentUserId])
      },
    }
  )

  return {
    reviews,
    ratingSummary,
    isLoading: reviewsLoading || userReviewLoading,
    error: (reviewsError as Error | null) ?? null,
    userReview,
    submitReview: (values) => submitMutation.mutateAsync(values).then(() => undefined),
    submitting: submitMutation.isLoading,
  }
}
