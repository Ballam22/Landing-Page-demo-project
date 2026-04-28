import {useMemo, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from 'react-query'
import {PageTitle} from '../../../_metronic/layout/core'
import {Blog, BlogStatus} from './blog-posts/model/Blog'
import {getAllBlogs, updateBlog} from './blog-posts/repository/blogRepository'

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const sanitizeBlogHtml = (value: string): string =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))

export default function BlogReviewPage() {
  const queryClient = useQueryClient()
  const {data: blogs = [], isLoading, error} = useQuery(['blogs'], getAllBlogs, {staleTime: 0})
  const [readingBlog, setReadingBlog] = useState<Blog | null>(null)
  const [updatingBlogId, setUpdatingBlogId] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const reviewMutation = useMutation(
    ({id, status}: {id: string; status: BlogStatus}) => updateBlog(id, {status}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blogs'])
        setReviewError(null)
      },
      onError: (mutationError: unknown) => {
        setReviewError(
          mutationError instanceof Error && mutationError.message
            ? mutationError.message
            : 'Could not update the review status.'
        )
      },
      onSettled: () => setUpdatingBlogId(null),
    }
  )

  const latestBlog = blogs[0] ?? null
  const reviewBlogs = useMemo(
    () => blogs.filter((blog) => blog.status === 'Review' || blog.status === 'Scheduled').slice(0, 4),
    [blogs]
  )
  const publishedBlogs = useMemo(
    () => blogs.filter((blog) => blog.status === 'Published').slice(0, 5),
    [blogs]
  )
  const publishedCount = blogs.filter((blog) => blog.status === 'Published').length
  const draftCount = blogs.filter((blog) => blog.status === 'Draft').length
  const reviewCount = blogs.filter((blog) => blog.status === 'Review').length
  const scheduledCount = blogs.filter((blog) => blog.status === 'Scheduled').length

  const handleReviewDecision = (blog: Blog, status: BlogStatus) => {
    setUpdatingBlogId(blog.id)
    reviewMutation.mutate({id: blog.id, status})
  }

  return (
    <>
      <PageTitle breadcrumbs={[]}>Blogs</PageTitle>

      <div className='blog-management-shell'>
        <div className='blog-management-header'>
          <div className='blog-management-header-content'>
            <div>
              <div className='blog-management-kicker'>Blog review</div>
              <h1 className='blog-management-title'>Blogs</h1>
              <p className='blog-management-subtitle'>
                Review the latest post, check publishing health, and jump into blog or category
                management from one place.
              </p>
            </div>
          </div>
        </div>

        <div className='blog-management-stats'>
          <div className='blog-management-stat'>
            <div className='blog-management-stat-label'>Total blogs</div>
            <div className='blog-management-stat-value'>{blogs.length}</div>
            <div className='blog-management-stat-accent info' />
          </div>
          <div className='blog-management-stat'>
            <div className='blog-management-stat-label'>Published</div>
            <div className='blog-management-stat-value'>{publishedCount}</div>
            <div className='blog-management-stat-accent success' />
          </div>
          <div className='blog-management-stat'>
            <div className='blog-management-stat-label'>Drafts</div>
            <div className='blog-management-stat-value'>{draftCount}</div>
            <div className='blog-management-stat-accent warning' />
          </div>
          <div className='blog-management-stat'>
            <div className='blog-management-stat-label'>Review or scheduled</div>
            <div className='blog-management-stat-value'>{reviewCount + scheduledCount}</div>
            <div className='blog-management-stat-accent danger' />
          </div>
        </div>

        {isLoading && (
          <div className='card blog-management-card p-8 text-center text-muted'>
            <span className='spinner-border spinner-border-sm me-2' />
            Loading blog review
          </div>
        )}

        {!!error && !isLoading && (
          <div className='alert alert-danger'>Could not load the blog review.</div>
        )}

        {reviewError && <div className='alert alert-danger'>{reviewError}</div>}

        {!isLoading && !error && (
          <div className='row g-6'>
            <div className='col-xl-7'>
              <div className='d-flex flex-column gap-6'>
                <div className='card blog-management-card'>
                  <div className='card-header'>
                    <div className='card-title blog-management-card-title'>
                      <h2>Latest blog</h2>
                      <span>A quick read on the newest post in the system.</span>
                    </div>
                  </div>
                  <div className='card-body'>
                    {latestBlog ? (
                      <div className='blog-review-latest'>
                        <div className='d-flex align-items-center gap-2 mb-4'>
                          <span className='badge badge-light-primary'>
                            {latestBlog.categoryName || 'Blog'}
                          </span>
                          <span className='badge badge-light-success'>{latestBlog.status}</span>
                        </div>
                        <h2 className='fw-bolder text-gray-900 mb-3'>{latestBlog.title}</h2>
                        <p className='text-muted fs-6 mb-5'>
                          {stripHtml(latestBlog.excerpt || latestBlog.content).slice(0, 260) ||
                            'No preview text available.'}
                        </p>
                        <div className='d-flex flex-wrap align-items-center gap-3'>
                          <span className='text-muted fs-7'>
                            Updated {formatDate(latestBlog.updatedAt || latestBlog.createdAt)}
                          </span>
                          <button
                            type='button'
                            className='btn btn-light-primary'
                            onClick={() => setReadingBlog(latestBlog)}
                          >
                            Read blog
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center text-muted py-10'>
                        No blogs have been created yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className='card blog-management-card'>
                  <div className='card-header'>
                    <div className='card-title blog-management-card-title'>
                      <h2>Published blogs &#127881;</h2>
                      <span>Posts that are live and ready for readers.</span>
                    </div>
                  </div>
                  <div className='card-body'>
                    {publishedBlogs.length ? (
                      <div className='blog-review-published-list'>
                        {publishedBlogs.map((blog) => (
                          <div className='blog-review-published-item' key={blog.id}>
                            <div className='min-w-0'>
                              <div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
                                <span className='badge badge-light-success'>Live</span>
                                <span className='text-muted fs-8'>
                                  {formatDate(blog.updatedAt || blog.createdAt)}
                                </span>
                              </div>
                              <div className='fw-bolder text-gray-900 text-truncate'>
                                {blog.title}
                              </div>
                              <div className='text-muted fs-7 text-truncate'>
                                {blog.categoryName || 'Blog'}
                              </div>
                            </div>
                            <button
                              type='button'
                              className='btn btn-sm btn-light-primary flex-shrink-0'
                              onClick={() => setReadingBlog(blog)}
                            >
                              Read
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='blog-review-published-empty'>
                        <div className='fs-1 mb-2'>&#127881;</div>
                        <div className='fw-bolder text-gray-900 mb-1'>No published blogs yet</div>
                        <div className='text-muted'>
                          Approved posts will show here once they go live.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='col-xl-5'>
              <div className='card blog-management-card h-100'>
                <div className='card-header'>
                  <div className='card-title blog-management-card-title'>
                    <h2>Needs attention</h2>
                    <span>Posts currently waiting for review or scheduling.</span>
                  </div>
                </div>
                <div className='card-body'>
                  {reviewBlogs.length ? (
                    <div className='d-flex flex-column gap-3'>
                      {reviewBlogs.map((blog) => {
                        const isUpdating = updatingBlogId === blog.id
                        return (
                          <div key={blog.id} className='blog-review-item'>
                            <span className='min-w-0'>
                              <span className='fw-bolder text-gray-900 d-block'>{blog.title}</span>
                              <span className='text-muted fs-7'>{blog.categoryName || 'Blog'}</span>
                            </span>
                            <div className='blog-review-actions'>
                              <button
                                type='button'
                                className='btn btn-sm btn-light-primary'
                                onClick={() => setReadingBlog(blog)}
                              >
                                Read
                              </button>
                              <button
                                type='button'
                                className='btn btn-sm btn-light-warning'
                                disabled={isUpdating}
                                onClick={() => handleReviewDecision(blog, 'Review')}
                              >
                                Pending
                              </button>
                              <button
                                type='button'
                                className='btn btn-sm btn-light-success'
                                disabled={isUpdating}
                                onClick={() => handleReviewDecision(blog, 'Published')}
                              >
                                Approved
                              </button>
                              <button
                                type='button'
                                className='btn btn-sm btn-light-danger'
                                disabled={isUpdating}
                                onClick={() => handleReviewDecision(blog, 'Archived')}
                              >
                                Denied
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className='text-center text-muted py-10'>
                      Nothing is waiting for review right now.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {readingBlog && (
        <div
          className='modal fade show d-block'
          style={{backgroundColor: 'rgba(15, 23, 42, 0.62)'}}
          onClick={() => setReadingBlog(null)}
        >
          <div
            className='modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='modal-content dashboard-blog-modal'>
              <div className='modal-header'>
                <div>
                  <div className='d-flex flex-wrap gap-2 mb-2'>
                    <span className='badge badge-light-primary'>
                      {readingBlog.categoryName || 'Blog'}
                    </span>
                    <span className='badge badge-light-success'>{readingBlog.status}</span>
                  </div>
                  <h2 className='modal-title fw-bolder text-gray-900'>{readingBlog.title}</h2>
                </div>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setReadingBlog(null)}
                />
              </div>
              <div className='modal-body'>
                {readingBlog.featuredImageUrl && (
                  <img
                    src={readingBlog.featuredImageUrl}
                    alt={readingBlog.title}
                    className='dashboard-blog-modal-image'
                  />
                )}
                {readingBlog.excerpt && (
                  <p className='text-muted fs-5 mb-6'>{readingBlog.excerpt}</p>
                )}
                <div
                  className='dashboard-blog-modal-content'
                  dangerouslySetInnerHTML={{__html: sanitizeBlogHtml(readingBlog.content)}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
