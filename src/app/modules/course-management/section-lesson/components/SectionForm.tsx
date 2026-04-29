import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import type {Section, SectionFormValues} from '../../model/Section'
import {SECTION_FORM_DEFAULTS} from '../../model/Section'

const schema = Yup.object({
  title: Yup.string().required('Title is required'),
})

type Props = {
  initial?: Section
  onSave: (values: SectionFormValues) => Promise<void>
  onCancel: () => void
}

export function SectionForm({initial, onSave, onCancel}: Props) {
  const initialValues: SectionFormValues = initial
    ? {title: initial.title, sortOrder: initial.sortOrder}
    : SECTION_FORM_DEFAULTS

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={async (values, {setSubmitting}) => {
        try {
          await onSave(values)
        } finally {
          setSubmitting(false)
        }
      }}
      enableReinitialize
    >
      {({isSubmitting}) => (
        <Form placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <div className='mb-3'>
            <label className='form-label required'>Section Title</label>
            <Field name='title' className='form-control form-control-sm' placeholder='e.g. Introduction' />
            <ErrorMessage name='title' component='div' className='text-danger fs-7 mt-1' />
          </div>
          <div className='d-flex gap-2 justify-content-end'>
            <button type='button' className='btn btn-sm btn-light' onClick={onCancel}>
              Cancel
            </button>
            <button type='submit' className='btn btn-sm btn-primary' disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : initial ? 'Update' : 'Add Section'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
