import {useMemo} from 'react'
import {useTable, Column} from 'react-table'
import {useIntl} from 'react-intl'
import {Category} from '../model/Category'
import {useCategoryController} from '../controller/useCategoryController'

type CategoriesTableProps = {
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoriesTable({onEdit, onDelete}: CategoriesTableProps) {
  const intl = useIntl()
  const {categories, isLoading, error} = useCategoryController()

  const columns = useMemo<Column<Category>[]>(
    () => [
      {
        Header: intl.formatMessage({id: 'CATEGORY_MANAGEMENT.COL_NAME'}),
        accessor: 'name',
      },
      {
        Header: intl.formatMessage({id: 'CATEGORY_MANAGEMENT.COL_SLUG'}),
        accessor: 'slug',
        Cell: ({value}) => <code className='text-muted'>{value}</code>,
      },
      {
        Header: intl.formatMessage({id: 'CATEGORY_MANAGEMENT.COL_DESCRIPTION'}),
        accessor: 'description',
        Cell: ({value}) => <span className='text-muted'>{value ?? '-'}</span>,
      },
      {
        Header: intl.formatMessage({id: 'CATEGORY_MANAGEMENT.COL_SORT_ORDER'}),
        accessor: 'sortOrder',
        Cell: ({value}) => <span className='badge badge-light'>{value}</span>,
      },
      {
        Header: intl.formatMessage({id: 'CATEGORY_MANAGEMENT.COL_IS_ACTIVE'}),
        accessor: 'isActive',
        Cell: ({value}) => (
          <span className={`badge ${value ? 'badge-light-success' : 'badge-light-danger'}`}>
            {intl.formatMessage({
              id: value ? 'CATEGORY_MANAGEMENT.STATUS_ACTIVE' : 'CATEGORY_MANAGEMENT.STATUS_INACTIVE',
            })}
          </span>
        ),
      },
      {
        Header: intl.formatMessage({id: 'CATEGORY_MANAGEMENT.COL_CREATED_AT'}),
        accessor: 'createdAt',
        Cell: ({value}) => new Date(value).toLocaleDateString(),
      },
      {
        Header: intl.formatMessage({id: 'CATEGORY_MANAGEMENT.COL_ACTIONS'}),
        id: 'actions',
        Cell: ({row}: {row: {original: Category}}) => (
          <div className='d-flex gap-2'>
            <button
              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
              title={intl.formatMessage({id: 'CATEGORY_MANAGEMENT.BTN_EDIT'})}
              onClick={() => onEdit(row.original)}
            >
              <i className='ki-duotone ki-pencil fs-5'>
                <span className='path1' />
                <span className='path2' />
              </i>
            </button>
            <button
              className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm'
              title={intl.formatMessage({id: 'CATEGORY_MANAGEMENT.BTN_DELETE'})}
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
    data: categories,
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
        {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.ERROR'})}
      </div>
    )
  }

  return (
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
                {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.EMPTY_STATE'})}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
