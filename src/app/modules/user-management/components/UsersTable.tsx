import {FC, useMemo} from 'react'
import {useTable, Column, Row, ColumnInstance} from 'react-table'
import {useIntl} from 'react-intl'
import {User} from '../model/User'
import {useUserController} from '../controller/useUserController'
import {RoleBadge} from './RoleBadge'

type Props = {
  currentUserId: string | null
  selectedDetailUserId: string | null
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onViewDetails: (user: User) => void
}

const UsersTable: FC<Props> = ({currentUserId, selectedDetailUserId, onEdit, onDelete, onViewDetails}) => {
  const intl = useIntl()
  const {users, isLoading, error} = useUserController()

  const columns: Column<User>[] = useMemo(
    () => [
      {
        Header: intl.formatMessage({id: 'USER_MANAGEMENT.COL_AVATAR'}),
        id: 'avatar',
        Cell: ({row}: {row: Row<User>}) => {
          const {avatarUrl, fullName} = row.original
          if (avatarUrl) {
            return (
              <div className='symbol symbol-circle symbol-45px overflow-hidden'>
                <div className='symbol-label'>
                  <img
                    src={`${avatarUrl}?t=${Date.now()}`}
                    alt={fullName}
                    className='w-100'
                  />
                </div>
              </div>
            )
          }
          const initials = fullName
            .split(' ')
            .map((n) => n[0] ?? '')
            .join('')
            .toUpperCase()
            .slice(0, 2)
          return (
            <div className='symbol symbol-circle symbol-45px'>
              <div className='symbol-label fs-4 fw-semibold bg-light-primary text-primary'>
                {initials}
              </div>
            </div>
          )
        },
      },
      {
        Header: intl.formatMessage({id: 'USER_MANAGEMENT.COL_FULL_NAME'}),
        accessor: 'fullName',
        Cell: ({value}: {value: string}) => (
          <span className='text-gray-800 fw-bold'>{value}</span>
        ),
      },
      {
        Header: intl.formatMessage({id: 'USER_MANAGEMENT.COL_EMAIL'}),
        accessor: 'email',
        Cell: ({value}: {value: string}) => (
          <span className='text-gray-600'>{value}</span>
        ),
      },
      {
        Header: intl.formatMessage({id: 'USER_MANAGEMENT.COL_ROLE'}),
        accessor: 'role',
        Cell: ({value}: {value: User['role']}) => <RoleBadge role={value} />,
      },
      {
        Header: intl.formatMessage({id: 'USER_MANAGEMENT.COL_STATUS'}),
        accessor: 'status',
        Cell: ({value}: {value: User['status']}) => (
          <span
            className={`badge badge-light-${value === 'Active' ? 'success' : 'secondary'}`}
          >
            {value === 'Active'
              ? intl.formatMessage({id: 'USER_MANAGEMENT.STATUS_ACTIVE'})
              : intl.formatMessage({id: 'USER_MANAGEMENT.STATUS_INACTIVE'})}
          </span>
        ),
      },
      {
        Header: intl.formatMessage({id: 'USER_MANAGEMENT.COL_ACTIONS'}),
        id: 'actions',
        Cell: ({row}: {row: Row<User>}) => {
          const isOwnRow = row.original.id === currentUserId
          return (
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                title={intl.formatMessage({id: 'USER_MANAGEMENT.EDIT_USER'})}
                onClick={(e) => {e.stopPropagation(); onEdit(row.original)}}
              >
                <i className='ki-duotone ki-pencil fs-4'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
              </button>
              <button
                type='button'
                className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm'
                title={intl.formatMessage({id: 'USER_MANAGEMENT.DELETE_USER'})}
                onClick={(e) => {e.stopPropagation(); onDelete(row.original)}}
                disabled={isOwnRow}
                style={isOwnRow ? {opacity: 0.4, cursor: 'not-allowed'} : undefined}
              >
                <i className='ki-duotone ki-trash fs-4'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                  <span className='path3'></span>
                  <span className='path4'></span>
                  <span className='path5'></span>
                </i>
              </button>
            </div>
          )
        },
      },
    ],
    [intl, currentUserId, onEdit, onDelete]
  )

  const data = useMemo(() => users, [users])

  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center py-10'>
        <span className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='alert alert-danger mx-4 my-4'>
        {intl.formatMessage({id: 'USER_MANAGEMENT.LOAD_ERROR'})}
      </div>
    )
  }

  return (
    <div className='table-responsive'>
      <table
        className='table align-middle table-row-dashed fs-6 gy-5'
        {...getTableProps()}
      >
        <thead>
          <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
            {headers.map((column: ColumnInstance<User>) => {
              const {key: headerKey, ...headerProps} = column.getHeaderProps()
              return (
                <th key={headerKey} {...headerProps}>
                  {column.render('Header')}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
          {rows.length > 0 ? (
            rows.map((row: Row<User>) => {
              prepareRow(row)
              const {key: rowKey, ...rowProps} = row.getRowProps()
              const isActiveRow = row.original.id === selectedDetailUserId
              return (
                <tr
                  key={rowKey}
                  {...rowProps}
                  onClick={() => onViewDetails(row.original)}
                  style={{cursor: 'pointer'}}
                  className={isActiveRow ? 'table-active' : ''}
                >
                  {row.cells.map((cell) => {
                    const {key: cellKey, ...cellProps} = cell.getCellProps()
                    return (
                      <td key={cellKey} {...cellProps}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={6}>
                <div className='d-flex text-center w-100 justify-content-center py-10 text-muted'>
                  {intl.formatMessage({id: 'USER_MANAGEMENT.EMPTY_STATE'})}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export {UsersTable}
