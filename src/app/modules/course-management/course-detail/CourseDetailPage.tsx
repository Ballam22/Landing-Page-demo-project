import {useParams} from 'react-router-dom'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../../_metronic/layout/core'
import {ToolbarWrapper} from '../../../../_metronic/layout/components/toolbar'
import {Content} from '../../../../_metronic/layout/components/content'
import {useCourseDetail} from '../controller/useCourseDetailController'
import {CourseAccordion} from './components/CourseAccordion'
import {CoursePricingCTA} from './components/CoursePricingCTA'
import {CourseReviews} from './components/CourseReviews'
import {useAuth} from '../../../modules/auth'

export default function CourseDetailPage() {
  const {id = ''} = useParams<{id: string}>()
  const intl = useIntl()
  const {currentUser} = useAuth()
  const {course, isLoading, error, isEnrolled, lessonProgressMap, enroll, enrolling} =
    useCourseDetail(id)

  return (
    <>
      <PageTitle breadcrumbs={[]}>{course?.title ?? '…'}</PageTitle>
      <ToolbarWrapper showActions={false} />
      <Content>
        {isLoading && (
          <div className='d-flex justify-content-center py-20'>
            <span className='spinner-border text-primary' />
          </div>
        )}

        {error && !isLoading && (
          <div className='alert alert-danger'>{error.message}</div>
        )}

        {!isLoading && !error && course && (
          <div className='row g-5'>
            <div className='col-lg-8'>
              <div className='card mb-5'>
                <div className='card-body'>
                  <h1 className='fw-bolder text-gray-900 mb-3'>{course.title}</h1>
                  {course.description && (
                    <p className='text-gray-600 mb-0'>{course.description}</p>
                  )}
                </div>
              </div>

              <div className='card mb-5'>
                <div className='card-header border-0 pt-5'>
                  <h3 className='card-title fw-bolder'>
                    {intl.formatMessage({id: 'COURSE_DETAIL.CURRICULUM_TITLE'})}
                  </h3>
                </div>
                <div className='card-body pt-0'>
                  <CourseAccordion
                    sections={course.sections}
                    lessonProgressMap={lessonProgressMap}
                    isEnrolled={isEnrolled}
                  />
                </div>
              </div>

              <CourseReviews
                courseId={id}
                currentUserId={currentUser?.id != null ? String(currentUser.id) : undefined}
                isEnrolled={isEnrolled}
              />
            </div>

            <div className='col-lg-4'>
              {course.thumbnailUrl && (
                <div className='card mb-5'>
                  <div className='card-body p-0'>
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className='w-100 rounded'
                    />
                  </div>
                </div>
              )}
              <div className='card'>
                <div className='card-body'>
                  <CoursePricingCTA
                    price={course.price}
                    isEnrolled={isEnrolled}
                    onEnroll={enroll}
                    enrolling={enrolling}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Content>
    </>
  )
}
