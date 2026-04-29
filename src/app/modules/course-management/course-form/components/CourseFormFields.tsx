import {useEffect} from 'react'
import {Field, ErrorMessage, useFormikContext} from 'formik'
import {useIntl} from 'react-intl'
import {useQuery} from 'react-query'
import type {CourseFormValues} from '../../model/Course'
import {toSlug} from '../../service/courseService'
import {ThumbnailUpload} from './ThumbnailUpload'
import {getAllCategories} from '../../../../modules/blog-management/category-management/repository/categoryRepository'

type CourseFormFieldsProps = {
  currentThumbnailUrl?: string
}

const STATUSES = ['Draft', 'Published', 'Archived'] as const

export function CourseFormFields({currentThumbnailUrl}: CourseFormFieldsProps) {
  const intl = useIntl()
  const {values, setFieldValue} = useFormikContext<CourseFormValues>()

  const {data: categories = []} = useQuery(['categories'], getAllCategories, {staleTime: 0})

  useEffect(() => {
    if (values.title && !values.slug) {
      setFieldValue('slug', toSlug(values.title))
    }
  }, [setFieldValue, values.slug, values.title])

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setFieldValue('title', val)
    setFieldValue('slug', toSlug(val))
  }

  return (
    <>
      <div className='mb-7'>
        <label className='form-label fw-bold required'>
          {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_TITLE'})}
        </label>
        <Field
          name='title'
          className='form-control form-control-solid'
          onChange={handleTitleChange}
        />
        <ErrorMessage name='title' component='div' className='text-danger mt-1 fs-7' />
      </div>

      <div className='mb-7'>
        <label className='form-label fw-bold required'>
          {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_SLUG'})}
        </label>
        <Field
          name='slug'
          className='form-control form-control-solid'
          placeholder={intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.SLUG_PLACEHOLDER'})}
        />
        <ErrorMessage name='slug' component='div' className='text-danger mt-1 fs-7' />
      </div>

      <div className='mb-7'>
        <label className='form-label fw-bold'>
          {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_DESCRIPTION'})}
        </label>
        <Field
          as='textarea'
          name='description'
          className='form-control form-control-solid'
          rows={4}
        />
      </div>

      <div className='mb-7'>
        <label className='form-label fw-bold'>
          {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_CATEGORY'})}
        </label>
        <Field as='select' name='categoryId' className='form-select form-select-solid'>
          <option value=''>
            {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.NO_CATEGORY'})}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Field>
      </div>

      <div className='mb-7'>
        <label className='form-label fw-bold required'>
          {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_STATUS'})}
        </label>
        <Field as='select' name='status' className='form-select form-select-solid'>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {intl.formatMessage({id: `COURSE_MANAGEMENT.COURSES.STATUS_${s.toUpperCase()}`})}
            </option>
          ))}
        </Field>
      </div>

      <div className='mb-7'>
        <label className='form-label fw-bold'>
          {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_SORT_ORDER'})}
        </label>
        <Field name='sortOrder' type='number' className='form-control form-control-solid' />
        <ErrorMessage name='sortOrder' component='div' className='text-danger mt-1 fs-7' />
      </div>

      <ThumbnailUpload currentUrl={currentThumbnailUrl} />
    </>
  )
}
