import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'

export function LandingHero() {
  const intl = useIntl()
  return (
    <section className='landing-hero'>
      <div className='container text-center'>
        <h1 className='display-4 fw-bold text-white mb-3'>
          {intl.formatMessage({id: 'LANDING.HERO_HEADLINE'})}
        </h1>
        <p className='fs-5 text-white opacity-75 mb-6 mx-auto' style={{maxWidth: 560}}>
          {intl.formatMessage({id: 'LANDING.HERO_SUBHEADLINE'})}
        </p>
        <div className='d-flex gap-3 justify-content-center flex-wrap'>
          <a href='#courses' className='btn btn-primary btn-lg px-7'>
            {intl.formatMessage({id: 'LANDING.BROWSE_COURSES'})}
          </a>
          <Link to='/auth/login' className='btn btn-outline-light btn-lg px-7'>
            {intl.formatMessage({id: 'LANDING.SIGN_IN'})}
          </Link>
        </div>
      </div>
    </section>
  )
}
