import {lazy, Suspense} from 'react'
import {Route, Routes} from 'react-router-dom'
import {AuthLayout} from './AuthLayout'

const Login = lazy(() => import('./components/Login').then((m) => ({default: m.Login})))
const Registration = lazy(() =>
  import('./components/Registration').then((m) => ({default: m.Registration}))
)
const ForgotPassword = lazy(() =>
  import('./components/ForgotPassword').then((m) => ({default: m.ForgotPassword}))
)
const ResetPassword = lazy(() =>
  import('./components/ResetPassword').then((m) => ({default: m.ResetPassword}))
)

const AuthPage = () => (
  <Suspense fallback={null}>
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path='login' element={<Login />} />
        <Route path='registration' element={<Registration />} />
        <Route path='forgot-password' element={<ForgotPassword />} />
        <Route path='reset-password' element={<ResetPassword />} />
        <Route index element={<Login />} />
      </Route>
    </Routes>
  </Suspense>
)

export {AuthPage}
