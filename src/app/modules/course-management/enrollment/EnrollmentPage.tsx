import {useState} from 'react'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../../../_metronic/helpers'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useEnrollmentController} from '../controller/useEnrollmentController'
import {EnrollmentsTable} from './components/EnrollmentsTable'
import {EnrollUserModal} from './components/EnrollUserModal'

export default function EnrollmentPage() {
  const intl = useIntl()
  const {enrollments, isLoading, error, enroll, unenroll} = useEnrollmentController()
  const [showModal, setShowModal] = useState(false)
  const completedCount = enrollments.filter((enrollment) => enrollment.completedAt).length
  const inProgressCount = enrollments.length - completedCount
  const averageProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((sum, enrollment) => sum + enrollment.progressPercent, 0) /
          enrollments.length
      )
    : 0

  return (
    <>
      <PageTitle>{intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.TITLE'})}</PageTitle>

      <div className='course-management-shell'>
        <div className='course-management-header'>
          <div className='course-management-header-content'>
            <div>
              <div className='course-management-kicker'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.TITLE'})}
              </div>
              <h1 className='course-management-title'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.TITLE'})}
              </h1>
              <p className='course-management-subtitle'>
                Track course participation, completion, and learner progress with the same admin workspace styling.
              </p>
            </div>
          </div>
        </div>

        <div className='course-management-stats'>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>Total Enrollments</div>
            <div className='course-management-stat-value'>{enrollments.length}</div>
            <div className='course-management-stat-accent info' />
          </div>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>Completed</div>
            <div className='course-management-stat-value'>{completedCount}</div>
            <div className='course-management-stat-accent success' />
          </div>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>
              {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.NOT_COMPLETED'})}
            </div>
            <div className='course-management-stat-value'>{inProgressCount}</div>
            <div className='course-management-stat-accent warning' />
          </div>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>Average Progress</div>
            <div className='course-management-stat-value'>{averageProgress}%</div>
            <div className='course-management-stat-accent danger' />
          </div>
        </div>

        <div className='card course-management-card'>
          <div className='card-header border-0 pt-6'>
            <div className='card-title course-management-card-title'>
              <h2>{intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.TITLE'})}</h2>
              <span>Review learner-course assignments and update access as needed.</span>
            </div>
            <div className='card-toolbar'>
              <button className='btn btn-primary' onClick={() => setShowModal(true)}>
                <KTIcon iconName='plus' className='fs-4 me-1' />
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.ENROLL_USER'})}
              </button>
            </div>
          </div>

          <div className='card-body py-4'>
            {isLoading ? (
              <div className='d-flex justify-content-center py-10'>
                <span className='spinner-border text-primary' />
              </div>
            ) : error ? (
              <div className='alert alert-danger'>{error.message}</div>
            ) : (
              <EnrollmentsTable enrollments={enrollments} onRemove={unenroll} />
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <EnrollUserModal
          onEnroll={async (values) => {
            await enroll(values)
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
