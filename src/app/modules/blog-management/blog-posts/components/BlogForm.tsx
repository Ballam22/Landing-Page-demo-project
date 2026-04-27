import {useEffect, useState, useRef} from 'react'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import {useIntl} from 'react-intl'
import {Editor} from '@tinymce/tinymce-react'
import {BlogFormValues, BLOG_STATUSES} from '../model/Blog'
import {Category} from '../../category-management/model/Category'
import {useBlogManagement} from '../hooks/useBlogManagement'
import {toSlug} from '../../utils/slugUtils'

const MAX_READING_TIME = 120
const MAX_TITLE_LENGTH = 160
const MAX_EXCERPT_LENGTH = 300
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const TINYMCE_SCRIPT_SRC = `${import.meta.env.BASE_URL}tinymce/tinymce.min.js`

function hasTextContent(value: string | undefined): boolean {
  return Boolean(value?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())
}

type BlogFormProps = {
  mode: 'add' | 'edit'
  initialValues: BlogFormValues
  blogId: string | undefined
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
}

export function BlogForm({mode, initialValues, blogId, categories, onSuccess, onCancel}: BlogFormProps) {
  const intl = useIntl()
  const {addBlog, updateBlog} = useBlogManagement()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [contentError, setContentError] = useState<string | null>(null)
  const [editorReady, setEditorReady] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialValues.featuredImageUrl)
  const editorRef = useRef<{getContent: () => string} | null>(null)

  useEffect(() => {
    setImagePreview(initialValues.featuredImageUrl)
    setEditorReady(false)
  }, [initialValues.content, initialValues.featuredImageUrl])

  const validationSchema = Yup.object({
    title: Yup.string()
      .trim()
      .max(MAX_TITLE_LENGTH, intl.formatMessage({id: 'BLOG_MANAGEMENT.TITLE_TOO_LONG'}))
      .required(intl.formatMessage({id: 'BLOG_MANAGEMENT.TITLE_REQUIRED'})),
    slug: Yup.string()
      .trim()
      .required(intl.formatMessage({id: 'BLOG_MANAGEMENT.SLUG_REQUIRED'}))
      .matches(/^[a-z0-9-]+$/, intl.formatMessage({id: 'BLOG_MANAGEMENT.SLUG_INVALID'})),
    excerpt: Yup.string().max(
      MAX_EXCERPT_LENGTH,
      intl.formatMessage({id: 'BLOG_MANAGEMENT.EXCERPT_TOO_LONG'})
    ),
    categoryId: Yup.string().required(intl.formatMessage({id: 'BLOG_MANAGEMENT.CATEGORY_REQUIRED'})),
    readingTime: Yup.number()
      .transform((value, originalValue) => (originalValue === '' ? undefined : value))
      .integer(intl.formatMessage({id: 'BLOG_MANAGEMENT.READING_TIME_INVALID'}))
      .min(1, intl.formatMessage({id: 'BLOG_MANAGEMENT.READING_TIME_INVALID'}))
      .max(MAX_READING_TIME, intl.formatMessage({id: 'BLOG_MANAGEMENT.READING_TIME_TOO_LONG'}))
      .notRequired(),
    status: Yup.string().required(),
  })

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setSubmitError(intl.formatMessage({id: 'BLOG_MANAGEMENT.IMAGE_TYPE_INVALID'}))
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setSubmitError(intl.formatMessage({id: 'BLOG_MANAGEMENT.IMAGE_SIZE_EXCEEDED'}))
      e.target.value = ''
      return
    }
    setSubmitError(null)
    setFieldValue('featuredImageFile', file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (values: BlogFormValues) => {
    setSubmitError(null)
    const content = editorRef.current?.getContent() ?? values.content
    if (!hasTextContent(content)) {
      setContentError(intl.formatMessage({id: 'BLOG_MANAGEMENT.CONTENT_REQUIRED'}))
      return
    }
    setContentError(null)
    try {
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        excerpt: values.excerpt.trim() || undefined,
        categoryId: values.categoryId,
        featuredImageUrl: values.featuredImageUrl,
        content,
        readingTime: values.readingTime ? parseInt(values.readingTime, 10) : undefined,
        status: values.status,
      }

      if (mode === 'edit' && blogId) {
        await updateBlog(blogId, payload, values.featuredImageFile ?? undefined)
      } else {
        await addBlog(payload, values.featuredImageFile ?? undefined)
      }
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === 'SLUG_TAKEN') {
        setSubmitError(intl.formatMessage({id: 'BLOG_MANAGEMENT.SLUG_TAKEN'}))
      } else if (msg === 'IMAGE_TYPE_INVALID') {
        setSubmitError(intl.formatMessage({id: 'BLOG_MANAGEMENT.IMAGE_TYPE_INVALID'}))
      } else if (msg === 'IMAGE_SIZE_EXCEEDED') {
        setSubmitError(intl.formatMessage({id: 'BLOG_MANAGEMENT.IMAGE_SIZE_EXCEEDED'}))
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
      {({values, setFieldValue, isSubmitting}) => {
        const categoryOptions = categories.filter(
          (category) => category.isActive || category.id === values.categoryId
        )

        return (
        <Form placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <div className='row mb-5'>
            <div className='col-md-8'>
              <div className='mb-5'>
                <label className='form-label fw-bold required'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_TITLE'})}
                </label>
                <Field
                  name='title'
                  className='form-control form-control-solid'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value
                    setFieldValue('title', val)
                    if (mode === 'add') {
                      setFieldValue('slug', toSlug(val))
                    }
                  }}
                />
                <ErrorMessage name='title' component='div' className='text-danger mt-1 fs-7' />
              </div>

              <div className='mb-5'>
                <label className='form-label fw-bold required'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_SLUG'})}
                </label>
                <Field name='slug' className='form-control form-control-solid' />
                <ErrorMessage name='slug' component='div' className='text-danger mt-1 fs-7' />
              </div>

              <div className='mb-5'>
                <label className='form-label fw-bold'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_EXCERPT'})}
                </label>
                <Field
                  as='textarea'
                  name='excerpt'
                  className='form-control form-control-solid'
                  rows={3}
                />
                <ErrorMessage name='excerpt' component='div' className='text-danger mt-1 fs-7' />
              </div>

              <div className='mb-5'>
                <label className='form-label fw-bold required'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_CONTENT'})}
                </label>
                {!editorReady && (
                  <Field
                    as='textarea'
                    name='content'
                    className='form-control form-control-solid mb-3'
                    rows={12}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setFieldValue('content', e.target.value)
                      if (hasTextContent(e.target.value)) setContentError(null)
                    }}
                  />
                )}
                <Editor
                  licenseKey='gpl'
                  tinymceScriptSrc={TINYMCE_SCRIPT_SRC}
                  onScriptsLoadError={() => {
                    setEditorReady(false)
                  }}
                  onInit={(_evt, editor) => {
                    editorRef.current = editor
                    setEditorReady(true)
                  }}
                  value={values.content}
                  init={{
                    height: 400,
                    menubar: false,
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'preview',
                      'anchor',
                      'searchreplace',
                      'visualblocks',
                      'code',
                      'fullscreen',
                      'insertdatetime',
                      'media',
                      'table',
                      'help',
                      'wordcount',
                    ],
                    toolbar:
                      'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | code | help',
                    content_style: 'body { font-family: inherit; font-size: 14px }',
                    invalid_elements: 'script,iframe,object,embed,style,form,input,button',
                    convert_unsafe_embeds: true,
                    link_default_target: '_blank',
                    rel_list: [
                      {title: 'No referrer', value: 'noreferrer'},
                      {title: 'No opener', value: 'noopener'},
                    ],
                    promotion: false,
                  }}
                  onEditorChange={(content) => {
                    setFieldValue('content', content)
                    if (hasTextContent(content)) setContentError(null)
                  }}
                />
                {contentError && <div className='text-danger mt-1 fs-7'>{contentError}</div>}
              </div>
            </div>

            <div className='col-md-4'>
              <div className='mb-5'>
                <label className='form-label fw-bold required'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_STATUS'})}
                </label>
                <Field as='select' name='status' className='form-select form-select-solid'>
                  {BLOG_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Field>
              </div>

              <div className='mb-5'>
                <label className='form-label fw-bold required'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_CATEGORY'})}
                </label>
                <Field as='select' name='categoryId' className='form-select form-select-solid'>
                  <option value=''>
                    {intl.formatMessage({id: 'BLOG_MANAGEMENT.SELECT_CATEGORY'})}
                  </option>
                  {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {!c.isActive ? ' (Inactive)' : ''}
                      </option>
                    ))}
                </Field>
                <ErrorMessage name='categoryId' component='div' className='text-danger mt-1 fs-7' />
              </div>

              <div className='mb-5'>
                <label className='form-label fw-bold'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_READING_TIME'})}
                </label>
                <Field
                  name='readingTime'
                  type='number'
                  min='1'
                  className='form-control form-control-solid'
                />
                <ErrorMessage name='readingTime' component='div' className='text-danger mt-1 fs-7' />
              </div>

              <div className='mb-5'>
                <label className='form-label fw-bold'>
                  {intl.formatMessage({id: 'BLOG_MANAGEMENT.FIELD_FEATURED_IMAGE'})}
                </label>
                {imagePreview && (
                  <div className='mb-3'>
                    <img
                      src={imagePreview}
                      alt='preview'
                      className='rounded w-100'
                      style={{maxHeight: 160, objectFit: 'cover'}}
                    />
                  </div>
                )}
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/webp,image/gif'
                  className='form-control form-control-solid'
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                />
              </div>
            </div>
          </div>

          {submitError && (
            <div className='alert alert-danger py-3 mb-4'>{submitError}</div>
          )}

          <div className='d-flex justify-content-end gap-3'>
            <button type='button' className='btn btn-light' onClick={onCancel}>
              {intl.formatMessage({id: 'BLOG_MANAGEMENT.BTN_CANCEL'})}
            </button>
            <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
              {isSubmitting
                ? intl.formatMessage({id: 'BLOG_MANAGEMENT.BTN_SAVING'})
                : intl.formatMessage({id: 'BLOG_MANAGEMENT.BTN_SAVE'})}
            </button>
          </div>
        </Form>
        )
      }}
    </Formik>
  )
}
