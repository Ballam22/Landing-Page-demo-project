import {useMemo, useState} from 'react'
import {useTable, Column} from 'react-table'
import {useIntl} from 'react-intl'
import {useQuery} from 'react-query'
import {Blog, BLOG_STATUSES, BlogStatus} from '../model/Blog'
import {StatusBadge} from './StatusBadge'
import {useBlogController} from '../controller/useBlogController'
import {getAllCategories} from '../../category-management/repository/categoryRepository'

type BlogsTableProps = {
  onEdit: (blog: Blog) => void
  onDelete: (blog: Blog) => void
}

export function BlogsTable({onEdit, onDelete}: BlogsTableProps) {
  const intl = useIntl()
  const {blogs, isLoading, error} = useBlogController()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BlogStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('updated-desc')
  const {data: allCategories = []} = useQuery(['categories'], getAllCategories, {staleTime: 0})

  const categories = useMemo(
    () =>
      allCategories
        .map((category) => category.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [allCategories]
  )

  const filteredBlogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = blogs.filter((blog) => {
      const matchesSearch =
        !normalizedSearch ||
        blog.title.toLowerCase().includes(normalizedSearch) ||
        blog.slug.toLowerCase().includes(normalizedSearch) ||
        blog.categoryName.toLowerCase().includes(normalizedSearch)
      const matchesStatus = !statusFilter || blog.status === statusFilter
      const matchesCategory = !categoryFilter || blog.categoryName === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title)
      if (sortBy === 'created-desc') return Date.parse(b.createdAt) - Date.parse(a.createdAt)
      if (sortBy === 'status-asc') return a.status.localeCompare(b.status)
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    })
  }, [blogs, categoryFilter, search, sortBy, statusFilter])

  const columns = useMemo<Column<Blog>[]>(
    () => [
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_FEATURED_IMAGE'}),
        accessor: 'featuredImageUrl',
        Cell: ({value}) =>
          value ? (
            <img
              src={value}
              alt='featured'
              className='rounded'
              style={{width: 56, height: 40, objectFit: 'cover'}}
            />
          ) : (
            <div
              className='rounded bg-light d-flex align-items-center justify-content-center'
              style={{width: 56, height: 40}}
            >
              <i className='ki-duotone ki-picture fs-4 text-muted' />
            </div>
          ),
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_TITLE'}),
        accessor: 'title',
        Cell: ({value}) => <span className='fw-bold blog-table-primary-text'>{value}</span>,
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_SLUG'}),
        accessor: 'slug',
        Cell: ({value}) => <code className='blog-table-code'>{value}</code>,
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_CATEGORY'}),
        accessor: 'categoryName',
        Cell: ({value}) => <span className='blog-table-primary-text'>{value}</span>,
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_STATUS'}),
        accessor: 'status',
        Cell: ({value}) => <StatusBadge status={value} />,
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_READING_TIME'}),
        accessor: 'readingTime',
        Cell: ({value}) =>
          value ? (
            <span>
              {value} {intl.formatMessage({id: 'BLOG_MANAGEMENT.MIN_READING'})}
            </span>
          ) : (
            <span className='text-muted'>-</span>
          ),
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_CREATED_AT'}),
        accessor: 'createdAt',
        Cell: ({value}) => new Date(value).toLocaleDateString(),
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_UPDATED_AT'}),
        accessor: 'updatedAt',
        Cell: ({value}) => new Date(value).toLocaleDateString(),
      },
      {
        Header: intl.formatMessage({id: 'BLOG_MANAGEMENT.COL_ACTIONS'}),
        id: 'actions',
        Cell: ({row}: {row: {original: Blog}}) => (
          <div className='d-flex gap-2'>
            <button
              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
              title={intl.formatMessage({id: 'BLOG_MANAGEMENT.BTN_EDIT'})}
              onClick={() => onEdit(row.original)}
            >
              <i className='ki-duotone ki-pencil fs-5'>
                <span className='path1' />
                <span className='path2' />
              </i>
            </button>
            <button
              className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm'
              title={intl.formatMessage({id: 'BLOG_MANAGEMENT.BTN_DELETE'})}
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
    [intl, onEdit, onDelete]
  )

  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns,
    data: filteredBlogs,
  })

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center py-10'>
        <span className='spinner-border text-primary' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='alert alert-danger'>
        {intl.formatMessage({id: 'BLOG_MANAGEMENT.ERROR'})}
      </div>
    )
  }

  return (
    <>
      <div className='d-flex flex-column flex-lg-row gap-3 mb-6'>
        <div className='position-relative flex-grow-1'>
          <i className='ki-duotone ki-magnifier fs-3 position-absolute ms-4 mt-3 text-gray-500'>
            <span className='path1' />
            <span className='path2' />
          </i>
          <input
            type='search'
            className='form-control form-control-solid ps-12'
            placeholder={intl.formatMessage({id: 'BLOG_MANAGEMENT.SEARCH_PLACEHOLDER'})}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className='form-select form-select-solid w-100 w-lg-175px'
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as BlogStatus | '')}
          aria-label={intl.formatMessage({id: 'BLOG_MANAGEMENT.FILTER_STATUS'})}
        >
          <option value=''>{intl.formatMessage({id: 'BLOG_MANAGEMENT.ALL_STATUSES'})}</option>
          {BLOG_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className='form-select form-select-solid w-100 w-lg-200px'
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label={intl.formatMessage({id: 'BLOG_MANAGEMENT.FILTER_CATEGORY'})}
        >
          <option value=''>{intl.formatMessage({id: 'BLOG_MANAGEMENT.ALL_CATEGORIES'})}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className='form-select form-select-solid w-100 w-lg-200px'
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label={intl.formatMessage({id: 'BLOG_MANAGEMENT.SORT_BY'})}
        >
          <option value='updated-desc'>{intl.formatMessage({id: 'BLOG_MANAGEMENT.SORT_UPDATED'})}</option>
          <option value='created-desc'>{intl.formatMessage({id: 'BLOG_MANAGEMENT.SORT_CREATED'})}</option>
          <option value='title-asc'>{intl.formatMessage({id: 'BLOG_MANAGEMENT.SORT_TITLE'})}</option>
          <option value='status-asc'>{intl.formatMessage({id: 'BLOG_MANAGEMENT.SORT_STATUS'})}</option>
        </select>
      </div>

      <div className='table-responsive blog-management-table'>
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
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.EMPTY_STATE'})}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
