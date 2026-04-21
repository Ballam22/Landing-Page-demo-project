import type {Session, User} from '@supabase/supabase-js'
import {supabase} from '../../../lib/supabaseClient'
import {AuthFlowError, AuthModel, UserModel} from './_models'

type LoginResult = {
  auth: AuthModel
  user: UserModel
}

type RegisterResult = {
  auth?: AuthModel
  user?: UserModel
  requiresEmailVerification: boolean
}

const createAuthError = (type: AuthFlowError['type'], message: string): AuthFlowError => ({
  type,
  message,
})

const getBaseUrl = () => {
  const baseUrl = import.meta.env.BASE_URL ?? '/'
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return new URL(normalizedBaseUrl, window.location.origin)
}

const getRedirectUrl = (path: string) => new URL(path.replace(/^\//, ''), getBaseUrl()).toString()

export const getLoginRedirectUrl = () => getRedirectUrl('/auth/login')

const getResetPasswordRedirectUrl = () => getRedirectUrl('/auth/reset-password')

export const mapSessionToAuthModel = (session: Session): AuthModel => ({
  api_token: session.access_token,
  refreshToken: session.refresh_token,
})

export const mapSupabaseUserToUserModel = (user: User): UserModel => {
  const metadata = user.user_metadata as Record<string, unknown> | null
  const firstName =
    typeof metadata?.first_name === 'string' ? metadata.first_name : ''
  const lastName =
    typeof metadata?.last_name === 'string' ? metadata.last_name : ''
  const fullName =
    typeof metadata?.full_name === 'string'
      ? metadata.full_name
      : [firstName, lastName].filter(Boolean).join(' ').trim()

  return {
    id: user.id,
    username: user.email ?? user.id,
    password: undefined,
    email: user.email ?? '',
    first_name: firstName,
    last_name: lastName,
    fullname: fullName || undefined,
    emailVerified: Boolean(user.email_confirmed_at),
  }
}

const getUserFullName = (user: User) => {
  const metadata = user.user_metadata as Record<string, unknown> | null
  const explicitFullName =
    typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : ''
  if (explicitFullName) {
    return explicitFullName
  }

  const firstName =
    typeof metadata?.first_name === 'string' ? metadata.first_name.trim() : ''
  const lastName =
    typeof metadata?.last_name === 'string' ? metadata.last_name.trim() : ''
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (combinedName) {
    return combinedName
  }

  const email = user.email ?? ''
  return email.split('@')[0] || 'User'
}

async function ensureUserProfile(user: User): Promise<void> {
  const email = user.email?.trim().toLowerCase()
  if (!email) {
    return
  }

  const fullName = getUserFullName(user)
  const {data: existingProfile, error: lookupError} = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (lookupError) {
    console.error('Unable to look up user profile row', lookupError)
    return
  }

  if (existingProfile) {
    const updatePayload: {id?: string; full_name: string; email: string} = {
      full_name: fullName,
      email,
    }

    if (existingProfile.id !== user.id) {
      updatePayload.id = user.id
    }

    const {error: updateError} = await supabase
      .from('users')
      .update(updatePayload)
      .eq('email', email)

    if (updateError) {
      console.error('Unable to update existing user profile row', updateError)
    }
    return
  }

  const {error: insertError} = await supabase.from('users').insert({
    id: user.id,
    full_name: fullName,
    email,
    role: 'User',
    status: 'Active',
  })

  if (insertError) {
    console.error('Unable to create user profile row', insertError)
  }
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const {data, error} = await supabase.auth.signInWithPassword({email, password})

  if (error) {
    if (/email not confirmed/i.test(error.message)) {
      throw createAuthError('email_not_confirmed', error.message)
    }

    if (/invalid login credentials/i.test(error.message)) {
      throw createAuthError('invalid_credentials', error.message)
    }

    throw error
  }

  if (!data.session || !data.user) {
    throw createAuthError('invalid_credentials', 'Unable to create a valid session.')
  }

  await ensureUserProfile(data.user)

  return {
    auth: mapSessionToAuthModel(data.session),
    user: mapSupabaseUserToUserModel(data.user),
  }
}

export async function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _passwordConfirmation: string
): Promise<RegisterResult> {
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getLoginRedirectUrl(),
      data: {
        first_name: firstname,
        last_name: lastname,
        full_name: `${firstname} ${lastname}`.trim(),
      },
    },
  })

  if (error) {
    if (/already registered/i.test(error.message)) {
      throw createAuthError('duplicate_email', error.message)
    }

    throw error
  }

  if (data.user && data.session) {
    await ensureUserProfile(data.user)
  }

  return {
    auth: data.session ? mapSessionToAuthModel(data.session) : undefined,
    user: data.user ? mapSupabaseUserToUserModel(data.user) : undefined,
    requiresEmailVerification: !data.session,
  }
}

export async function requestPassword(email: string): Promise<void> {
  const {error} = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getResetPasswordRedirectUrl(),
  })

  if (error) {
    throw error
  }
}

export async function resetPassword(newPassword: string): Promise<void> {
  const {data, error} = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  if (!data.session) {
    throw createAuthError(
      'invalid_recovery_session',
      'Password recovery session is missing or expired.'
    )
  }

  const {error: updateError} = await supabase.auth.updateUser({password: newPassword})

  if (updateError) {
    throw updateError
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserByToken(_token?: string): Promise<{data: UserModel}> {
  const {data, error} = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw createAuthError('invalid_credentials', 'No authenticated user was found.')
  }

  await ensureUserProfile(data.user)

  return {data: mapSupabaseUserToUserModel(data.user)}
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const {error} = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getLoginRedirectUrl(),
    },
  })

  if (error) {
    throw error
  }
}
