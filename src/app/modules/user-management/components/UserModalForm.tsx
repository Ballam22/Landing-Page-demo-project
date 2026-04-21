import {FC, useMemo, useState} from 'react'
import * as Yup from 'yup'
import {getIn, useFormik} from 'formik'
import {useIntl} from 'react-intl'
import clsx from 'clsx'
import {Role, SocialPlatform, Status, UserFormValues} from '../model/User'
import {useUserManagement} from '../hooks/useUserManagement'

type Props = {
  mode: 'add' | 'edit'
  userId?: string
  initialValues: UserFormValues
  existingEmails: string[]
  onClose: () => void
}

const ROLES: Role[] = ['Admin', 'Manager', 'User']
const STATUSES: Status[] = ['Active', 'Inactive']
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024
const SOCIAL_PLATFORMS: Array<{key: SocialPlatform; label: string; placeholder: string}> = [
  {key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/username'},
  {key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/username'},
  {key: 'x', label: 'X', placeholder: 'https://x.com/username'},
]

function normalizeUrl(value?: string): string {
  return (value ?? '').trim()
}

function normalizeUsername(value?: string): string {
  return (value ?? '').trim().replace(/^@/, '')
}

const UserModalForm: FC<Props> = ({mode, userId, initialValues, existingEmails, onClose}) => {
  const intl = useIntl()
  const {addUser, updateUser} = useUserManagement()
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        fullName: Yup.string().required(
          intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_NAME_REQUIRED'})
        ),
        email: Yup.string()
          .email(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_EMAIL_INVALID'}))
          .required(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_EMAIL_REQUIRED'}))
          .test(
            'unique-email',
            intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_EMAIL_DUPLICATE'}),
            (value) => !existingEmails.includes(value ?? '')
          ),
        role: Yup.string().required(
          intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_ROLE_REQUIRED'})
        ),
        status: Yup.string().required(
          intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_STATUS_REQUIRED'})
        ),
        socialLinks: Yup.object().shape({
          linkedin: Yup.object().shape({
            username: Yup.string().test(
              'linkedin-username-required',
              intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_USERNAME_REQUIRED'}),
              function (value) {
                const url = normalizeUrl(this.parent.url)
                return !url || !!normalizeUsername(value)
              }
            ),
            url: Yup.string()
              .test(
                'linkedin-url-required',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_REQUIRED'}),
                function (value) {
                  const username = normalizeUsername(this.parent.username)
                  return !username || !!normalizeUrl(value)
                }
              )
              .test(
                'linkedin-url-valid',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_INVALID'}),
                (value) => !normalizeUrl(value) || Yup.string().url().isValidSync(value)
              ),
          }),
          instagram: Yup.object().shape({
            username: Yup.string().test(
              'instagram-username-required',
              intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_USERNAME_REQUIRED'}),
              function (value) {
                const url = normalizeUrl(this.parent.url)
                return !url || !!normalizeUsername(value)
              }
            ),
            url: Yup.string()
              .test(
                'instagram-url-required',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_REQUIRED'}),
                function (value) {
                  const username = normalizeUsername(this.parent.username)
                  return !username || !!normalizeUrl(value)
                }
              )
              .test(
                'instagram-url-valid',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_INVALID'}),
                (value) => !normalizeUrl(value) || Yup.string().url().isValidSync(value)
              ),
          }),
          x: Yup.object().shape({
            username: Yup.string().test(
              'x-username-required',
              intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_USERNAME_REQUIRED'}),
              function (value) {
                const url = normalizeUrl(this.parent.url)
                return !url || !!normalizeUsername(value)
              }
            ),
            url: Yup.string()
              .test(
                'x-url-required',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_REQUIRED'}),
                function (value) {
                  const username = normalizeUsername(this.parent.username)
                  return !username || !!normalizeUrl(value)
                }
              )
              .test(
                'x-url-valid',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_INVALID'}),
                (value) => !normalizeUrl(value) || Yup.string().url().isValidSync(value)
              ),
          }),
        }),
      }),
    [intl, existingEmails]
  )

  const formik = useFormik<UserFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      setSubmitError(null)
      try {
        if (mode === 'add') {
          await addUser(
            {
              fullName: values.fullName,
              email: values.email,
              role: values.role,
              status: values.status,
              avatarUrl: values.avatarUrl,
              socialLinks: {
                linkedin: {
                  username: normalizeUsername(values.socialLinks.linkedin.username),
                  url: normalizeUrl(values.socialLinks.linkedin.url),
                },
                instagram: {
                  username: normalizeUsername(values.socialLinks.instagram.username),
                  url: normalizeUrl(values.socialLinks.instagram.url),
                },
                x: {
                  username: normalizeUsername(values.socialLinks.x.username),
                  url: normalizeUrl(values.socialLinks.x.url),
                },
              },
            },
            values.avatarFile ?? undefined
          )
        } else if (mode === 'edit' && userId) {
          await updateUser(
            userId,
            {
              fullName: values.fullName,
              email: values.email,
              role: values.role,
              status: values.status,
              avatarUrl: values.avatarUrl,
              socialLinks: {
                linkedin: {
                  username: normalizeUsername(values.socialLinks.linkedin.username),
                  url: normalizeUrl(values.socialLinks.linkedin.url),
                },
                instagram: {
                  username: normalizeUsername(values.socialLinks.instagram.username),
                  url: normalizeUrl(values.socialLinks.instagram.url),
                },
                x: {
                  username: normalizeUsername(values.socialLinks.x.username),
                  url: normalizeUrl(values.socialLinks.x.url),
                },
              },
            },
            values.avatarFile ?? undefined
          )
        }
        onClose()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setSubmitError(msg)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_AVATAR_TYPE'}))
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE) {
      setAvatarError(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_AVATAR_SIZE'}))
      e.target.value = ''
      return
    }

    setAvatarError(null)
    const previewUrl = URL.createObjectURL(file)
    formik.setFieldValue('avatarFile', file)
    formik.setFieldValue('avatarUrl', previewUrl)
  }

  const avatarPreview = formik.values.avatarUrl

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className='d-flex flex-column scroll-y px-5 px-xl-8'>

        {submitError && (
          <div className='alert alert-danger mb-5'>{submitError}</div>
        )}

        {/* Avatar */}
        <div className='fv-row mb-7'>
          <label className='fw-bold fs-6 mb-2'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.FIELD_AVATAR'})}
          </label>
          <div className='d-flex align-items-center gap-4'>
            <div className='symbol symbol-circle symbol-60px overflow-hidden'>
              {avatarPreview ? (
                <div className='symbol-label'>
                  <img src={avatarPreview} alt='avatar preview' className='w-100' />
                </div>
              ) : (
                <div className='symbol-label fs-3 bg-light-primary text-primary'>
                  {formik.values.fullName
                    ? formik.values.fullName
                        .split(' ')
                        .map((n) => n[0] ?? '')
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '?'}
                </div>
              )}
            </div>
            <div>
              <input
                type='file'
                accept='.jpg,.jpeg,.png,.webp'
                className='form-control form-control-solid form-control-sm'
                onChange={handleAvatarChange}
                disabled={formik.isSubmitting}
              />
              <div className='form-text text-muted'>
                {intl.formatMessage({id: 'USER_MANAGEMENT.UPLOAD_HINT'})}
              </div>
              {avatarError && (
                <div className='fv-plugins-message-container mt-1'>
                  <div className='fv-help-block'>
                    <span role='alert'>{avatarError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-2'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.FIELD_FULL_NAME'})}
          </label>
          <input
            type='text'
            className={clsx(
              'form-control form-control-solid mb-3 mb-lg-0',
              {'is-invalid': formik.touched.fullName && formik.errors.fullName},
              {'is-valid': formik.touched.fullName && !formik.errors.fullName}
            )}
            autoComplete='off'
            disabled={formik.isSubmitting}
            {...formik.getFieldProps('fullName')}
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.fullName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-2'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.FIELD_EMAIL'})}
          </label>
          <input
            type='email'
            className={clsx(
              'form-control form-control-solid mb-3 mb-lg-0',
              {'is-invalid': formik.touched.email && formik.errors.email},
              {'is-valid': formik.touched.email && !formik.errors.email}
            )}
            autoComplete='off'
            disabled={formik.isSubmitting}
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Role */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-2'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.FIELD_ROLE'})}
          </label>
          <select
            className={clsx(
              'form-select form-select-solid',
              {'is-invalid': formik.touched.role && formik.errors.role},
              {'is-valid': formik.touched.role && !formik.errors.role}
            )}
            disabled={formik.isSubmitting}
            {...formik.getFieldProps('role')}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {intl.formatMessage({id: `USER_MANAGEMENT.ROLE_${r.toUpperCase()}`})}
              </option>
            ))}
          </select>
          {formik.touched.role && formik.errors.role && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.role}</span>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className='fv-row mb-7'>
          <label className='required fw-bold fs-6 mb-2'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.FIELD_STATUS'})}
          </label>
          <select
            className={clsx(
              'form-select form-select-solid',
              {'is-invalid': formik.touched.status && formik.errors.status},
              {'is-valid': formik.touched.status && !formik.errors.status}
            )}
            disabled={formik.isSubmitting}
            {...formik.getFieldProps('status')}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {intl.formatMessage({id: `USER_MANAGEMENT.STATUS_${s.toUpperCase()}`})}
              </option>
            ))}
          </select>
          {formik.touched.status && formik.errors.status && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.status}</span>
              </div>
            </div>
          )}
        </div>

        <div className='separator separator-dashed my-7'></div>

        <div className='mb-7'>
          <h3 className='fw-bolder mb-2'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.SOCIAL_SECTION_TITLE'})}
          </h3>
          <div className='text-muted fs-7 mb-5'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.SOCIAL_SECTION_HINT'})}
          </div>

          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key} className='row g-5 mb-7'>
              <div className='col-md-4'>
                {(() => {
                  const usernameField = `socialLinks.${platform.key}.username`
                  const usernameTouched = getIn(formik.touched, usernameField)
                  const usernameError = getIn(formik.errors, usernameField)

                  return (
                    <>
                      <label className='fw-bold fs-6 mb-2 d-block'>
                        {intl.formatMessage(
                          {id: 'USER_MANAGEMENT.FIELD_SOCIAL_USERNAME'},
                          {platform: platform.label}
                        )}
                      </label>
                      <input
                        type='text'
                        className={clsx(
                          'form-control form-control-solid',
                          {'is-invalid': usernameTouched && usernameError},
                          {'is-valid': usernameTouched && !usernameError}
                        )}
                        autoComplete='off'
                        disabled={formik.isSubmitting}
                        placeholder='username'
                        {...formik.getFieldProps(usernameField)}
                      />
                      {usernameTouched && usernameError && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>
                            <span role='alert'>{usernameError}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              <div className='col-md-8'>
                {(() => {
                  const urlField = `socialLinks.${platform.key}.url`
                  const urlTouched = getIn(formik.touched, urlField)
                  const urlError = getIn(formik.errors, urlField)

                  return (
                    <>
                      <label className='fw-bold fs-6 mb-2 d-block'>
                        {intl.formatMessage(
                          {id: 'USER_MANAGEMENT.FIELD_SOCIAL_URL'},
                          {platform: platform.label}
                        )}
                      </label>
                      <input
                        type='url'
                        className={clsx(
                          'form-control form-control-solid',
                          {'is-invalid': urlTouched && urlError},
                          {'is-valid': urlTouched && !urlError}
                        )}
                        autoComplete='off'
                        disabled={formik.isSubmitting}
                        placeholder={platform.placeholder}
                        {...formik.getFieldProps(urlField)}
                      />
                      {urlTouched && urlError && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>
                            <span role='alert'>{urlError}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Actions */}
      <div className='text-center pt-5 pb-7'>
        <button
          type='button'
          className='btn btn-light me-3'
          onClick={onClose}
          disabled={formik.isSubmitting}
        >
          {intl.formatMessage({id: 'USER_MANAGEMENT.CANCEL'})}
        </button>
        <button
          type='submit'
          className='btn btn-primary'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {formik.isSubmitting ? (
            <span className='indicator-progress'>
              <span className='spinner-border spinner-border-sm align-middle me-2'></span>
              {intl.formatMessage({id: 'USER_MANAGEMENT.SAVING'})}
            </span>
          ) : (
            <span className='indicator-label'>
              {intl.formatMessage({id: 'USER_MANAGEMENT.SAVE'})}
            </span>
          )}
        </button>
      </div>
    </form>
  )
}

export {UserModalForm}
