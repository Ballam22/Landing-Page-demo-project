import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import {useIntl} from 'react-intl'
import {StarRating} from '../../section-lesson/components/StarRating'
import {REVIEW_FORM_DEFAULTS} from '../../model/Review'
import type {ReviewFormValues} from '../../model/Review'

const reviewSchema = Yup.object({
  rating: Yup.number().min(1, 'Please select a rating').max(5).required(),
  comment: Yup.string(),
})

type ReviewFormProps = {
  onSubmit: (values: ReviewFormValues) => Promise<void>
  submitting: boolean
}

export function ReviewForm({onSubmit, submitting}: ReviewFormProps) {
  const intl = useIntl()

  return (
    <Formik
      initialValues={REVIEW_FORM_DEFAULTS}
      validationSchema={reviewSchema}
      onSubmit={async (values, helpers) => {
        await onSubmit(values)
        helpers.resetForm()
      }}
    >
      {({values, setFieldValue}) => (
        <Form placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <div className='mb-5'>
            <StarRating
              value={values.rating}
              interactive
              onChange={(n) => setFieldValue('rating', n)}
            />
            <ErrorMessage name='rating' component='div' className='text-danger mt-1 fs-7' />
          </div>
          <div className='mb-5'>
            <Field
              as='textarea'
              name='comment'
              className='form-control form-control-solid'
              rows={4}
              placeholder={intl.formatMessage({id: 'COURSE_DETAIL.REVIEW_PLACEHOLDER'})}
            />
          </div>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={submitting}
          >
            {submitting && <span className='spinner-border spinner-border-sm me-2' />}
            {intl.formatMessage({id: 'COURSE_DETAIL.SUBMIT_REVIEW'})}
          </button>
        </Form>
      )}
    </Formik>
  )
}
