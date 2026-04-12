import {useState, useEffect} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {getUserByToken, register} from '../core/_requests'
import {Link} from 'react-router-dom'
import {PasswordMeterComponent} from '../../../../_metronic/assets/ts/components'
import {useAuth} from '../core/Auth'
import {useIntl, FormattedMessage} from 'react-intl'
import {isMockAuthError} from '../core/_models'

const initialValues = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  changepassword: '',
  acceptTerms: false,
}

export function Registration() {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()

  const registrationSchema = Yup.object().shape({
    firstname: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('First name is required'),
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Email is required'),
    lastname: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Last name is required'),
    password: Yup.string()
      .min(8, 'Minimum 8 characters')
      .max(50, 'Maximum 50 symbols')
      .matches(/[a-zA-Z]/, 'Must contain at least one letter')
      .matches(/[0-9]/, 'Must contain at least one number')
      .required('Password is required'),
    changepassword: Yup.string()
      .min(8, 'Minimum 8 characters')
      .max(50, 'Maximum 50 symbols')
      .required('Password confirmation is required')
      .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match"),
    acceptTerms: Yup.bool().required('You must accept the terms and conditions'),
  })

  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        const {data: auth} = await register(
          values.email,
          values.firstname,
          values.lastname,
          values.password,
          values.changepassword
        )
        saveAuth(auth)
        const {data: user} = await getUserByToken(auth.api_token)
        setCurrentUser(user)
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        if (isMockAuthError(error) && error.type === 'duplicate_email') {
          setStatus(intl.formatMessage({id: 'AUTH.REGISTER.ERROR'}))
        } else {
          setStatus(intl.formatMessage({id: 'AUTH.REGISTER.ERROR'}))
        }
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    PasswordMeterComponent.bootstrap()
  }, [])

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_login_signup_form'
      onSubmit={formik.handleSubmit}
    >
      {/* begin::Heading */}
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>
          <FormattedMessage id='AUTH.REGISTER.TITLE' />
        </h1>
      </div>
      {/* end::Heading */}

      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      )}

      {/* begin::Form group Firstname */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>
          <FormattedMessage id='AUTH.REGISTER.FIRSTNAME_LABEL' />
        </label>
        <input
          placeholder={intl.formatMessage({id: 'AUTH.REGISTER.FIRSTNAME_LABEL'})}
          type='text'
          autoComplete='off'
          {...formik.getFieldProps('firstname')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.firstname && formik.errors.firstname},
            {'is-valid': formik.touched.firstname && !formik.errors.firstname}
          )}
        />
        {formik.touched.firstname && formik.errors.firstname && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.firstname}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      <div className='fv-row mb-8'>
        {/* begin::Form group Lastname */}
        <label className='form-label fw-bolder text-gray-900 fs-6'>
          <FormattedMessage id='AUTH.REGISTER.LASTNAME_LABEL' />
        </label>
        <input
          placeholder={intl.formatMessage({id: 'AUTH.REGISTER.LASTNAME_LABEL'})}
          type='text'
          autoComplete='off'
          {...formik.getFieldProps('lastname')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.lastname && formik.errors.lastname},
            {'is-valid': formik.touched.lastname && !formik.errors.lastname}
          )}
        />
        {formik.touched.lastname && formik.errors.lastname && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.lastname}</span>
            </div>
          </div>
        )}
        {/* end::Form group */}
      </div>

      {/* begin::Form group Email */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>
          <FormattedMessage id='AUTH.REGISTER.EMAIL_LABEL' />
        </label>
        <input
          placeholder={intl.formatMessage({id: 'AUTH.REGISTER.EMAIL_LABEL'})}
          type='email'
          autoComplete='off'
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {'is-valid': formik.touched.email && !formik.errors.email}
          )}
        />
        {formik.touched.email && formik.errors.email && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.email}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group Password */}
      <div className='fv-row mb-8' data-kt-password-meter='true'>
        <div className='mb-1'>
          <label className='form-label fw-bolder text-gray-900 fs-6'>
            <FormattedMessage id='AUTH.REGISTER.PASSWORD_LABEL' />
          </label>
          <div className='position-relative mb-3'>
            <input
              type='password'
              placeholder={intl.formatMessage({id: 'AUTH.REGISTER.PASSWORD_LABEL'})}
              autoComplete='off'
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                {'is-invalid': formik.touched.password && formik.errors.password},
                {'is-valid': formik.touched.password && !formik.errors.password}
              )}
            />
            {formik.touched.password && formik.errors.password && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.password}</span>
                </div>
              </div>
            )}
          </div>
          {/* begin::Meter */}
          <div
            className='d-flex align-items-center mb-3'
            data-kt-password-meter-control='highlight'
          >
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
          </div>
          {/* end::Meter */}
        </div>
        <div className='text-muted'>
          <FormattedMessage id='AUTH.REGISTER.PASSWORD_HINT' />
        </div>
      </div>
      {/* end::Form group */}

      {/* begin::Form group Confirm password */}
      <div className='fv-row mb-5'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>
          <FormattedMessage id='AUTH.REGISTER.CONFIRM_PASSWORD_LABEL' />
        </label>
        <input
          type='password'
          placeholder={intl.formatMessage({id: 'AUTH.REGISTER.CONFIRM_PASSWORD_LABEL'})}
          autoComplete='off'
          {...formik.getFieldProps('changepassword')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.changepassword && formik.errors.changepassword},
            {'is-valid': formik.touched.changepassword && !formik.errors.changepassword}
          )}
        />
        {formik.touched.changepassword && formik.errors.changepassword && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.changepassword}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group - Accept Terms */}
      <div className='fv-row mb-8'>
        <label className='form-check form-check-inline' htmlFor='kt_login_toc_agree'>
          <input
            className='form-check-input'
            type='checkbox'
            id='kt_login_toc_agree'
            {...formik.getFieldProps('acceptTerms')}
          />
          <span>
            <FormattedMessage id='AUTH.REGISTER.ACCEPT_TERMS' />{' '}
            <a
              href='https://keenthemes.com/metronic/?page=faq'
              target='_blank'
              className='ms-1 link-primary'
            >
              <FormattedMessage id='AUTH.REGISTER.TERMS_LINK' />
            </a>
            .
          </span>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.acceptTerms}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className='text-center'>
        <button
          type='submit'
          id='kt_sign_up_submit'
          className='btn btn-lg btn-primary w-100 mb-5'
          disabled={formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms}
        >
          {!loading && (
            <span className='indicator-label'>
              <FormattedMessage id='AUTH.REGISTER.SUBMIT' />
            </span>
          )}
          {loading && (
            <span className='indicator-progress' style={{display: 'block'}}>
              Please wait...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
        <Link to='/auth/login'>
          <button
            type='button'
            id='kt_login_signup_form_cancel_button'
            className='btn btn-lg btn-light-primary w-100 mb-5'
          >
            <FormattedMessage id='AUTH.REGISTER.CANCEL' />
          </button>
        </Link>
      </div>
      {/* end::Form group */}

      {/* begin::Sign in link */}
      <div className='text-gray-500 text-center fw-semibold fs-6'>
        <FormattedMessage id='AUTH.REGISTER.HAVE_ACCOUNT' />{' '}
        <Link to='/auth/login' className='link-primary fw-semibold'>
          <FormattedMessage id='AUTH.REGISTER.SIGN_IN_LINK' />
        </Link>
      </div>
      {/* end::Sign in link */}
    </form>
  )
}
