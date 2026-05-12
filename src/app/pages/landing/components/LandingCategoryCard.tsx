import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'
import type {PublicCategory} from '../model'

type Props = {category: PublicCategory}

export function LandingCategoryCard({category}: Props) {
  const intl = useIntl()
  return (
    <Link to='/auth/login' className='text-decoration-none'>
      <div className='card landing-category-card border-0 shadow-sm p-4 text-center'>
        <div className='fw-bold fs-6 text-dark mb-1'>{category.name}</div>
        <div className='text-muted fs-8'>
          {intl.formatMessage({id: 'LANDING.COURSES_COUNT'}, {count: category.courseCount})}
        </div>
      </div>
    </Link>
  )
}
