import {Link} from 'react-router-dom'
import {useIntl} from 'react-intl'
import {Content} from '../../../../_metronic/layout/components/content'
import {useAuth} from '../../auth'
import {getInitials, useCurrentProfile} from '../../../hooks/useCurrentProfile'
import {useUserController} from '../../user-management/controller/useUserController'
import {RoleBadge} from '../../user-management/components/RoleBadge'

function formatDate(value: string | undefined, locale: string): string {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function Overview() {
  const intl = useIntl()
  const {currentUser} = useAuth()
  const {data: profile, isLoading: isProfileLoading} = useCurrentProfile(currentUser?.email)
  const {users, isLoading: isUsersLoading, error} = useUserController()

  const activeUsers = users.filter((user) => user.status === 'Active').length
  const inactiveUsers = users.filter((user) => user.status === 'Inactive').length
  const recentUsers = users.slice(0, 4)
  const fullName =
    profile?.fullName ||
    currentUser?.fullname ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim() ||
    currentUser?.email ||
    intl.formatMessage({id: 'PROFILE.OVERVIEW.DEFAULT_USER'})

  return (
    <Content>
      <div className='row g-5 g-xxl-8'>
        <div className='col-xxl-4'>
          <div className='card mb-5 mb-xxl-8 h-100'>
            <div className='card-header border-0 pt-5'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bolder fs-3 mb-1'>
                  {intl.formatMessage({id: 'PROFILE.OVERVIEW.ACCOUNT_SUMMARY'})}
                </span>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  {intl.formatMessage({id: 'PROFILE.OVERVIEW.ACCOUNT_SUMMARY_HINT'})}
                </span>
              </h3>
            </div>
            <div className='card-body pt-4'>
              <div className='d-flex align-items-center mb-7'>
                <div className='symbol symbol-75px me-5 overflow-hidden'>
                  {profile?.avatarUrl ? (
                    <img
                      src={`${profile.avatarUrl}?t=${Date.now()}`}
                      alt={fullName}
                      style={{width: 75, height: 75, objectFit: 'cover'}}
                    />
                  ) : (
                    <div className='symbol-label fs-2 fw-bold bg-light-primary text-primary w-100 h-100'>
                      {getInitials(fullName)}
                    </div>
                  )}
                </div>

                <div className='flex-grow-1'>
                  <div className='text-gray-900 fw-bolder fs-4'>{fullName}</div>
                  <div className='text-gray-600 fw-semibold fs-6 mb-2'>
                    {profile?.email ?? currentUser?.email ?? intl.formatMessage({id: 'PROFILE.HEADER.NO_EMAIL'})}
                  </div>
                  {profile?.role && <RoleBadge role={profile.role} />}
                </div>
              </div>

              <div className='separator separator-dashed my-5'></div>

              <div className='d-flex flex-column gap-4'>
                <div>
                  <div className='text-muted fs-7 text-uppercase fw-bold mb-1'>
                    {intl.formatMessage({id: 'PROFILE.OVERVIEW.STATUS'})}
                  </div>
                  <div className='fw-semibold text-gray-800'>
                    {profile?.status ?? intl.formatMessage({id: 'PROFILE.OVERVIEW.UNAVAILABLE'})}
                  </div>
                </div>
                <div>
                  <div className='text-muted fs-7 text-uppercase fw-bold mb-1'>
                    {intl.formatMessage({id: 'PROFILE.OVERVIEW.USER_ID'})}
                  </div>
                  <div className='fw-semibold text-gray-800 text-break'>
                    {profile?.id ?? intl.formatMessage({id: 'PROFILE.OVERVIEW.UNAVAILABLE'})}
                  </div>
                </div>
                <div>
                  <div className='text-muted fs-7 text-uppercase fw-bold mb-1'>
                    {intl.formatMessage({id: 'PROFILE.OVERVIEW.MEMBER_SINCE'})}
                  </div>
                  <div className='fw-semibold text-gray-800'>
                    {isProfileLoading
                      ? intl.formatMessage({id: 'PROFILE.OVERVIEW.LOADING'})
                      : profile?.createdAt
                        ? formatDate(profile.createdAt, intl.locale)
                        : intl.formatMessage({id: 'PROFILE.OVERVIEW.UNAVAILABLE'})}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-xl-6'>
          <div className='card mb-5 mb-xxl-8 h-100'>
            <div className='card-header border-0 pt-5'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bolder fs-3 mb-1'>
                  {intl.formatMessage({id: 'PROFILE.OVERVIEW.TEAM_STATUS'})}
                </span>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  {intl.formatMessage({id: 'PROFILE.OVERVIEW.TEAM_STATUS_HINT'})}
                </span>
              </h3>
            </div>
            <div className='card-body pt-5'>
              <div className='d-flex flex-column gap-5'>
                <div>
                  <div className='d-flex justify-content-between fw-semibold fs-6 mb-2'>
                    <span className='text-gray-700'>{intl.formatMessage({id: 'DASHBOARD.ACTIVE_USERS'})}</span>
                    <span className='text-gray-900'>{isUsersLoading ? '--' : activeUsers}</span>
                  </div>
                  <div className='progress h-8px bg-light-success'>
                    <div
                      className='progress-bar bg-success'
                      role='progressbar'
                      style={{
                        width: users.length ? `${Math.round((activeUsers / users.length) * 100)}%` : '0%',
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className='d-flex justify-content-between fw-semibold fs-6 mb-2'>
                    <span className='text-gray-700'>{intl.formatMessage({id: 'PROFILE.OVERVIEW.INACTIVE_USERS'})}</span>
                    <span className='text-gray-900'>{isUsersLoading ? '--' : inactiveUsers}</span>
                  </div>
                  <div className='progress h-8px bg-light-warning'>
                    <div
                      className='progress-bar bg-warning'
                      role='progressbar'
                      style={{
                        width: users.length ? `${Math.round((inactiveUsers / users.length) * 100)}%` : '0%',
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className='separator separator-dashed my-6'></div>

              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  <div className='fw-bolder text-gray-900 fs-4'>
                    {intl.formatMessage({id: 'PROFILE.OVERVIEW.NEED_CHANGES'})}
                  </div>
                  <div className='text-muted fw-semibold fs-7'>
                    {intl.formatMessage({id: 'PROFILE.OVERVIEW.NEED_CHANGES_HINT'})}
                  </div>
                </div>
                <Link to='/user-management' className='btn btn-primary'>
                  {intl.formatMessage({id: 'PROFILE.OVERVIEW.OPEN_MODULE'})}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='col-xl-6'>
          <div className='card mb-5 mb-xxl-8 h-100'>
            <div className='card-header border-0 pt-5'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bolder fs-3 mb-1'>
                  {intl.formatMessage({id: 'DASHBOARD.RECENT_USERS'})}
                </span>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  {intl.formatMessage({id: 'PROFILE.OVERVIEW.RECENT_USERS_HINT'})}
                </span>
              </h3>
            </div>
            <div className='card-body pt-2'>
              {error && <div className='alert alert-danger'>{error.message}</div>}

              {!error && recentUsers.length === 0 && !isUsersLoading && (
                <div className='text-gray-600 fw-semibold py-10 text-center'>
                  {intl.formatMessage({id: 'PROFILE.OVERVIEW.NO_USERS'})}
                </div>
              )}

              <div className='d-flex flex-column gap-4'>
                {recentUsers.map((user) => (
                  <div key={user.id} className='d-flex align-items-center'>
                    <div className='symbol symbol-50px me-4 overflow-hidden'>
                      {user.avatarUrl ? (
                        <img
                          src={`${user.avatarUrl}?t=${Date.now()}`}
                          alt={user.fullName}
                          style={{width: 50, height: 50, objectFit: 'cover'}}
                        />
                      ) : (
                        <div className='symbol-label fs-4 fw-bold bg-light-primary text-primary w-100 h-100'>
                          {getInitials(user.fullName)}
                        </div>
                      )}
                    </div>

                    <div className='flex-grow-1'>
                      <div className='text-gray-900 fw-bolder fs-6'>{user.fullName}</div>
                      <div className='text-muted fw-semibold fs-7'>{user.email}</div>
                    </div>

                    <div className='text-end'>
                      <div className='mb-2'>
                        <RoleBadge role={user.role} />
                      </div>
                      <span
                        className={`badge ${
                          user.status === 'Active' ? 'badge-light-success' : 'badge-light-secondary'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}

                {isUsersLoading && (
                  <div className='text-gray-600 fw-semibold py-10 text-center'>
                    {intl.formatMessage({id: 'PROFILE.OVERVIEW.LOADING_RECENT_USERS'})}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Content>
  )
}
