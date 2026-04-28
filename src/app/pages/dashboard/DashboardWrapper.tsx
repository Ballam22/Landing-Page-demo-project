import {FC, useState} from 'react'
import {Link} from 'react-router-dom'
import {useIntl} from 'react-intl'
import {useQuery} from 'react-query'
import {PageTitle} from '../../../_metronic/layout/core'
import {ToolbarWrapper} from '../../../_metronic/layout/components/toolbar'
import {Content} from '../../../_metronic/layout/components/content'
import {useAuth} from '../../modules/auth'
import {useUserController} from '../../modules/user-management/controller/useUserController'
import {useUserDetailDrawer} from '../../modules/user-management/controller/useUserDetailDrawer'
import {UserDetailDrawer} from '../../modules/user-management/components/UserDetailDrawer'
import {Blog} from '../../modules/blog-management/blog-posts/model/Blog'
import {getAllBlogs} from '../../modules/blog-management/blog-posts/repository/blogRepository'
import '../../modules/blog-management/BlogManagement.css'

function sanitizePreviewHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

function getPlainTextPreview(value: string | undefined, fallback: string): string {
  const text = (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return fallback
  return text.length > 220 ? `${text.slice(0, 220).trim()}...` : text
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const DashboardPage: FC = () => {
  const intl = useIntl()
  const {currentUser} = useAuth()
  const {users, isLoading, error} = useUserController()
  const {data: blogs = [], isLoading: blogsLoading} = useQuery(['blogs'], getAllBlogs, {staleTime: 0})
  const {selectedDetailUser, isOpen, openDrawer, closeDrawer} = useUserDetailDrawer()
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null)

  const activeUsers = users.filter((user) => user.status === 'Active').length
  const inactiveUsers = users.filter((user) => user.status === 'Inactive').length
  const adminUsers = users.filter((user) => user.role === 'Admin').length
  const managerUsers = users.filter((user) => user.role === 'Manager').length
  const recentUsers = users.slice(0, 5)
  const latestBlog = blogs[0]
  const latestBlogPreview = latestBlog
    ? latestBlog.excerpt || getPlainTextPreview(latestBlog.content, intl.formatMessage({id: 'DASHBOARD.NO_BLOG_EXCERPT'}))
    : ''
  const publishedBlogs = blogs.filter((blog) => blog.status === 'Published').length
  const draftBlogs = blogs.filter((blog) => blog.status === 'Draft').length
  const reviewBlogs = blogs.filter((blog) => blog.status === 'Review').length
  const scheduledBlogs = blogs.filter((blog) => blog.status === 'Scheduled').length
  const displayName =
    currentUser?.fullname?.trim() ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim() ||
    currentUser?.email ||
    'there'

  return (
    <>
      <ToolbarWrapper showActions={false} />
      <Content>
        <div className='blog-management-shell'>
          <div className='blog-management-header'>
            <div className='blog-management-header-content'>
              <div>
                <div className='blog-management-kicker'>
                  {intl.formatMessage({id: 'DASHBOARD.OVERVIEW'})}
                </div>
                <h1 className='blog-management-title'>
                  {intl.formatMessage({id: 'DASHBOARD.WELCOME_BACK'}, {name: displayName})}
                </h1>
                <p className='blog-management-subtitle'>
                  {intl.formatMessage({id: 'DASHBOARD.DESCRIPTION'})}
                </p>
              </div>
            </div>
          </div>

          <div className='blog-management-stats'>
            <div className='blog-management-stat'>
              <div className='blog-management-stat-label'>
                {intl.formatMessage({id: 'DASHBOARD.TOTAL_USERS'})}
              </div>
              <div className='blog-management-stat-value'>{isLoading ? '--' : users.length}</div>
              <div className='blog-management-stat-accent info' />
            </div>
            <div className='blog-management-stat'>
              <div className='blog-management-stat-label'>
                {intl.formatMessage({id: 'DASHBOARD.TOTAL_BLOGS'})}
              </div>
              <div className='blog-management-stat-value'>{blogsLoading ? '--' : blogs.length}</div>
              <div className='blog-management-stat-accent success' />
            </div>
            <div className='blog-management-stat'>
              <div className='blog-management-stat-label'>
                {intl.formatMessage({id: 'DASHBOARD.ACTIVE_USERS'})}
              </div>
              <div className='blog-management-stat-value'>{isLoading ? '--' : activeUsers}</div>
              <div className='blog-management-stat-accent warning' />
            </div>
            <div className='blog-management-stat'>
              <div className='blog-management-stat-label'>
                {intl.formatMessage({id: 'DASHBOARD.ADMINS_MANAGERS'})}
              </div>
              <div className='blog-management-stat-value'>{isLoading ? '--' : adminUsers + managerUsers}</div>
              <div className='blog-management-stat-accent danger' />
            </div>
          </div>

          <div className='row g-5 g-xl-8'>
            <div className='col-xl-7'>
              <div className='card blog-management-card h-100'>
              <div className='card-header border-0 pt-6'>
                <div className='card-title blog-management-card-title'>
                  <h2 className='fw-bold'>{intl.formatMessage({id: 'DASHBOARD.RECENT_USERS'})}</h2>
                  <span>{intl.formatMessage({id: 'DASHBOARD.RECENT_USERS_HINT'})}</span>
                </div>
              </div>

              <div className='card-body pt-0'>
                {isLoading && (
                  <div className='py-10 text-center text-gray-600'>
                    {intl.formatMessage({id: 'DASHBOARD.LOADING_USERS'})}
                  </div>
                )}

                {error && (
                  <div className='alert alert-danger mb-0'>
                    {(error as Error)?.message || intl.formatMessage({id: 'DASHBOARD.LOAD_ERROR'})}
                  </div>
                )}

                {!isLoading && !error && recentUsers.length === 0 && (
                  <div className='py-10 text-center'>
                    <div className='fs-4 fw-semibold text-gray-800 mb-2'>
                      {intl.formatMessage({id: 'DASHBOARD.NO_USERS_TITLE'})}
                    </div>
                    <div className='text-gray-600 mb-5'>
                      {intl.formatMessage({id: 'DASHBOARD.NO_USERS_DESCRIPTION'})}
                    </div>
                    <Link to='/user-management' className='btn btn-light-primary'>
                      {intl.formatMessage({id: 'DASHBOARD.ADD_USERS'})}
                    </Link>
                  </div>
                )}

                {!isLoading && !error && recentUsers.length > 0 && (
                  <div className='table-responsive blog-management-table'>
                    <table className='table align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted bg-light'>
                          <th className='ps-4 min-w-250px rounded-start'>
                            {intl.formatMessage({id: 'DASHBOARD.TABLE_USER'})}
                          </th>
                          <th className='min-w-150px'>{intl.formatMessage({id: 'DASHBOARD.TABLE_ROLE'})}</th>
                          <th className='min-w-125px'>{intl.formatMessage({id: 'DASHBOARD.TABLE_STATUS'})}</th>
                          <th className='min-w-200px rounded-end'>
                            {intl.formatMessage({id: 'DASHBOARD.TABLE_EMAIL'})}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user) => (
                          <tr
                            key={user.id}
                            onClick={() => openDrawer(user)}
                            style={{cursor: 'pointer'}}
                            className={user.id === selectedDetailUser?.id ? 'table-active' : ''}
                          >
                            <td className='ps-4'>
                              <div className='d-flex align-items-center gap-3'>
                                <div className='symbol symbol-circle symbol-45px overflow-hidden'>
                                  {user.avatarUrl ? (
                                    <div className='symbol-label'>
                                      <img
                                        src={user.avatarUrl}
                                        alt={user.fullName}
                                        className='w-100'
                                      />
                                    </div>
                                  ) : (
                                    <div className='symbol-label fs-5 fw-bold bg-light-primary text-primary'>
                                      {getInitials(user.fullName)}
                                    </div>
                                  )}
                                </div>
                                <div className='d-flex flex-column'>
                                  <span className='text-gray-900 fw-bold fs-6'>{user.fullName}</span>
                                  <span className='text-muted fw-semibold fs-7'>{user.id}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className='badge badge-light-primary'>{user.role}</span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  user.status === 'Active' ? 'badge-light-success' : 'badge-light-secondary'
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className='text-gray-700 fw-semibold'>{user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

            <div className='col-xl-5'>
              <div className='card blog-management-card h-100'>
                <div className='card-header border-0 pt-6'>
                  <div className='card-title blog-management-card-title'>
                    <h2>{intl.formatMessage({id: 'DASHBOARD.LATEST_BLOG'})}</h2>
                    <span>{intl.formatMessage({id: 'DASHBOARD.LATEST_BLOG_HINT'})}</span>
                  </div>
                </div>
                <div className='card-body pt-0'>
                  {latestBlog ? (
                    <div className='dashboard-blog-preview'>
                      {latestBlog.featuredImageUrl && (
                        <img src={latestBlog.featuredImageUrl} alt={latestBlog.title} />
                      )}
                      <div className='d-flex align-items-center gap-2 mb-3'>
                        <span className='badge badge-light-primary'>{latestBlog.categoryName}</span>
                        <span className='badge badge-light-success'>
                          {publishedBlogs} {intl.formatMessage({id: 'DASHBOARD.PUBLISHED_BLOGS'})}
                        </span>
                      </div>
                      <h3>{latestBlog.title}</h3>
                      <p>{latestBlogPreview}</p>
                      <div className='dashboard-blog-preview-content'>
                        {getPlainTextPreview(latestBlog.content, intl.formatMessage({id: 'DASHBOARD.NO_BLOG_CONTENT'}))}
                      </div>
                      <button
                        type='button'
                        className='btn btn-light-primary'
                        onClick={() => setPreviewBlog(latestBlog)}
                      >
                        {intl.formatMessage({id: 'DASHBOARD.OPEN_LATEST_BLOG'})}
                      </button>
                    </div>
                  ) : (
                    <div className='py-10 text-center text-muted'>
                      {intl.formatMessage({id: 'DASHBOARD.NO_BLOGS'})}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='card blog-management-card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title blog-management-card-title'>
                <h2>{intl.formatMessage({id: 'PROFILE.OVERVIEW.TEAM_STATUS'})}</h2>
                <span>{intl.formatMessage({id: 'PROFILE.OVERVIEW.TEAM_STATUS_HINT'})}</span>
              </div>
            </div>
            <div className='card-body pt-0'>
              <div className='row g-6'>
                <div className='col-md-6'>
                  <div className='d-flex justify-content-between fw-semibold fs-6 mb-2'>
                    <span className='text-gray-700'>{intl.formatMessage({id: 'DASHBOARD.ACTIVE_USERS'})}</span>
                    <span className='text-gray-900'>{isLoading ? '--' : activeUsers}</span>
                  </div>
                  <div className='progress h-8px bg-light-success'>
                    <div
                      className='progress-bar bg-success'
                      role='progressbar'
                      style={{
                        width: users.length ? `${Math.round((activeUsers / users.length) * 100)}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='d-flex justify-content-between fw-semibold fs-6 mb-2'>
                    <span className='text-gray-700'>{intl.formatMessage({id: 'PROFILE.OVERVIEW.INACTIVE_USERS'})}</span>
                    <span className='text-gray-900'>{isLoading ? '--' : inactiveUsers}</span>
                  </div>
                  <div className='progress h-8px bg-light-warning'>
                    <div
                      className='progress-bar bg-warning'
                      role='progressbar'
                      style={{
                        width: users.length ? `${Math.round((inactiveUsers / users.length) * 100)}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='d-flex justify-content-between fw-semibold fs-6 mb-2'>
                    <span className='text-gray-700'>{intl.formatMessage({id: 'DASHBOARD.PUBLISHED_BLOG_STATUS'})}</span>
                    <span className='text-gray-900'>{blogsLoading ? '--' : publishedBlogs}</span>
                  </div>
                  <div className='progress h-8px bg-light-success'>
                    <div
                      className='progress-bar bg-success'
                      role='progressbar'
                      style={{
                        width: blogs.length ? `${Math.round((publishedBlogs / blogs.length) * 100)}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='d-flex justify-content-between fw-semibold fs-6 mb-2'>
                    <span className='text-gray-700'>{intl.formatMessage({id: 'DASHBOARD.DRAFT_BLOG_STATUS'})}</span>
                    <span className='text-gray-900'>{blogsLoading ? '--' : draftBlogs}</span>
                  </div>
                  <div className='progress h-8px bg-light-warning'>
                    <div
                      className='progress-bar bg-warning'
                      role='progressbar'
                      style={{
                        width: blogs.length ? `${Math.round((draftBlogs / blogs.length) * 100)}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='d-flex justify-content-between fw-semibold fs-6 mb-2'>
                    <span className='text-gray-700'>{intl.formatMessage({id: 'DASHBOARD.REVIEW_BLOG_STATUS'})}</span>
                    <span className='text-gray-900'>{blogsLoading ? '--' : reviewBlogs + scheduledBlogs}</span>
                  </div>
                  <div className='progress h-8px bg-light-info'>
                    <div
                      className='progress-bar bg-info'
                      role='progressbar'
                      style={{
                        width: blogs.length
                          ? `${Math.round(((reviewBlogs + scheduledBlogs) / blogs.length) * 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Content>

      <UserDetailDrawer user={selectedDetailUser} isOpen={isOpen} onClose={closeDrawer} />

      {previewBlog && (
        <>
          <div
            className='modal fade show d-block'
            tabIndex={-1}
            role='dialog'
            aria-modal='true'
            style={{zIndex: 1055}}
          >
            <div className='modal-dialog modal-dialog-centered modal-xl'>
              <div className='modal-content dashboard-blog-modal'>
                <div className='modal-header border-0 pb-0'>
                  <div>
                    <div className='d-flex flex-wrap gap-2 mb-3'>
                      <span className='badge badge-light-primary'>{previewBlog.categoryName}</span>
                      <span className='badge badge-light-success'>{previewBlog.status}</span>
                      {previewBlog.readingTime && (
                        <span className='badge badge-light-info'>
                          {previewBlog.readingTime} {intl.formatMessage({id: 'BLOG_MANAGEMENT.MIN_READING'})}
                        </span>
                      )}
                    </div>
                    <h2 className='fw-bolder text-gray-900 mb-1'>{previewBlog.title}</h2>
                    {previewBlog.excerpt && (
                      <p className='text-muted mb-0'>{previewBlog.excerpt}</p>
                    )}
                  </div>
                  <button
                    type='button'
                    className='btn btn-sm btn-icon btn-light'
                    onClick={() => setPreviewBlog(null)}
                    aria-label={intl.formatMessage({id: 'DASHBOARD.CLOSE_BLOG_PREVIEW'})}
                  >
                    <i className='ki-duotone ki-cross fs-2'>
                      <span className='path1' />
                      <span className='path2' />
                    </i>
                  </button>
                </div>
                <div className='modal-body pt-6'>
                  {previewBlog.featuredImageUrl && (
                    <img
                      src={previewBlog.featuredImageUrl}
                      alt={previewBlog.title}
                      className='dashboard-blog-modal-image'
                    />
                  )}
                  <div
                    className='dashboard-blog-modal-content'
                    dangerouslySetInnerHTML={{__html: sanitizePreviewHtml(previewBlog.content)}}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className='modal-backdrop fade show'
            style={{zIndex: 1054}}
            onClick={() => setPreviewBlog(null)}
          />
        </>
      )}
    </>
  )
}

const DashboardWrapper: FC = () => {
  const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.DASHBOARD'})}</PageTitle>
      <DashboardPage />
    </>
  )
}

export {DashboardWrapper}
