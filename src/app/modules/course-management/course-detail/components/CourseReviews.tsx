import {useIntl} from 'react-intl'
import {useReviewController} from '../../controller/useReviewController'
import {StarRating} from '../../section-lesson/components/StarRating'
import {ReviewForm} from './ReviewForm'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type CourseReviewsProps = {
  courseId: string
  currentUserId: string | undefined
  isEnrolled: boolean
}

export function CourseReviews({courseId, currentUserId, isEnrolled}: CourseReviewsProps) {
  const intl = useIntl()
  const {reviews, ratingSummary, isLoading, error, userReview, submitReview, submitting} =
    useReviewController(courseId, currentUserId)

  if (isLoading) {
    return (
      <div className='card'>
        <div className='card-body d-flex justify-content-center py-10'>
          <span className='spinner-border text-primary' />
        </div>
      </div>
    )
  }

  return (
    <div className='card'>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title fw-bolder'>
          {intl.formatMessage({id: 'COURSE_DETAIL.REVIEWS_TITLE'})}
        </h3>
      </div>
      <div className='card-body pt-0'>
        {error && <div className='alert alert-danger mb-5'>{error.message}</div>}

        {ratingSummary.reviewCount > 0 && (
          <div className='d-flex align-items-center gap-3 mb-6 p-4 bg-light rounded'>
            <span className='fs-2 fw-bolder text-gray-900'>
              {ratingSummary.avgRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(ratingSummary.avgRating)} />
            <span className='text-muted'>
              {intl.formatMessage(
                {id: 'COURSE_DETAIL.AGGREGATE_LABEL'},
                {avg: ratingSummary.avgRating.toFixed(1), count: ratingSummary.reviewCount}
              )}
            </span>
          </div>
        )}

        {isEnrolled && !userReview && (
          <div className='mb-8'>
            <ReviewForm onSubmit={submitReview} submitting={submitting} />
          </div>
        )}

        {isEnrolled && userReview && (
          <div className='alert alert-success mb-6'>
            {intl.formatMessage({id: 'COURSE_DETAIL.THANK_YOU_REVIEW'})}
          </div>
        )}

        {reviews.length === 0 ? (
          <p className='text-muted py-4'>
            {intl.formatMessage({id: 'COURSE_DETAIL.NO_REVIEWS'})}
          </p>
        ) : (
          <div className='d-flex flex-column gap-5'>
            {reviews.map((review) => (
              <div key={review.id} className='d-flex gap-4'>
                <div className='symbol symbol-circle symbol-40px flex-shrink-0'>
                  {review.user?.avatarUrl ? (
                    <div className='symbol-label'>
                      <img
                        src={review.user.avatarUrl}
                        alt={review.user.fullName}
                        className='w-100'
                      />
                    </div>
                  ) : (
                    <div className='symbol-label fw-bold bg-light-primary text-primary'>
                      {review.user ? getInitials(review.user.fullName) : '?'}
                    </div>
                  )}
                </div>
                <div className='flex-grow-1'>
                  <div className='d-flex align-items-center gap-3 mb-1'>
                    <span className='fw-bold text-gray-900'>
                      {review.user?.fullName ?? 'Anonymous'}
                    </span>
                    <StarRating value={review.rating} />
                    <span className='text-muted fs-7'>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className='text-gray-700 mb-0'>{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
