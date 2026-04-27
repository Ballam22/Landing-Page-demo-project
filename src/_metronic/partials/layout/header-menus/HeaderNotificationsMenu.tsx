import {FC} from 'react'
import {useQuery} from 'react-query'
import {Link} from 'react-router-dom'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {getAllBlogs} from '../../../../app/modules/blog-management/blog-posts/repository/blogRepository'

const formatPublishedDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const HeaderNotificationsMenu: FC = () => {
  const {data: blogs = [], isLoading} = useQuery(['blogs'], getAllBlogs, {
    staleTime: 0,
    refetchInterval: 15_000,
  })
  const publishedBlogs = blogs.filter((blog) => blog.status === 'Published').slice(0, 5)

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px'
      data-kt-menu='true'
    >
      <div
        className='d-flex flex-column bgi-no-repeat rounded-top'
        style={{backgroundImage: `url('${toAbsoluteUrl('media/misc/menu-header-bg.jpg')}')`}}
      >
        <h3 className='text-white fw-bold px-9 mt-10 mb-3'>Notifications</h3>
        <div className='text-white opacity-75 px-9 pb-8'>
          {publishedBlogs.length
            ? `${publishedBlogs.length} latest published blog notification${
                publishedBlogs.length === 1 ? '' : 's'
              }`
            : 'Blog notifications will appear here when posts are published.'}
        </div>
      </div>

      <div className='px-7 py-6'>
        {isLoading && (
          <div className='text-center text-muted py-8'>
            <span className='spinner-border spinner-border-sm me-2' />
            Loading notifications
          </div>
        )}

        {!isLoading && !publishedBlogs.length && (
          <div className='text-center py-8'>
            <div className='symbol symbol-65px mx-auto mb-5'>
              <span className='symbol-label bg-light-primary text-primary'>
                <KTIcon iconName='notification-bing' className='fs-1' />
              </span>
            </div>

            <div className='fw-bolder text-gray-900 fs-4 mb-2'>No blog notifications yet</div>
            <div className='text-muted fs-6'>
              Publish a blog and it will show here as a notification.
            </div>
          </div>
        )}

        {!isLoading && publishedBlogs.length > 0 && (
          <div className='d-flex flex-column gap-3'>
            {publishedBlogs.map((blog) => (
              <Link
                key={blog.id}
                to='/blog-management/blogs'
                className='d-flex align-items-start gap-3 rounded border border-gray-200 px-4 py-3 bg-hover-light text-decoration-none'
              >
                <span className='symbol symbol-40px flex-shrink-0'>
                  <span className='symbol-label bg-light-success text-success'>
                    <KTIcon iconName='book-open' className='fs-3' />
                  </span>
                </span>
                <span className='min-w-0'>
                  <span className='fw-bolder text-gray-900 d-block text-truncate'>
                    {blog.title}
                  </span>
                  <span className='text-muted fs-7 d-block'>
                    New blog published in {blog.categoryName || 'Blog'}
                  </span>
                  <span className='text-muted fs-8 d-block'>
                    {formatPublishedDate(blog.updatedAt || blog.createdAt)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className='px-7 pb-7'>
        <Link to='/blog-management/blogs' className='btn btn-light-primary w-100'>
          View blog management
        </Link>
      </div>
    </div>
  )
}

export {HeaderNotificationsMenu}
