import {useState} from 'react'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import {useIntl} from 'react-intl'
import {CategoryFormValues} from '../model/Category'
import {useCategoryManagement} from '../hooks/useCategoryManagement'
import {toSlug} from '../../utils/slugUtils'

type CategoryModalFormProps = {
  mode: 'add' | 'edit'
  initialValues: CategoryFormValues
  categoryId: string | undefined
  onClose: () => void
}

export function CategoryModalForm({mode, initialValues, categoryId, onClose}: CategoryModalFormProps) {
  const intl = useIntl()
  const {addCategory, updateCategory} = useCategoryManagement()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validationSchema = Yup.object({
    name: Yup.string().required(intl.formatMessage({id: 'CATEGORY_MANAGEMENT.NAME_REQUIRED'})),
    slug: Yup.string()
      .required(intl.formatMessage({id: 'CATEGORY_MANAGEMENT.SLUG_REQUIRED'}))
      .matches(/^[a-z0-9-]+$/, intl.formatMessage({id: 'CATEGORY_MANAGEMENT.SLUG_INVALID'})),
    sortOrder: Yup.number()
      .min(0, intl.formatMessage({id: 'CATEGORY_MANAGEMENT.SORT_ORDER_MIN'}))
      .required(),
    isActive: Yup.boolean().required(),
  })

  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitError(null)
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      }
      if (mode === 'edit' && categoryId) {
        await updateCategory(categoryId, payload)
      } else {
        await addCategory(payload)
      }
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === 'SLUG_TAKEN') {
        setSubmitError(intl.formatMessage({id: 'CATEGORY_MANAGEMENT.SLUG_TAKEN'}))
      } else {
        setSubmitError(msg)
      }
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({values, setFieldValue, isSubmitting}) => (
        <Form placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <div className='mb-5'>
            <label className='form-label fw-bold required'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.FIELD_NAME'})}
            </label>
            <Field
              name='name'
              className='form-control form-control-solid'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value
                setFieldValue('name', val)
                setFieldValue('slug', toSlug(val))
              }}
            />
            <ErrorMessage name='name' component='div' className='text-danger mt-1 fs-7' />
          </div>

          <div className='mb-5'>
            <label className='form-label fw-bold required'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.FIELD_SLUG'})}
            </label>
            <Field name='slug' className='form-control form-control-solid' />
            <ErrorMessage name='slug' component='div' className='text-danger mt-1 fs-7' />
          </div>

          <div className='mb-5'>
            <label className='form-label fw-bold'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.FIELD_DESCRIPTION'})}
            </label>
            <Field
              as='textarea'
              name='description'
              className='form-control form-control-solid'
              rows={3}
            />
          </div>

          <div className='mb-5'>
            <label className='form-label fw-bold required'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.FIELD_SORT_ORDER'})}
            </label>
            <Field name='sortOrder' type='number' className='form-control form-control-solid' />
            <ErrorMessage name='sortOrder' component='div' className='text-danger mt-1 fs-7' />
          </div>

          <div className='mb-5 form-check form-switch'>
            <input
              className='form-check-input'
              type='checkbox'
              id='isActive'
              checked={values.isActive}
              onChange={(e) => setFieldValue('isActive', e.target.checked)}
            />
            <label className='form-check-label fw-bold' htmlFor='isActive'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.FIELD_IS_ACTIVE'})}
            </label>
          </div>

          {submitError && (
            <div className='alert alert-danger py-3 mb-4'>{submitError}</div>
          )}

          <div className='d-flex justify-content-end gap-3'>
            <button type='button' className='btn btn-light' onClick={onClose}>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.BTN_CANCEL'})}
            </button>
            <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
              {isSubmitting
                ? intl.formatMessage({id: 'CATEGORY_MANAGEMENT.BTN_SAVING'})
                : intl.formatMessage({id: 'CATEGORY_MANAGEMENT.BTN_SAVE'})}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
