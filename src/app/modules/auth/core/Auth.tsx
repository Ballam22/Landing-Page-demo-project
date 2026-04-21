/* eslint-disable react-refresh/only-export-components */
import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {AuthModel, UserModel} from './_models'
import * as authHelper from './AuthHelpers'
import {mapSessionToAuthModel, mapSupabaseUserToUserModel} from './_requests'
import {WithChildren} from '../../../../_metronic/helpers'
import useSessionTimeout from './hooks/useSessionTimeout'
import {supabase} from '../../../lib/supabaseClient'

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
  emailVerificationDismissed: boolean
  dismissEmailVerification: () => void
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => {},
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
  emailVerificationDismissed: false,
  dismissEmailVerification: () => {},
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({children}) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()
  const [emailVerificationDismissed, setEmailVerificationDismissed] = useState(false)

  const saveAuth = useCallback((auth: AuthModel | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
      setEmailVerificationDismissed(false)
    } else {
      authHelper.removeAuth()
    }
  }, [])

  const logout = useCallback(() => {
    saveAuth(undefined)
    setCurrentUser(undefined)
    void supabase.auth.signOut()
  }, [saveAuth])

  const dismissEmailVerification = useCallback(() => {
    setEmailVerificationDismissed(true)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        logout,
        emailVerificationDismissed,
        dismissEmailVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000

const AuthInit: FC<WithChildren> = ({children}) => {
  const {logout, saveAuth, setCurrentUser} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useSessionTimeout({timeoutMs: SESSION_TIMEOUT_MS, onTimeout: logout})

  useEffect(() => {
    let isMounted = true

    const syncAuthState = async () => {
      const {data, error} = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error(error)
        logout()
        setShowSplashScreen(false)
        return
      }

      if (data.session) {
        saveAuth(mapSessionToAuthModel(data.session))
        setCurrentUser(mapSupabaseUserToUserModel(data.session.user))
      } else {
        saveAuth(undefined)
        setCurrentUser(undefined)
      }

      setShowSplashScreen(false)
    }

    void syncAuthState()

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return
      }

      if (session) {
        saveAuth(mapSessionToAuthModel(session))
        setCurrentUser(mapSupabaseUserToUserModel(session.user))
      } else {
        saveAuth(undefined)
        setCurrentUser(undefined)
      }

      setShowSplashScreen(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [logout, saveAuth, setCurrentUser])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export {AuthProvider, AuthInit, useAuth}
