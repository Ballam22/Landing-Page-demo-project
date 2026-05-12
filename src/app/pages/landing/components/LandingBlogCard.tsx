import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'
import type {PublicBlogPost} from '../model'

type Props = {post: PublicBlogPost}

export function LandingBlogCard({post}: Props) {
  const intl = useIntl()
  return (
    <div className='card border-0 shadow-sm h-100'>
      {post.featuredImageUrl ? (
        <img src={post.featuredImageUrl} alt={post.title} className='landing-blog-thumb' />
      ) : (
        <div className='landing-blog-thumb-placeholder'>
          <i className='ki-duotone ki-document fs-2x text-muted'>
            <span className='path1' />
            <span className='path2' />
          </i>
        </div>
      )}
      <div className='card-body d-flex flex-column gap-2 p-4'>
        {post.categoryName && (
          <span className='badge badge-light-info fw-semibold fs-8'>{post.categoryName}</span>
        )}
        <div className='fw-bold fs-6 text-dark lh-sm'>{post.title}</div>
        {post.excerpt && (
          <p className='text-muted fs-7 mb-0' style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
            {post.excerpt}
          </p>
        )}
        <div className='mt-auto pt-2'>
          <Link to='/auth/login' className='btn btn-sm btn-light-primary'>
            {intl.formatMessage({id: 'LANDING.READ_MORE'})}
          </Link>
        </div>
      </div>
    </div>
  )
}
