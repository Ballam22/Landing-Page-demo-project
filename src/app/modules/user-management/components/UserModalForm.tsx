import {FC, useMemo} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {useIntl} from 'react-intl'
import clsx from 'clsx'
import {Role, Status, UserFormValues} from '../_models'
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

const UserModalForm: FC<Props> = ({mode, userId, initialValues, existingEmails, onClose}) => {
  const intl = useIntl()
  const {addUser, updateUser} = useUserManagement()

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        fullName: Yup.string()
          .required(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_NAME_REQUIRED'})),
        email: Yup.string()
          .email(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_EMAIL_INVALID'}))
          .required(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_EMAIL_REQUIRED'}))
          .test(
            'unique-email',
            intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_EMAIL_DUPLICATE'}),
            (value) => !existingEmails.includes(value ?? '')
          ),
        role: Yup.string()
          .required(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_ROLE_REQUIRED'})),
        status: Yup.string()
          .required(intl.formatMessage({id: 'USER_MANAGEMENT.VALIDATION_STATUS_REQUIRED'})),
      }),
    [intl, existingEmails]
  )

  const formik = useFormik<UserFormValues>({
    initialValues,
    validationSchema,
    onSubmit: (values, {setSubmitting}) => {
      setSubmitting(true)
      if (mode === 'add') {
        addUser({
          fullName: values.fullName,
          email: values.email,
          role: values.role,
          status: values.status,
          avatarUrl: values.avatarUrl,
        })
      } else if (mode === 'edit' && userId) {
        updateUser(userId, {
          fullName: values.fullName,
          email: values.email,
          role: values.role,
          status: values.status,
          avatarUrl: values.avatarUrl,
        })
      }
      setSubmitting(false)
      onClose()
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      formik.setFieldValue('avatarUrl', reader.result as string)
      formik.setFieldValue('avatarFile', file)
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className='d-flex flex-column scroll-y px-5 px-xl-8'>

        {/* Avatar */}
        <div className='fv-row mb-7'>
          <label className='fw-bold fs-6 mb-2'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.FIELD_AVATAR'})}
          </label>
          <div className='d-flex align-items-center gap-4'>
            <div className='symbol symbol-circle symbol-60px overflow-hidden'>
              {formik.values.avatarUrl ? (
                <div className='symbol-label'>
                  <img src={formik.values.avatarUrl} alt='avatar preview' className='w-100' />
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
                accept='.jpg,.jpeg,.png,.gif,.webp'
                className='form-control form-control-solid form-control-sm'
                onChange={handleAvatarChange}
                disabled={formik.isSubmitting}
              />
              <div className='form-text text-muted'>
                {intl.formatMessage({id: 'USER_MANAGEMENT.UPLOAD_HINT'})}
              </div>
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
