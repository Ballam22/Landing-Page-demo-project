import type {PublicReview} from '../model'
import {StarRating} from '../../../modules/course-management/section-lesson/components/StarRating'

type Props = {review: PublicReview}

export function LandingReviewCard({review}: Props) {
  const initials = review.user?.fullName
    ? review.user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div className='card landing-review-card border-0 shadow-sm p-5'>
      <div className='d-flex align-items-center gap-3 mb-4'>
        {review.user?.avatarUrl ? (
          <img
            src={review.user.avatarUrl}
            alt={review.user.fullName}
            className='rounded-circle'
            style={{width: 44, height: 44, objectFit: 'cover'}}
          />
        ) : (
          <div className='landing-avatar-initials'>{initials}</div>
        )}
        <div>
          <div className='fw-bold fs-6 text-dark'>{review.user?.fullName ?? 'Anonymous'}</div>
          <div className='text-muted fs-8'>{review.courseTitle}</div>
        </div>
      </div>
      <StarRating value={review.rating} />
      {review.comment && <p className='text-muted fs-7 mt-3 mb-0'>{review.comment}</p>}
    </div>
  )
}
