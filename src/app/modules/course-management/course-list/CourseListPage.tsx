import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../../_metronic/layout/core'
import {CoursesTable} from './components/CoursesTable'
import {DeleteCourseDialog} from './components/DeleteCourseDialog'
import {useCourseController} from '../controller/useCourseController'
import type {Course} from '../model/Course'

export default function CourseListPage() {
  const intl = useIntl()
  const navigate = useNavigate()
  const {courses, deleteCourse} = useCourseController()
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const publishedCount = courses.filter((course) => course.status === 'Published').length
  const draftCount = courses.filter((course) => course.status === 'Draft').length
  const archivedCount = courses.filter((course) => course.status === 'Archived').length

  async function handleDeleteConfirm() {
    if (!pendingDelete) return
    setDeleteError(null)
    try {
      await deleteCourse(pendingDelete.id)
      setPendingDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === 'COURSE_MANAGEMENT.COURSES.DELETE_BLOCKED') {
        setDeleteError(intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.DELETE_BLOCKED'}))
      } else {
        setDeleteError(msg)
      }
    }
  }

  return (
    <>
      <PageTitle>{intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.LIST_TITLE'})}</PageTitle>
      <div className='course-management-shell'>
        <div className='course-management-header'>
          <div className='course-management-header-content'>
            <div>
              <div className='course-management-kicker'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.TITLE'})}
              </div>
              <h1 className='course-management-title'>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.LIST_TITLE'})}
              </h1>
              <p className='course-management-subtitle'>
                Create, organize, publish, and archive your learning catalog from one consistent workspace.
              </p>
            </div>
          </div>
        </div>

        <div className='course-management-stats'>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>Total Courses</div>
            <div className='course-management-stat-value'>{courses.length}</div>
            <div className='course-management-stat-accent info' />
          </div>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>
              {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.STATUS_PUBLISHED'})}
            </div>
            <div className='course-management-stat-value'>{publishedCount}</div>
            <div className='course-management-stat-accent success' />
          </div>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>
              {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.STATUS_DRAFT'})}
            </div>
            <div className='course-management-stat-value'>{draftCount}</div>
            <div className='course-management-stat-accent warning' />
          </div>
          <div className='course-management-stat'>
            <div className='course-management-stat-label'>
              {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.STATUS_ARCHIVED'})}
            </div>
            <div className='course-management-stat-value'>{archivedCount}</div>
            <div className='course-management-stat-accent danger' />
          </div>
        </div>

        <div className='card course-management-card'>
          <div className='card-header border-0 pt-6'>
            <div className='card-title course-management-card-title'>
              <h2>{intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.LIST_TITLE'})}</h2>
              <span>Manage course records, publication status, thumbnails, and ordering.</span>
            </div>
            <div className='card-toolbar'>
              <button
                className='btn btn-primary'
                onClick={() => navigate('/course-management/add')}
              >
                <i className='ki-duotone ki-plus fs-2'>
                  <span className='path1' />
                  <span className='path2' />
                </i>
                {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.ADD'})}
              </button>
            </div>
          </div>
          <div className='card-body py-4'>
            <CoursesTable onDelete={(course) => { setPendingDelete(course); setDeleteError(null) }} />
          </div>
        </div>
      </div>

      <DeleteCourseDialog
        isOpen={pendingDelete !== null}
        course={pendingDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setPendingDelete(null); setDeleteError(null) }}
        errorMessage={deleteError}
      />
    </>
  )
}
