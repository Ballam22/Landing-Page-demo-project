import {useRef} from 'react'
import {Formik, Form, Field, ErrorMessage, useFormikContext} from 'formik'
import * as Yup from 'yup'
import type {Lesson, LessonFormValues} from '../../model/Lesson'
import {LESSON_FORM_DEFAULTS} from '../../model/Lesson'
import {detectVideoDuration} from '../../service/lessonService'

const MAX_VIDEO_BYTES = 200 * 1024 * 1024 // 200 MB

const schema = Yup.object({
  title: Yup.string().required('Title is required'),
  sortOrder: Yup.number().min(0).required(),
})

function VideoFileInput() {
  const {setFieldValue, values} = useFormikContext<LessonFormValues>()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      alert('Video must be under 200 MB.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setFieldValue('videoFile', file)
    const dur = await detectVideoDuration(file)
    if (dur > 0) setFieldValue('duration', dur)
  }

  return (
    <div className='mb-3'>
      <label className='form-label'>Video File</label>
      <input
        ref={inputRef}
        type='file'
        accept='video/*'
        className='form-control form-control-sm'
        onChange={handleChange}
      />
      {values.videoFile && (
        <div className='text-muted fs-7 mt-1'>Selected: {values.videoFile.name}</div>
      )}
      <div className='form-text'>Max 200 MB. Accepts any video format.</div>
    </div>
  )
}

type Props = {
  initial?: Lesson
  onSave: (values: LessonFormValues) => Promise<void>
  onCancel: () => void
}

export function LessonForm({initial, onSave, onCancel}: Props) {
  const initialValues: LessonFormValues = initial
    ? {
        title: initial.title,
        description: initial.description ?? '',
        videoFile: null,
        duration: initial.duration,
        sortOrder: initial.sortOrder,
        isFree: initial.isFree,
      }
    : LESSON_FORM_DEFAULTS

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
            <label className='form-label required'>Lesson Title</label>
            <Field name='title' className='form-control form-control-sm' />
            <ErrorMessage name='title' component='div' className='text-danger fs-7 mt-1' />
          </div>

          <div className='mb-3'>
            <label className='form-label'>Description</label>
            <Field
              as='textarea'
              name='description'
              className='form-control form-control-sm'
              rows={2}
            />
          </div>

          <VideoFileInput />

          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='form-label'>Duration (seconds)</label>
              <Field
                type='number'
                name='duration'
                className='form-control form-control-sm'
                min={0}
                placeholder='Auto-detected'
              />
            </div>
            <div className='col-md-4'>
              <label className='form-label'>Sort Order</label>
              <Field
                type='number'
                name='sortOrder'
                className='form-control form-control-sm'
                min={0}
              />
            </div>
            <div className='col-md-4 d-flex align-items-end mb-1'>
              <div className='form-check'>
                <Field
                  type='checkbox'
                  name='isFree'
                  className='form-check-input'
                  id='lesson-is-free'
                />
                <label htmlFor='lesson-is-free' className='form-check-label'>
                  Free Preview
                </label>
              </div>
            </div>
          </div>

          <div className='d-flex gap-2 justify-content-end'>
            <button type='button' className='btn btn-sm btn-light' onClick={onCancel}>
              Cancel
            </button>
            <button type='submit' className='btn btn-sm btn-primary' disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : initial ? 'Update Lesson' : 'Add Lesson'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
