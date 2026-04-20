import {FC} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../../_metronic/helpers'
import {ToolbarWrapper} from '../../../_metronic/layout/components/toolbar'
import {Content} from '../../../_metronic/layout/components/content'
import {useAuth} from '../auth'
import {getInitials, useCurrentProfile} from '../../hooks/useCurrentProfile'
import {useUserList} from '../user-management/hooks/useUsers'
import {RoleBadge} from '../user-management/components/RoleBadge'

const ProfileHeader: FC = () => {
  const intl = useIntl()
  const location = useLocation()
  const {currentUser} = useAuth()
  const {data: profile} = useCurrentProfile(currentUser?.email)
  const {data: users = []} = useUserList()

  const fullName =
    profile?.fullName ||
    currentUser?.fullname ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim() ||
    currentUser?.email ||
    intl.formatMessage({id: 'PROFILE.HEADER.DEFAULT_USER'})
  const email = profile?.email || currentUser?.email || intl.formatMessage({id: 'PROFILE.HEADER.NO_EMAIL'})
  const initials = getInitials(fullName)
  const activeUsers = users.filter((user) => user.status === 'Active').length
  const adminUsers = users.filter((user) => user.role === 'Admin').length
  const profileCompletion = [profile?.avatarUrl, profile?.fullName, profile?.email].filter(Boolean).length * 33

  return (
    <>
      <ToolbarWrapper showActions={false} />
      <Content>
        <div className='card mb-5 mb-xl-10'>
          <div className='card-body pt-9 pb-0'>
            <div className='d-flex flex-wrap flex-sm-nowrap mb-3'>
              <div className='me-7 mb-4'>
                <div className='symbol symbol-100px symbol-lg-160px symbol-fixed position-relative overflow-hidden'>
                  {profile?.avatarUrl ? (
                    <img
                      src={`${profile.avatarUrl}?t=${Date.now()}`}
                      alt={fullName}
                      style={{objectFit: 'cover'}}
                    />
                  ) : (
                    <div className='symbol-label fs-2qx fw-bold bg-light-primary text-primary w-100 h-100'>
                      {initials}
                    </div>
                  )}
                  <div className='position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px'></div>
                </div>
              </div>

              <div className='flex-grow-1'>
                <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
                  <div className='d-flex flex-column'>
                    <div className='d-flex align-items-center mb-2 flex-wrap gap-3'>
                      <span className='text-gray-800 fs-2 fw-bolder'>{fullName}</span>
                      {profile?.role && <RoleBadge role={profile.role} />}
                    </div>

                    <div className='d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2'>
                      <span className='d-flex align-items-center text-gray-600 me-5 mb-2'>
                        <KTIcon iconName='profile-circle' className='fs-4 me-1' />
                        {profile?.role ?? intl.formatMessage({id: 'PROFILE.HEADER.TEAM_MEMBER'})}
                      </span>
                      <span className='d-flex align-items-center text-gray-600 me-5 mb-2'>
                        <KTIcon iconName='check-circle' className='fs-4 me-1' />
                        {profile?.status ?? intl.formatMessage({id: 'PROFILE.HEADER.STATUS_UNAVAILABLE'})}
                      </span>
                      <span className='d-flex align-items-center text-gray-600 mb-2'>
                        <KTIcon iconName='sms' className='fs-4 me-1' />
                        {email}
                      </span>
                    </div>
                  </div>

                  <div className='d-flex my-4'>
                    <Link to='/user-management' className='btn btn-sm btn-primary'>
                      {intl.formatMessage({id: 'PROFILE.HEADER.MANAGE_USERS'})}
                    </Link>
                  </div>
                </div>

                <div className='d-flex flex-wrap flex-stack'>
                  <div className='d-flex flex-column flex-grow-1 pe-8'>
                    <div className='d-flex flex-wrap'>
                      <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                        <div className='d-flex align-items-center'>
                          <KTIcon iconName='people' className='fs-3 text-primary me-2' />
                          <div className='fs-2 fw-bolder'>{users.length}</div>
                        </div>
                        <div className='fw-bold fs-6 text-gray-500'>
                          {intl.formatMessage({id: 'PROFILE.HEADER.MANAGED_USERS'})}
                        </div>
                      </div>

                      <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                        <div className='d-flex align-items-center'>
                          <KTIcon iconName='security-user' className='fs-3 text-success me-2' />
                          <div className='fs-2 fw-bolder'>{activeUsers}</div>
                        </div>
                        <div className='fw-bold fs-6 text-gray-500'>
                          {intl.formatMessage({id: 'PROFILE.HEADER.ACTIVE_ACCOUNTS'})}
                        </div>
                      </div>

                      <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                        <div className='d-flex align-items-center'>
                          <KTIcon iconName='shield-tick' className='fs-3 text-info me-2' />
                          <div className='fs-2 fw-bolder'>{adminUsers}</div>
                        </div>
                        <div className='fw-bold fs-6 text-gray-500'>
                          {intl.formatMessage({id: 'PROFILE.HEADER.ADMIN_SEATS'})}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='d-flex align-items-center w-200px w-sm-300px flex-column mt-3'>
                    <div className='d-flex justify-content-between w-100 mt-auto mb-2'>
                      <span className='fw-bold fs-6 text-gray-500'>
                        {intl.formatMessage({id: 'PROFILE.HEADER.READINESS'})}
                      </span>
                      <span className='fw-bolder fs-6'>{Math.min(profileCompletion, 100)}%</span>
                    </div>
                    <div className='h-5px mx-3 w-100 bg-light mb-3'>
                      <div
                        className='bg-primary rounded h-5px'
                        role='progressbar'
                        style={{width: `${Math.min(profileCompletion, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='d-flex overflow-auto h-55px'>
              <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap'>
                <li className='nav-item'>
                  <Link
                    className={
                      `nav-link text-active-primary me-6 ` +
                      (location.pathname === '/profile/overview' && 'active')
                    }
                    to='/profile/overview'
                  >
                    {intl.formatMessage({id: 'PROFILE.NAV.OVERVIEW'})}
                  </Link>
                </li>
                <li className='nav-item'>
                  <Link
                    className={
                      `nav-link text-active-primary me-6 ` +
                      (location.pathname === '/profile/social-accounts' && 'active')
                    }
                    to='/profile/social-accounts'
                  >
                    {intl.formatMessage({id: 'PROFILE.NAV.SOCIAL_ACCOUNTS'})}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Content>
    </>
  )
}

export {ProfileHeader}
