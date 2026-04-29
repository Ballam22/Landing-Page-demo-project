import {useMemo} from 'react'
import {Column, useTable} from 'react-table'
import {useIntl} from 'react-intl'
import {useNavigate} from 'react-router-dom'
import type {Course} from '../../model/Course'
import {useCourseController} from '../../controller/useCourseController'

type CoursesTableProps = {
  onDelete: (course: Course) => void
}

function StatusBadge({status}: {status: Course['status']}) {
  const intl = useIntl()
  const cls =
    status === 'Published'
      ? 'badge-light-success'
      : status === 'Archived'
      ? 'badge-light-dark'
      : 'badge-light-secondary'
  return (
    <span className={`badge ${cls}`}>
      {intl.formatMessage({id: `COURSE_MANAGEMENT.COURSES.STATUS_${status.toUpperCase()}`})}
    </span>
  )
}

export function CoursesTable({onDelete}: CoursesTableProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  const {courses, isLoading, error} = useCourseController()

  const columns = useMemo<Column<Course>[]>(
    () => [
      {
        Header: intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_THUMBNAIL'}),
        id: 'thumbnail',
        Cell: ({row}: {row: {original: Course}}) =>
          row.original.thumbnailUrl ? (
            <img
              src={row.original.thumbnailUrl}
              alt={row.original.title}
              className='course-table-thumbnail'
            />
          ) : (
            <span className='course-table-thumbnail-empty'>
              <i className='ki-duotone ki-picture fs-4 text-muted' />
            </span>
          ),
      },
      {
        Header: intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_TITLE'}),
        accessor: 'title',
        Cell: ({value}) => <span className='fw-bold course-table-primary-text'>{value}</span>,
      },
      {
        Header: intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_SLUG'}),
        accessor: 'slug',
        Cell: ({value}) => <code className='course-table-code'>{value}</code>,
      },
      {
        Header: intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_CATEGORY'}),
        id: 'category',
        Cell: ({row}: {row: {original: Course}}) => (
          <span className='course-table-primary-text'>
            {row.original.category?.name ?? intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.NO_CATEGORY'})}
          </span>
        ),
      },
      {
        Header: intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_STATUS'}),
        accessor: 'status',
        Cell: ({value}) => <StatusBadge status={value} />,
      },
      {
        Header: intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_SORT_ORDER'}),
        accessor: 'sortOrder',
        Cell: ({value}) => <span className='badge badge-light'>{value}</span>,
      },
      {
        Header: 'Created',
        accessor: 'createdAt',
        Cell: ({value}) => (
          <span className='course-table-secondary-text'>{new Date(value).toLocaleDateString()}</span>
        ),
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({row}: {row: {original: Course}}) => (
          <div className='d-flex gap-2'>
            <button
              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
              title={intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.EDIT'})}
              onClick={() => navigate(`/course-management/edit/${row.original.id}`)}
            >
              <i className='ki-duotone ki-pencil fs-5'>
                <span className='path1' />
                <span className='path2' />
              </i>
            </button>
            <button
              className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm'
              title={intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.DELETE'})}
              onClick={() => onDelete(row.original)}
            >
              <i className='ki-duotone ki-trash fs-5'>
                <span className='path1' />
                <span className='path2' />
                <span className='path3' />
                <span className='path4' />
                <span className='path5' />
              </i>
            </button>
          </div>
        ),
      },
    ],
    [intl, navigate, onDelete]
  )

  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns,
    data: courses,
  })

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center py-10'>
        <span className='spinner-border text-primary' />
      </div>
    )
  }

  if (error) {
    return <div className='alert alert-danger'>{error.message}</div>
  }

  return (
    <div className='table-responsive course-management-table'>
      <table
        className='table table-striped table-row-bordered table-row-gray-300 align-middle gs-0 gy-4'
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((hg) => (
            <tr className='fw-bold text-muted' {...hg.getHeaderGroupProps()}>
              {hg.headers.map((col) => (
                <th className='min-w-100px' {...col.getHeaderProps()}>
                  {col.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className='text-center text-muted py-10'>
                No courses yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
