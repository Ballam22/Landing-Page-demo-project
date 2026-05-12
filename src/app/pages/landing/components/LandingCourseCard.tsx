import {useIntl} from 'react-intl'
import type {PublicCourse} from '../model'
import {StarRating} from '../../../modules/course-management/section-lesson/components/StarRating'

type Props = {course: PublicCourse}

export function LandingCourseCard({course}: Props) {
  const intl = useIntl()
  return (
    <div className='card landing-course-card border-0 shadow-sm'>
      {course.thumbnailUrl ? (
        <img src={course.thumbnailUrl} alt={course.title} className='landing-course-thumb' />
      ) : (
        <div className='landing-course-thumb-placeholder'>
          <i className='ki-duotone ki-book fs-2x text-muted'>
            <span className='path1' />
            <span className='path2' />
          </i>
        </div>
      )}
      <div className='card-body d-flex flex-column gap-2 p-4'>
        {course.categoryName && (
          <span className='badge badge-light-primary fw-semibold fs-8'>{course.categoryName}</span>
        )}
        <div className='fw-bold fs-6 text-dark lh-sm'>{course.title}</div>
        <div className='d-flex align-items-center justify-content-between mt-auto pt-2'>
          <StarRating value={course.avgRating} />
          <span className='badge badge-light-success fw-bold'>
            {course.price === 0
              ? intl.formatMessage({id: 'LANDING.FREE'})
              : intl.formatMessage({id: 'LANDING.PRICE_FORMAT'}, {price: course.price.toFixed(2)})}
          </span>
        </div>
      </div>
    </div>
  )
}
