import {useMemo, useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useIntl} from 'react-intl'
import {useQueryClient} from 'react-query'
import {Content} from '../../../../_metronic/layout/components/content'
import {useAuth} from '../../auth'
import {useCurrentProfile} from '../../../hooks/useCurrentProfile'
import {updateUser} from '../../user-management/_requests'
import {EMPTY_SOCIAL_LINKS, SocialLinks, SocialPlatform} from '../../user-management/_models'

const SOCIAL_PLATFORMS: Array<{
  key: SocialPlatform
  title: string
  accentClass: string
  placeholder: string
  helperId: string
}> = [
  {
    key: 'linkedin',
    title: 'LinkedIn',
    accentClass: 'bg-light-primary text-primary',
    placeholder: 'https://www.linkedin.com/in/username',
    helperId: 'PROFILE.SOCIAL.LINKEDIN_HELPER',
  },
  {
    key: 'instagram',
    title: 'Instagram',
    accentClass: 'bg-light-danger text-danger',
    placeholder: 'https://www.instagram.com/username',
    helperId: 'PROFILE.SOCIAL.INSTAGRAM_HELPER',
  },
  {
    key: 'x',
    title: 'X',
    accentClass: 'bg-light-dark text-dark',
    placeholder: 'https://x.com/username',
    helperId: 'PROFILE.SOCIAL.X_HELPER',
  },
]

function cloneSocialLinks(links?: SocialLinks): SocialLinks {
  return {
    linkedin: {username: links?.linkedin.username ?? '', url: links?.linkedin.url ?? ''},
    instagram: {username: links?.instagram.username ?? '', url: links?.instagram.url ?? ''},
    x: {username: links?.x.username ?? '', url: links?.x.url ?? ''},
  }
}

function normalizeUsername(value?: string): string {
  return (value ?? '').trim().replace(/^@/, '')
}

function normalizeUrl(value?: string): string {
  return (value ?? '').trim()
}

export function SocialAccounts() {
  const intl = useIntl()
  const queryClient = useQueryClient()
  const {currentUser} = useAuth()
  const {data: profile, isLoading, isError, error} = useCurrentProfile(currentUser?.email)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        socialLinks: Yup.object().shape({
          linkedin: Yup.object().shape({
            username: Yup.string().test(
              'linkedin-username-required',
              intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_USERNAME_REQUIRED'}),
              function (value) {
                return !normalizeUrl(this.parent.url) || !!normalizeUsername(value)
              }
            ),
            url: Yup.string()
              .test(
                'linkedin-url-required',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_REQUIRED'}),
                function (value) {
                  return !normalizeUsername(this.parent.username) || !!normalizeUrl(value)
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
                return !normalizeUrl(this.parent.url) || !!normalizeUsername(value)
              }
            ),
            url: Yup.string()
              .test(
                'instagram-url-required',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_REQUIRED'}),
                function (value) {
                  return !normalizeUsername(this.parent.username) || !!normalizeUrl(value)
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
                return !normalizeUrl(this.parent.url) || !!normalizeUsername(value)
              }
            ),
            url: Yup.string()
              .test(
                'x-url-required',
                intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_SOCIAL_URL_REQUIRED'}),
                function (value) {
                  return !normalizeUsername(this.parent.username) || !!normalizeUrl(value)
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
    [intl]
  )

  const formik = useFormik<{socialLinks: SocialLinks}>({
    enableReinitialize: true,
    initialValues: {
      socialLinks: cloneSocialLinks(profile?.socialLinks ?? EMPTY_SOCIAL_LINKS),
    },
    validationSchema,
    onSubmit: async (values, {setSubmitting, resetForm}) => {
      if (!profile) {
        return
      }

      setSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      try {
        const socialLinks = {
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
        }

        await updateUser(profile.id, {socialLinks})
        await queryClient.invalidateQueries(['current-user-profile', currentUser?.email ?? ''])
        await queryClient.invalidateQueries(['users'])
        resetForm({values: {socialLinks}})
        setSubmitSuccess(intl.formatMessage({id: 'PROFILE.SOCIAL.SUCCESS'}))
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : intl.formatMessage({id: 'PROFILE.SOCIAL.ERROR'}))
      } finally {
        setSubmitting(false)
      }
    },
  })

  const connectedCount = SOCIAL_PLATFORMS.filter((platform) => {
    const social = formik.values.socialLinks[platform.key]
    return !!social.username && !!social.url
  }).length

  return (
    <Content>
      <div className='row g-5 g-xxl-8'>
        <div className='col-xxl-4'>
          <div className='card h-100'>
            <div className='card-body p-8'>
              <div className='fs-2hx fw-bolder text-gray-900 mb-2'>{connectedCount}/3</div>
              <div className='fs-5 fw-semibold text-gray-700 mb-4'>
                {intl.formatMessage({id: 'PROFILE.SOCIAL.CONNECTED_COUNT'})}
              </div>
              <div className='text-muted fw-semibold mb-6'>
                {intl.formatMessage({id: 'PROFILE.SOCIAL.DESCRIPTION'})}
              </div>
              <div className='d-flex flex-column gap-3'>
                {SOCIAL_PLATFORMS.map((platform) => {
                  const social = formik.values.socialLinks[platform.key]
                  const isConnected = !!social.username && !!social.url

                  return (
                    <div
                      key={platform.key}
                      className='d-flex align-items-center justify-content-between rounded border border-dashed border-gray-300 px-4 py-3'
                    >
                        <div>
                          <div className='fw-bolder text-gray-900'>{platform.title}</div>
                        <div className='text-muted fs-7'>
                          {intl.formatMessage({id: platform.helperId})}
                        </div>
                      </div>
                      <span className={`badge ${isConnected ? 'badge-light-success' : 'badge-light-secondary'}`}>
                        {isConnected
                          ? intl.formatMessage({id: 'PROFILE.SOCIAL.CONNECTED'})
                          : intl.formatMessage({id: 'PROFILE.SOCIAL.NOT_CONNECTED'})}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className='col-xxl-8'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column align-items-start'>
                <h3 className='fw-bolder mb-1'>{intl.formatMessage({id: 'PROFILE.SOCIAL.TITLE'})}</h3>
                <div className='text-muted fw-semibold fs-7'>
                  {intl.formatMessage({id: 'PROFILE.SOCIAL.SUBTITLE'})}
                </div>
              </div>
            </div>

            <div className='card-body pt-4'>
              {isLoading && (
                <div className='text-center py-10 text-muted'>
                  {intl.formatMessage({id: 'PROFILE.SOCIAL.LOADING'})}
                </div>
              )}

              {isError && (
                <div className='alert alert-danger mb-0'>
                  {(error as Error)?.message || intl.formatMessage({id: 'PROFILE.SOCIAL.ERROR'})}
                </div>
              )}

              {!isLoading && !isError && (
                <form onSubmit={formik.handleSubmit} noValidate>
                  {submitSuccess && <div className='alert alert-success'>{submitSuccess}</div>}
                  {submitError && <div className='alert alert-danger'>{submitError}</div>}

                  <div className='d-flex flex-column gap-8'>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <div key={platform.key} className='rounded border border-gray-200 p-6'>
                        <div className='d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3'>
                          <div>
                            <div className='d-flex align-items-center gap-3 mb-1'>
                              <div className={`symbol-label w-40px h-40px rounded ${platform.accentClass}`}>
                                {platform.title.charAt(0)}
                              </div>
                              <div className='fw-bolder fs-4 text-gray-900'>{platform.title}</div>
                            </div>
                            <div className='text-muted fw-semibold fs-7'>
                              {intl.formatMessage({id: platform.helperId})}
                            </div>
                          </div>
                        </div>

                        <div className='row g-5'>
                          <div className='col-md-4'>
                            <label className='form-label fw-bold'>
                              {intl.formatMessage(
                                {id: 'USER_MANAGEMENT.FIELD_SOCIAL_USERNAME'},
                                {platform: platform.title}
                              )}
                            </label>
                            <input
                              type='text'
                              className='form-control form-control-solid'
                              placeholder='username'
                              disabled={formik.isSubmitting}
                              {...formik.getFieldProps(`socialLinks.${platform.key}.username`)}
                            />
                            {formik.touched.socialLinks?.[platform.key]?.username &&
                              formik.errors.socialLinks?.[platform.key]?.username && (
                                <div className='text-danger fs-7 mt-2'>
                                  {formik.errors.socialLinks[platform.key]?.username}
                                </div>
                              )}
                          </div>

                          <div className='col-md-8'>
                            <label className='form-label fw-bold'>
                              {intl.formatMessage(
                                {id: 'USER_MANAGEMENT.FIELD_SOCIAL_URL'},
                                {platform: platform.title}
                              )}
                            </label>
                            <input
                              type='url'
                              className='form-control form-control-solid'
                              placeholder={platform.placeholder}
                              disabled={formik.isSubmitting}
                              {...formik.getFieldProps(`socialLinks.${platform.key}.url`)}
                            />
                            {formik.touched.socialLinks?.[platform.key]?.url &&
                              formik.errors.socialLinks?.[platform.key]?.url && (
                                <div className='text-danger fs-7 mt-2'>
                                  {formik.errors.socialLinks[platform.key]?.url}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='d-flex justify-content-end pt-8'>
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={formik.isSubmitting || !formik.isValid}
                    >
                      {formik.isSubmitting
                        ? intl.formatMessage({id: 'USER_MANAGEMENT.SAVING'})
                        : intl.formatMessage({id: 'PROFILE.SOCIAL.SAVE'})}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Content>
  )
}
