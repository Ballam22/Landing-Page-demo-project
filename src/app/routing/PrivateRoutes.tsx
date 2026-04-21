import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate, Outlet} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import {EmailVerificationBanner} from '../modules/auth/components/EmailVerificationBanner'
import {RoleGuard} from '../modules/user-management/components/guards/RoleGuard'

const BannerLayout = () => (
  <>
    <EmailVerificationBanner />
    <Outlet />
  </>
)

const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const UserManagementPage = lazy(() => import('../modules/user-management/UserManagementPage'))
  const MessagesPage = lazy(() => import('../modules/messages/components/MessagesPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        <Route element={<BannerLayout />}>
          <Route path='auth/*' element={<Navigate to='/dashboard' />} />
          <Route path='dashboard' element={<DashboardWrapper />} />
          <Route
            path='profile/*'
            element={
              <SuspensedView>
                <ProfilePage />
              </SuspensedView>
            }
          />
          <Route
            path='user-management'
            element={
              <SuspensedView>
                <RoleGuard allowedRoles={['Admin', 'Manager']}>
                  <UserManagementPage />
                </RoleGuard>
              </SuspensedView>
            }
          />
          <Route
            path='messages'
            element={
              <SuspensedView>
                <MessagesPage />
              </SuspensedView>
            }
          />
          <Route path='*' element={<Navigate to='/error/404' />} />
        </Route>
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
