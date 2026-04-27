import {useParams, useNavigate, Link} from 'react-router-dom'
import {useQuery} from 'react-query'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../../_metronic/layout/core'
import {BLOG_FORM_DEFAULTS} from './model/Blog'
import {getBlogById} from './repository/blogRepository'
import {getAllCategories} from '../category-management/repository/categoryRepository'
import {BlogManagementProvider} from './BlogManagementContext'
import {BlogForm} from './components/BlogForm'

function BlogFormContent() {
  const intl = useIntl()
  const {id} = useParams<{id: string}>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {data: blog, isLoading: blogLoading} = useQuery(
    ['blogs', id],
    () => getBlogById(id!),
    {enabled: isEdit, staleTime: 0}
  )

  const {data: categories = [], isLoading: categoriesLoading} = useQuery(
    ['categories'],
    getAllCategories,
    {staleTime: 0}
  )

  const isLoading = blogLoading || categoriesLoading

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center py-10'>
        <span className='spinner-border text-primary' />
      </div>
    )
  }

  const initialValues = blog
    ? {
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt ?? '',
        categoryId: blog.categoryId,
        featuredImageFile: null,
        featuredImageUrl: blog.featuredImageUrl,
        content: blog.content,
        readingTime: blog.readingTime?.toString() ?? '',
        status: blog.status,
      }
    : BLOG_FORM_DEFAULTS

  const pageTitle = isEdit
    ? intl.formatMessage({id: 'BLOG_MANAGEMENT.EDIT_BLOG'})
    : intl.formatMessage({id: 'BLOG_MANAGEMENT.ADD_BLOG'})

  const activeCategories = categories.filter((category) => category.isActive)

  if (!isEdit && activeCategories.length === 0) {
    return (
      <>
        <PageTitle>{pageTitle}</PageTitle>
        <div className='card'>
          <div className='card-body py-10 text-center'>
            <p className='fs-5 text-gray-600 mb-4'>
              {intl.formatMessage({id: 'BLOG_MANAGEMENT.NO_ACTIVE_CATEGORIES'})}
            </p>
            <Link to='/blog-management/categories' className='btn btn-primary'>
              {intl.formatMessage({id: 'BLOG_MANAGEMENT.GO_TO_CATEGORIES'})}
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle>{pageTitle}</PageTitle>
      <div className='card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title d-flex flex-column'>
            <h2 className='fw-bolder'>{pageTitle}</h2>
            {isEdit && blog && (
              <span className='text-muted fs-7 mt-1'>
                {intl.formatMessage({id: 'BLOG_MANAGEMENT.LAST_UPDATED'})}: {new Date(blog.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className='card-body py-4'>
          <BlogForm
            mode={isEdit ? 'edit' : 'add'}
            initialValues={initialValues}
            blogId={id}
            categories={categories}
            onSuccess={() => navigate('/blog-management/blogs')}
            onCancel={() => navigate('/blog-management/blogs')}
          />
        </div>
      </div>
    </>
  )
}

export default function BlogFormPage() {
  return (
    <BlogManagementProvider>
      <BlogFormContent />
    </BlogManagementProvider>
  )
}
