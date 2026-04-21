import {FC} from 'react'
import {Link} from 'react-router-dom'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../_metronic/layout/core'
import {ToolbarWrapper} from '../../../_metronic/layout/components/toolbar'
import {Content} from '../../../_metronic/layout/components/content'
import {useAuth} from '../../modules/auth'
import {useUserController} from '../../modules/user-management/controller/useUserController'

const DashboardPage: FC = () => {
  const intl = useIntl()
  const {currentUser} = useAuth()
  const {users, isLoading, error} = useUserController()

  const activeUsers = users.filter((user) => user.status === 'Active').length
  const adminUsers = users.filter((user) => user.role === 'Admin').length
  const managerUsers = users.filter((user) => user.role === 'Manager').length
  const recentUsers = users.slice(0, 5)
  const displayName =
    currentUser?.fullname?.trim() ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim() ||
    currentUser?.email ||
    'there'

  return (
    <>
      <ToolbarWrapper showActions={false} />
      <Content>
        <div className='row g-5 g-xl-8'>
          <div className='col-12'>
            <div className='card border-0 shadow-sm'>
              <div className='card-body p-8'>
                <div className='d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-6'>
                  <div>
                    <div className='fs-6 fw-semibold text-gray-600 mb-2'>
                      {intl.formatMessage({id: 'DASHBOARD.OVERVIEW'})}
                    </div>
                    <h1 className='fs-2hx fw-bold text-gray-900 mb-3'>
                      {intl.formatMessage({id: 'DASHBOARD.WELCOME_BACK'}, {name: displayName})}
                    </h1>
                    <div className='fs-5 text-gray-700 mw-lg-600'>
                      {intl.formatMessage({id: 'DASHBOARD.DESCRIPTION'})}
                    </div>
                  </div>

                  <div className='d-flex flex-wrap gap-3'>
                    <Link to='/user-management' className='btn btn-primary'>
                      {intl.formatMessage({id: 'DASHBOARD.OPEN_USER_MANAGEMENT'})}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6 col-xl-3'>
            <div className='card h-100 border-0 shadow-sm'>
              <div className='card-body p-6'>
                <div className='fs-7 fw-semibold text-uppercase text-gray-600 mb-2'>
                  {intl.formatMessage({id: 'DASHBOARD.TOTAL_USERS'})}
                </div>
                <div className='fs-1 fw-bold text-gray-900'>
                  {isLoading ? '--' : users.length}
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6 col-xl-3'>
            <div className='card h-100 border-0 shadow-sm'>
              <div className='card-body p-6'>
                <div className='fs-7 fw-semibold text-uppercase text-gray-600 mb-2'>
                  {intl.formatMessage({id: 'DASHBOARD.ACTIVE_USERS'})}
                </div>
                <div className='fs-1 fw-bold text-success'>
                  {isLoading ? '--' : activeUsers}
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6 col-xl-3'>
            <div className='card h-100 border-0 shadow-sm'>
              <div className='card-body p-6'>
                <div className='fs-7 fw-semibold text-uppercase text-gray-600 mb-2'>
                  {intl.formatMessage({id: 'DASHBOARD.ADMINS'})}
                </div>
                <div className='fs-1 fw-bold text-gray-900'>
                  {isLoading ? '--' : adminUsers}
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6 col-xl-3'>
            <div className='card h-100 border-0 shadow-sm'>
              <div className='card-body p-6'>
                <div className='fs-7 fw-semibold text-uppercase text-gray-600 mb-2'>
                  {intl.formatMessage({id: 'DASHBOARD.MANAGERS'})}
                </div>
                <div className='fs-1 fw-bold text-gray-900'>
                  {isLoading ? '--' : managerUsers}
                </div>
              </div>
            </div>
          </div>

          <div className='col-12'>
            <div className='card border-0 shadow-sm'>
              <div className='card-header border-0 pt-6'>
                <div className='card-title'>
                  <h2 className='fw-bold'>{intl.formatMessage({id: 'DASHBOARD.RECENT_USERS'})}</h2>
                </div>
              </div>

              <div className='card-body pt-0'>
                {isLoading && (
                  <div className='py-10 text-center text-gray-600'>
                    {intl.formatMessage({id: 'DASHBOARD.LOADING_USERS'})}
                  </div>
                )}

                {error && (
                  <div className='alert alert-danger mb-0'>
                    {(error as Error)?.message || intl.formatMessage({id: 'DASHBOARD.LOAD_ERROR'})}
                  </div>
                )}

                {!isLoading && !error && recentUsers.length === 0 && (
                  <div className='py-10 text-center'>
                    <div className='fs-4 fw-semibold text-gray-800 mb-2'>
                      {intl.formatMessage({id: 'DASHBOARD.NO_USERS_TITLE'})}
                    </div>
                    <div className='text-gray-600 mb-5'>
                      {intl.formatMessage({id: 'DASHBOARD.NO_USERS_DESCRIPTION'})}
                    </div>
                    <Link to='/user-management' className='btn btn-light-primary'>
                      {intl.formatMessage({id: 'DASHBOARD.ADD_USERS'})}
                    </Link>
                  </div>
                )}

                {!isLoading && !error && recentUsers.length > 0 && (
                  <div className='table-responsive'>
                    <table className='table align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted bg-light'>
                          <th className='ps-4 min-w-250px rounded-start'>
                            {intl.formatMessage({id: 'DASHBOARD.TABLE_USER'})}
                          </th>
                          <th className='min-w-150px'>{intl.formatMessage({id: 'DASHBOARD.TABLE_ROLE'})}</th>
                          <th className='min-w-125px'>{intl.formatMessage({id: 'DASHBOARD.TABLE_STATUS'})}</th>
                          <th className='min-w-200px rounded-end'>
                            {intl.formatMessage({id: 'DASHBOARD.TABLE_EMAIL'})}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user) => (
                          <tr key={user.id}>
                            <td className='ps-4'>
                              <div className='d-flex flex-column'>
                                <span className='text-gray-900 fw-bold fs-6'>{user.fullName}</span>
                                <span className='text-muted fw-semibold fs-7'>{user.id}</span>
                              </div>
                            </td>
                            <td>
                              <span className='badge badge-light-primary'>{user.role}</span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  user.status === 'Active' ? 'badge-light-success' : 'badge-light-secondary'
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className='text-gray-700 fw-semibold'>{user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Content>
    </>
  )
}

const DashboardWrapper: FC = () => {
  const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.DASHBOARD'})}</PageTitle>
      <DashboardPage />
    </>
  )
}

export {DashboardWrapper}
