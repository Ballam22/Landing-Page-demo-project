import {useIntl} from 'react-intl'
import {Content} from '../../../../_metronic/layout/components/content'
import {useAuth} from '../../auth'
import {getInitials, useCurrentProfile} from '../../../hooks/useCurrentProfile'
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

  const fullName =
    profile?.fullName ||
    currentUser?.fullname ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim() ||
    currentUser?.email ||
    intl.formatMessage({id: 'PROFILE.OVERVIEW.DEFAULT_USER'})

  return (
    <Content>
      <div className='row g-5 g-xxl-8'>
        <div className='col-12'>
          <div className='card blog-management-card mb-5 mb-xxl-8 h-100'>
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
      </div>
    </Content>
  )
}
