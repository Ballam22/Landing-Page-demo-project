import {Link} from 'react-router-dom'
import {useIntl} from 'react-intl'
import type {Course} from '../../model/Course'
import {StarRating} from '../../section-lesson/components/StarRating'

type FeaturedCategoryCardProps = {
  category: {id: string; name: string}
  course: Course | null
}

export function FeaturedCategoryCard({category, course}: FeaturedCategoryCardProps) {
  const intl = useIntl()

  return (
    <div className='card h-100'>
      {course ? (
        <>
          {course.thumbnailUrl ? (
            <div
              className='card-img-top'
              style={{
                height: 140,
                backgroundImage: `url(${course.thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <div
              className='card-img-top d-flex align-items-center justify-content-center bg-light-primary'
              style={{height: 140}}
            >
              <span className='fs-1 fw-bolder text-primary'>
                {category.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className='card-body d-flex flex-column'>
            <span className='badge badge-light-secondary mb-2 align-self-start'>
              {category.name}
            </span>
            <h5 className='card-title fw-bold mb-2'>
              <Link to={`/courses/${course.id}`} className='text-gray-900 text-hover-primary'>
                {course.title}
              </Link>
            </h5>
            <div className='d-flex align-items-center gap-2 mt-auto'>
              <StarRating value={Math.round(course.avgRating ?? 0)} />
              <span
                className={`badge ms-auto ${
                  course.price === 0 ? 'badge-light-success' : 'badge-light-primary'
                }`}
              >
                {course.price === 0
                  ? intl.formatMessage({id: 'COURSE_DETAIL.FREE'})
                  : intl.formatMessage(
                      {id: 'COURSE_DETAIL.PRICE_FORMAT'},
                      {price: course.price.toFixed(2)}
                    )}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className='card-body d-flex flex-column align-items-center justify-content-center py-10'>
          <span className='badge badge-light-secondary mb-3'>{category.name}</span>
          <p className='text-muted mb-0 text-center'>
            {intl.formatMessage({id: 'COURSE_DETAIL.NO_COURSES_CATEGORY'})}
          </p>
        </div>
      )}
    </div>
  )
}
