import {useState} from 'react'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../../../../_metronic/helpers'
import type {Enrollment} from '../../model/Enrollment'

type Props = {
  enrollments: Enrollment[]
  onRemove: (id: string) => Promise<void>
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function EnrollmentsTable({enrollments, onRemove}: Props) {
  const intl = useIntl()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)

  async function handleRemove(id: string) {
    setRemoveError(null)
    setRemovingId(id)
    try {
      await onRemove(id)
      setConfirmId(null)
    } catch (e: unknown) {
      setRemoveError(e instanceof Error ? e.message : String(e))
    } finally {
      setRemovingId(null)
    }
  }

  if (enrollments.length === 0) {
    return (
      <div className='text-center text-muted py-10'>
        No enrollments found.
      </div>
    )
  }

  return (
    <>
      {removeError && (
        <div className='alert alert-danger py-3 mb-4'>{removeError}</div>
      )}

      <div className='table-responsive course-management-table'>
        <table className='table table-striped table-row-bordered table-row-gray-300 align-middle gs-0 gy-4'>
          <thead>
            <tr className='fw-bold text-muted'>
              <th className='ps-4 min-w-200px'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.FIELD_USER'})}
              </th>
              <th className='min-w-200px'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.FIELD_COURSE'})}
              </th>
              <th className='min-w-130px'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.FIELD_ENROLLED_AT'})}
              </th>
              <th className='min-w-130px'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.FIELD_COMPLETED_AT'})}
              </th>
              <th className='min-w-100px'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.FIELD_PROGRESS'})}
              </th>
              <th className='min-w-80px text-end pe-4'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td className='ps-4'>
                  <div className='fw-semibold course-table-primary-text'>
                    {enrollment.user?.fullName ?? enrollment.userId}
                  </div>
                  <div className='course-table-secondary-text fs-7'>{enrollment.user?.email}</div>
                </td>
                <td>
                  <span className='fw-semibold course-table-primary-text'>
                    {enrollment.course?.title ?? enrollment.courseId}
                  </span>
                </td>
                <td className='course-table-secondary-text fs-7'>{formatDate(enrollment.enrolledAt)}</td>
                <td className='course-table-secondary-text fs-7'>
                  {enrollment.completedAt ? formatDate(enrollment.completedAt) : '-'}
                </td>
                <td>
                  <div className='d-flex align-items-center gap-2'>
                    <div className='progress flex-grow-1 course-progress-track'>
                      <div
                        className='progress-bar bg-primary'
                        style={{width: `${enrollment.progressPercent}%`}}
                      />
                    </div>
                    <span className='fs-7 course-table-secondary-text'>
                      {enrollment.progressPercent}%
                    </span>
                  </div>
                </td>
                <td className='text-end pe-4'>
                  {confirmId === enrollment.id ? (
                    <div className='d-flex gap-1 justify-content-end'>
                      <button
                        className='btn btn-sm btn-danger'
                        disabled={removingId === enrollment.id}
                        onClick={() => handleRemove(enrollment.id)}
                      >
                        {removingId === enrollment.id ? (
                          <span className='spinner-border spinner-border-sm' />
                        ) : (
                          'Confirm'
                        )}
                      </button>
                      <button
                        className='btn btn-sm btn-light'
                        onClick={() => setConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className='btn btn-icon btn-sm btn-light-danger'
                      title={intl.formatMessage({id: 'COURSE_MANAGEMENT.ENROLLMENTS.REMOVE'})}
                      onClick={() => setConfirmId(enrollment.id)}
                    >
                      <KTIcon iconName='trash' className='fs-5' />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
