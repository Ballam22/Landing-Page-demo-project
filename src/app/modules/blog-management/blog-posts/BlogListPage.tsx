import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../../_metronic/layout/core'
import {Blog} from './model/Blog'
import {BlogManagementProvider} from './BlogManagementContext'
import {useBlogManagement} from './hooks/useBlogManagement'
import {useBlogController} from './controller/useBlogController'
import {BlogsTable} from './components/BlogsTable'
import {DeleteConfirmDialog} from './components/DeleteConfirmDialog'

function BlogListContent() {
  const intl = useIntl()
  const navigate = useNavigate()
  const {deleteBlog} = useBlogManagement()
  const {blogs} = useBlogController()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const publishedCount = blogs.filter((blog) => blog.status === 'Published').length
  const draftCount = blogs.filter((blog) => blog.status === 'Draft').length
  const scheduledCount = blogs.filter((blog) => blog.status === 'Scheduled').length
  const reviewCount = blogs.filter((blog) => blog.status === 'Review').length

  const handleEdit = (blog: Blog) => {
    navigate(`/blog-management/blogs/${blog.id}/edit`)
  }

  const handleDelete = (blog: Blog) => {
    setBlogToDelete(blog)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return
    await deleteBlog(blogToDelete.id)
    setDeleteDialogOpen(false)
    setBlogToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setBlogToDelete(null)
  }

  return (
    <div className='blog-management-shell'>
      <div className='blog-management-header'>
        <div className='blog-management-header-content'>
          <div>
            <div className='blog-management-kicker'>
              {intl.formatMessage({id: 'BLOG_MANAGEMENT.HEADER_KICKER'})}
            </div>
            <h1 className='blog-management-title'>
              {intl.formatMessage({id: 'BLOG_MANAGEMENT.HEADER_TITLE'})}
            </h1>
            <p className='blog-management-subtitle'>
              {intl.formatMessage({id: 'BLOG_MANAGEMENT.HEADER_SUBTITLE'})}
            </p>
          </div>
          <button
            className='btn btn-lg'
            onClick={() => navigate('/blog-management/blogs/new')}
          >
            <i className='ki-duotone ki-plus fs-2' />
            {intl.formatMessage({id: 'BLOG_MANAGEMENT.ADD_BLOG'})}
          </button>
        </div>
      </div>

      <div className='blog-management-stats'>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'BLOG_MANAGEMENT.STAT_TOTAL'})}
          </div>
          <div className='blog-management-stat-value'>{blogs.length}</div>
          <div className='blog-management-stat-accent info' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'BLOG_MANAGEMENT.STAT_PUBLISHED'})}
          </div>
          <div className='blog-management-stat-value'>{publishedCount}</div>
          <div className='blog-management-stat-accent success' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'BLOG_MANAGEMENT.STAT_DRAFTS'})}
          </div>
          <div className='blog-management-stat-value'>{draftCount}</div>
          <div className='blog-management-stat-accent warning' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'BLOG_MANAGEMENT.STAT_REVIEW'})}
          </div>
          <div className='blog-management-stat-value'>{reviewCount + scheduledCount}</div>
          <div className='blog-management-stat-accent danger' />
        </div>
      </div>

      <div className='card blog-management-card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title blog-management-card-title'>
            <h2>{intl.formatMessage({id: 'BLOG_MANAGEMENT.TABLE_TITLE'})}</h2>
            <span>{intl.formatMessage({id: 'BLOG_MANAGEMENT.TABLE_SUBTITLE'})}</span>
          </div>
          <div className='card-toolbar'>
            <button
              className='btn btn-primary'
              onClick={() => navigate('/blog-management/blogs/new')}
            >
              <i className='ki-duotone ki-plus fs-2' />
              {intl.formatMessage({id: 'BLOG_MANAGEMENT.ADD_BLOG'})}
            </button>
          </div>
        </div>
        <div className='card-body py-4'>
          <BlogsTable onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        blog={blogToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

export default function BlogListPage() {
  const intl = useIntl()
  return (
    <BlogManagementProvider>
      <PageTitle>{intl.formatMessage({id: 'BLOG_MANAGEMENT.PAGE_TITLE'})}</PageTitle>
      <BlogListContent />
    </BlogManagementProvider>
  )
}
