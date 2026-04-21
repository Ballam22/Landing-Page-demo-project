import {Navigate, Routes, Route, Outlet} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {Overview} from './components/Overview'
import {SocialAccounts} from './components/SocialAccounts'
import {ProfileHeader} from './ProfileHeader'

const profileBreadCrumbs: Array<PageLink> = [
  {
    title: 'Profile',
    path: '/profile/overview',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const ProfilePage = () => (
  <Routes>
    <Route
      element={
        <>
          <ProfileHeader />
          <Outlet />
        </>
      }
    >
      <Route
        path='overview'
        element={
          <>
            <PageTitle breadcrumbs={profileBreadCrumbs}>Overview</PageTitle>
            <Overview />
          </>
        }
      />
      <Route
        path='social-accounts'
        element={
          <>
            <PageTitle breadcrumbs={profileBreadCrumbs}>Social Accounts</PageTitle>
            <SocialAccounts />
          </>
        }
      />
      <Route path='*' element={<Navigate to='/profile/overview' replace />} />
      <Route index element={<Navigate to='/profile/overview' />} />
    </Route>
  </Routes>
)

export default ProfilePage
