import {FC} from 'react'
import {useQuery} from 'react-query'
import {Link} from 'react-router-dom'
import {KTIcon} from '../../../helpers'
import {getAllBlogs} from '../../../../app/modules/blog-management/blog-posts/repository/blogRepository'

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const formatActivityDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const ActivityDrawer: FC = () => {
  const {data: blogs = [], isLoading} = useQuery(['blogs'], getAllBlogs, {
    staleTime: 0,
    refetchInterval: 15_000,
  })
  const publishedBlogs = blogs.filter((blog) => blog.status === 'Published').slice(0, 12)

  return (
    <div
      id='kt_activities'
      className='bg-body'
      data-kt-drawer='true'
      data-kt-drawer-name='activities'
      data-kt-drawer-activate='true'
      data-kt-drawer-overlay='true'
      data-kt-drawer-width="{default:'300px', 'lg': '900px'}"
      data-kt-drawer-direction='end'
      data-kt-drawer-toggle='#kt_activities_toggle'
      data-kt-drawer-close='#kt_activities_close'
    >
      <div className='card shadow-none rounded-0'>
        <div className='card-header' id='kt_activities_header'>
          <h3 className='card-title fw-bolder text-gray-900'>Activity Log</h3>

          <div className='card-toolbar'>
            <button
              type='button'
              className='btn btn-sm btn-icon btn-active-light-primary me-n5'
              id='kt_activities_close'
            >
              <KTIcon iconName='cross' className='fs-1' />
            </button>
          </div>
        </div>

        <div className='card-body'>
          {isLoading && (
            <div className='d-flex align-items-center justify-content-center min-h-400px text-muted'>
              <span className='spinner-border spinner-border-sm me-2' />
              Loading activity
            </div>
          )}

          {!isLoading && !publishedBlogs.length && (
            <div className='d-flex align-items-center justify-content-center min-h-400px'>
              <div className='text-center mw-400px'>
                <div className='symbol symbol-75px mx-auto mb-6'>
                  <span className='symbol-label bg-light-warning text-warning'>
                    <KTIcon iconName='time' className='fs-1' />
                  </span>
                </div>

                <div className='fw-bolder text-gray-900 fs-3 mb-3'>No blog activity recorded</div>
                <div className='text-muted fs-6 mb-7'>
                  Published blogs will appear here as activity.
                </div>

                <Link to='/blog-management/blogs' className='btn btn-light-primary'>
                  View blog management
                </Link>
              </div>
            </div>
          )}

          {!isLoading && publishedBlogs.length > 0 && (
            <div className='timeline-label'>
              {publishedBlogs.map((blog) => (
                <div className='timeline-item' key={blog.id}>
                  <div className='timeline-label fw-bolder text-gray-800 fs-6'>
                    {formatActivityDate(blog.updatedAt || blog.createdAt)}
                  </div>
                  <div className='timeline-badge'>
                    <i className='fa fa-genderless text-success fs-1'></i>
                  </div>
                  <div className='timeline-content d-flex flex-column ps-3'>
                    <Link
                      to='/blog-management/blogs'
                      className='fw-bolder text-gray-900 text-hover-primary fs-5 mb-1'
                    >
                      {blog.title}
                    </Link>
                    <div className='text-muted fs-7 mb-2'>
                      Blog published in {blog.categoryName || 'Blog'}
                    </div>
                    <div className='rounded border border-gray-200 bg-light px-4 py-3 text-gray-700'>
                      {stripHtml(blog.excerpt || blog.content).slice(0, 180) || 'No preview text'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export {ActivityDrawer}
