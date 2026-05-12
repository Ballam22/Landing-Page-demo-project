import {useQuery} from 'react-query'
import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'
import './LandingPage.css'
import {
  getPublicCourses,
  getPublicCategories,
  getLandingStats,
  getTopReviews,
  getLatestBlogPosts,
} from './landingRepository'
import {LandingTopBar} from './components/LandingTopBar'
import {LandingHero} from './components/LandingHero'
import {LandingFooter} from './components/LandingFooter'
import {LandingCourseCard} from './components/LandingCourseCard'
import {LandingCategoryCard} from './components/LandingCategoryCard'
import {LandingStatsBar} from './components/LandingStatsBar'
import {LandingBlogCard} from './components/LandingBlogCard'
import {LandingReviewCard} from './components/LandingReviewCard'

export function LandingPage() {
  const intl = useIntl()

  const {data: courses = []} = useQuery(['landing-courses'], getPublicCourses, {staleTime: 60_000})
  const {data: categories = []} = useQuery(['landing-categories'], getPublicCategories, {
    staleTime: 60_000,
  })
  const {data: stats} = useQuery(['landing-stats'], getLandingStats, {staleTime: 60_000})
  const {data: reviews = []} = useQuery(['landing-reviews'], getTopReviews, {staleTime: 60_000})
  const {data: blogs = []} = useQuery(['landing-blogs'], getLatestBlogPosts, {staleTime: 60_000})

  return (
    <div className='d-flex flex-column min-vh-100'>
      <LandingTopBar />

      <LandingHero />

      {/* Featured Courses */}
      <section id='courses' className='landing-section'>
        <div className='container'>
          <h2 className='fw-bold fs-2 mb-6 text-center'>
            {intl.formatMessage({id: 'LANDING.FEATURED_COURSES'})}
          </h2>
          {courses.length === 0 ? (
            <p className='text-center text-muted'>
              {intl.formatMessage({id: 'LANDING.NO_COURSES'})}
            </p>
          ) : (
            <div className='row g-4'>
              {courses.map((course) => (
                <div key={course.id} className='col-12 col-sm-6 col-lg-4'>
                  <LandingCourseCard course={course} />
                </div>
              ))}
            </div>
          )}
          <div className='text-center mt-6'>
            <Link to='/auth/login' className='btn btn-light-primary'>
              {intl.formatMessage({id: 'LANDING.VIEW_ALL_COURSES'})}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className='landing-section-alt'>
          <div className='container'>
            <h2 className='fw-bold fs-2 mb-6 text-center'>
              {intl.formatMessage({id: 'LANDING.CATEGORIES_TITLE'})}
            </h2>
            <div className='row g-3 justify-content-center'>
              {categories.map((cat) => (
                <div key={cat.id} className='col-6 col-sm-4 col-md-3 col-lg-2'>
                  <LandingCategoryCard category={cat} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      {stats && <LandingStatsBar stats={stats} />}

      {/* Latest Blogs */}
      <section className='landing-section'>
        <div className='container'>
          <h2 className='fw-bold fs-2 mb-6 text-center'>
            {intl.formatMessage({id: 'LANDING.LATEST_BLOGS'})}
          </h2>
          {blogs.length === 0 ? (
            <p className='text-center text-muted'>
              {intl.formatMessage({id: 'LANDING.NO_BLOGS'})}
            </p>
          ) : (
            <div className='row g-4'>
              {blogs.map((post) => (
                <div key={post.id} className='col-12 col-md-4'>
                  <LandingBlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials — hidden when no reviews */}
      {reviews.length > 0 && (
        <section className='landing-section-alt'>
          <div className='container'>
            <h2 className='fw-bold fs-2 mb-6 text-center'>
              {intl.formatMessage({id: 'LANDING.TESTIMONIALS_TITLE'})}
            </h2>
            <div className='row g-4'>
              {reviews.map((review) => (
                <div key={review.id} className='col-12 col-md-4'>
                  <LandingReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className='mt-auto'>
        <LandingFooter />
      </div>
    </div>
  )
}
