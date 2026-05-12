import {useIntl} from 'react-intl'
import type {LandingStats} from '../model'

type Props = {stats: LandingStats}

export function LandingStatsBar({stats}: Props) {
  const intl = useIntl()
  const items = [
    {value: stats.totalCourses, labelId: 'LANDING.STATS_TOTAL_COURSES'},
    {value: stats.totalStudents, labelId: 'LANDING.STATS_STUDENTS'},
    {value: stats.totalReviews, labelId: 'LANDING.STATS_REVIEWS'},
    {value: stats.publishedBlogs, labelId: 'LANDING.STATS_BLOGS'},
  ]
  return (
    <section className='landing-stats-bar'>
      <div className='container'>
        <div className='row g-4 text-center'>
          {items.map((item) => (
            <div key={item.labelId} className='col-6 col-md-3'>
              <div className='landing-stat-value text-white mb-1'>{item.value}</div>
              <div className='text-white opacity-75 fs-7'>
                {intl.formatMessage({id: item.labelId})}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
