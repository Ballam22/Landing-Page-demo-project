import {useEffect, useState} from 'react'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import {supabase} from '../../../../lib/supabaseClient'
import {ENROLL_USER_FORM_DEFAULTS} from '../../model/Enrollment'
import type {EnrollUserFormValues} from '../../model/Enrollment'

const schema = Yup.object({
  userId: Yup.string().required('User is required'),
  courseId: Yup.string().required('Course is required'),
})

type SelectOption = {value: string; label: string}

type Props = {
  onEnroll: (values: EnrollUserFormValues) => Promise<void>
  onClose: () => void
}

export function EnrollUserModal({onEnroll, onClose}: Props) {
  const [users, setUsers] = useState<SelectOption[]>([])
  const [courses, setCourses] = useState<SelectOption[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoadError(null)
      const [{data: usersData, error: usersError}, {data: coursesData, error: coursesError}] =
        await Promise.all([
          supabase.from('users').select('id, full_name, email').order('full_name'),
          supabase.from('courses').select('id, title').eq('status', 'Published').order('title'),
        ])
      if (usersError) {
        setLoadError(usersError.message)
        return
      }
      if (coursesError) {
        setLoadError(coursesError.message)
        return
      }
      setUsers(
        (usersData ?? []).map((u: {id: string; full_name: string; email: string}) => ({
          value: u.id,
          label: `${u.full_name} (${u.email})`,
        }))
      )
      setCourses(
        (coursesData ?? []).map((c: {id: string; title: string}) => ({
          value: c.id,
          label: c.title,
        }))
      )
    }
    load()
  }, [])

  async function handleSubmit(values: EnrollUserFormValues) {
    setSubmitError(null)
    try {
      await onEnroll(values)
      onClose()
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div
      className='modal fade show d-block course-management-modal'
      tabIndex={-1}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title fw-bold'>Enroll User in Course</h5>
            <button type='button' className='btn-close' onClick={onClose} />
          </div>

          <Formik
            initialValues={ENROLL_USER_FORM_DEFAULTS}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({isSubmitting}) => (
              <Form placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                <div className='modal-body'>
                  {loadError && (
                    <div className='alert alert-danger py-2 mb-3 fs-7'>{loadError}</div>
                  )}

                  <div className='mb-4'>
                    <label className='form-label required'>User</label>
                    <Field as='select' name='userId' className='form-select form-select-solid'>
                      <option value=''>Select a user…</option>
                      {users.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name='userId' component='div' className='text-danger fs-7 mt-1' />
                  </div>

                  <div className='mb-4'>
                    <label className='form-label required'>Course</label>
                    <Field as='select' name='courseId' className='form-select form-select-solid'>
                      <option value=''>Select a course…</option>
                      {courses.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name='courseId'
                      component='div'
                      className='text-danger fs-7 mt-1'
                    />
                  </div>

                  {submitError && (
                    <div className='alert alert-danger py-2 fs-7'>{submitError}</div>
                  )}
                </div>

                <div className='modal-footer'>
                  <button type='button' className='btn btn-light' onClick={onClose}>
                    Cancel
                  </button>
                  <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
                    {isSubmitting ? 'Enrolling…' : 'Enroll'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
