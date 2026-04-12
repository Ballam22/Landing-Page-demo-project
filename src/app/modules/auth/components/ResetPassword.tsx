import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {useFormik} from 'formik'
import {resetPassword} from '../core/_requests'
import {useIntl, FormattedMessage} from 'react-intl'
import {isMockAuthError} from '../core/_models'

const initialValues = {
  newPassword: '',
  confirmPassword: '',
}

export function ResetPassword() {
  const intl = useIntl()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [loading, setLoading] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  const resetPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, 'Minimum 8 characters')
      .max(50, 'Maximum 50 symbols')
      .matches(/[a-zA-Z]/, 'Must contain at least one letter')
      .matches(/[0-9]/, 'Must contain at least one number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Password confirmation is required')
      .oneOf([Yup.ref('newPassword')], "Passwords don't match"),
  })

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setLoading(true)
      setTokenError(false)
      try {
        await resetPassword(token, values.newPassword)
        navigate('/auth/login?reset=success', {replace: true})
      } catch (error) {
        console.error(error)
        if (isMockAuthError(error) && error.type === 'invalid_token') {
          setTokenError(true)
        }
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_password_reset_confirm_form'
      onSubmit={formik.handleSubmit}
    >
      <div className='text-center mb-10'>
        <h1 className='text-gray-900 fw-bolder mb-3'>
          <FormattedMessage id='AUTH.RESET.TITLE' />
        </h1>
      </div>

      {tokenError && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>
            <FormattedMessage id='AUTH.RESET.INVALID_TOKEN' />
          </div>
          <div className='mt-3'>
            <Link to='/auth/forgot-password' className='link-danger fw-semibold'>
              <FormattedMessage id='AUTH.RESET.REQUEST_NEW' />
            </Link>
          </div>
        </div>
      )}

      {/* begin::Form group New Password */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>
          <FormattedMessage id='AUTH.RESET.NEW_PASSWORD_LABEL' />
        </label>
        <input
          type='password'
          placeholder={intl.formatMessage({id: 'AUTH.RESET.NEW_PASSWORD_LABEL'})}
          autoComplete='off'
          {...formik.getFieldProps('newPassword')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.newPassword && formik.errors.newPassword},
            {'is-valid': formik.touched.newPassword && !formik.errors.newPassword}
          )}
        />
        {formik.touched.newPassword && formik.errors.newPassword && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.newPassword}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group Confirm Password */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>
          <FormattedMessage id='AUTH.RESET.CONFIRM_PASSWORD_LABEL' />
        </label>
        <input
          type='password'
          placeholder={intl.formatMessage({id: 'AUTH.RESET.CONFIRM_PASSWORD_LABEL'})}
          autoComplete='off'
          {...formik.getFieldProps('confirmPassword')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword},
            {'is-valid': formik.touched.confirmPassword && !formik.errors.confirmPassword}
          )}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.confirmPassword}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
        <button
          type='submit'
          id='kt_password_reset_confirm_submit'
          className='btn btn-primary me-4'
          disabled={formik.isSubmitting || !formik.isValid || !token}
        >
          <span className='indicator-label'>
            <FormattedMessage id='AUTH.RESET.SUBMIT' />
          </span>
          {loading && (
            <span className='indicator-progress'>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
        <Link to='/auth/login'>
          <button type='button' className='btn btn-light'>
            <FormattedMessage id='AUTH.FORGOT.CANCEL' />
          </button>
        </Link>
      </div>
      {/* end::Form group */}
    </form>
  )
}
