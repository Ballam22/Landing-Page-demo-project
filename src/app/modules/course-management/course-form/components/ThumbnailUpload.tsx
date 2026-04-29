import {useRef, useState} from 'react'
import {useFormikContext} from 'formik'
import {useIntl} from 'react-intl'
import type {CourseFormValues} from '../../model/Course'

type ThumbnailUploadProps = {
  currentUrl?: string
}

export function ThumbnailUpload({currentUrl}: ThumbnailUploadProps) {
  const intl = useIntl()
  const {setFieldValue} = useFormikContext<CourseFormValues>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(currentUrl)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFieldValue('thumbnailFile', file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleRemove() {
    setFieldValue('thumbnailFile', null)
    setPreview(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className='mb-7'>
      <label className='form-label fw-bold'>
        {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.FIELD_THUMBNAIL'})}
      </label>
      {preview && (
        <div className='mb-3'>
          <img
            src={preview}
            alt='thumbnail preview'
            style={{maxHeight: 160, maxWidth: '100%', objectFit: 'cover', borderRadius: 6}}
          />
          <div className='mt-2'>
            <button type='button' className='btn btn-sm btn-light-danger' onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='form-control'
        onChange={handleChange}
      />
      <div className='form-text text-muted'>
        {intl.formatMessage({id: 'COURSE_MANAGEMENT.COURSES.THUMBNAIL_HINT'})}
      </div>
    </div>
  )
}
