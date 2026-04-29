import {useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useSingleCourse, useCourseController} from '../controller/useCourseController'
import {COURSE_FORM_DEFAULTS} from '../model/Course'
import type {CourseFormValues} from '../model/Course'
import {CourseFormFields} from './components/CourseFormFields'
import {SectionList} from '../section-lesson/components/SectionList'

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  slug: Yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'),
  sortOrder: Yup.number().min(0).required(),
})

function CourseFormContent() {
  const intl = useIntl()
  const {id} = useParams<{id: string}>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const {addCourse, updateCourse} = useCourseController()
  const {course, isLoading} = useSingleCourse(id ?? '')
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (isLoading && isEdit) {
    return (
      <div className='d-flex justify-content-center py-10'>
        <span className='spinner-border text-primary' />
      </div>
    )
  }

  const initialValues: CourseFormValues = course
    ? {
        title: course.title,
        slug: course.slug,
        description: course.description ?? '',
        categoryId: course.categoryId ?? '',
        thumbnailFile: null,
        status: course.status,
        sortOrder: course.sortOrder,
      }
    : COURSE_FORM_DEFAULTS

  async function handleSubmit(values: CourseFormValues) {
    setSubmitError(null)
    try {
      if (isEdit && id) {
        await updateCourse(id, values)
      } else {
        const created = await addCourse(values)
        navigate(`/course-management/edit/${created.id}`)
        return
      }
      navigate('/course-management/courses')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : String(err))
    }
  }

  const pageTitle = isEdit
    ? intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.EDIT'})
    : intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.ADD'})

  return (
    <>
      <PageTitle>{pageTitle}</PageTitle>
      <div className='card course-management-card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title course-management-card-title'>
            <h2>{pageTitle}</h2>
            <span>Keep course details, publishing state, sections, and lessons aligned.</span>
          </div>
          <div className='card-toolbar'>
            <button
              type='button'
              className='btn btn-light'
              onClick={() => navigate('/course-management/courses')}
            >
              {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.BACK_TO_LIST'})}
            </button>
          </div>
        </div>
        <div className='card-body py-3'>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({isSubmitting}) => (
              <Form placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                <CourseFormFields currentThumbnailUrl={course?.thumbnailUrl} />

                {submitError && (
                  <div className='alert alert-danger py-3 mb-4'>{submitError}</div>
                )}

                <div className='d-flex justify-content-end gap-3 mt-6'>
                  <button
                    type='button'
                    className='btn btn-light'
                    onClick={() => navigate('/course-management/courses')}
                  >
                    Cancel
                  </button>
                  <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
                    {isSubmitting
                      ? intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.SAVING'})
                      : intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.SAVE'})}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          {isEdit && id && (
            <div className='mt-8 border-top pt-6'>
              <SectionList courseId={id} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function CourseFormPage() {
  return <CourseFormContent />
}
