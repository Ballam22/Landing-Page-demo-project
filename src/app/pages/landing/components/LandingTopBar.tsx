import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'

export function LandingTopBar() {
  const intl = useIntl()
  return (
    <nav className='landing-topbar'>
      <div className='container d-flex align-items-center justify-content-between'>
        <Link to='/' className='text-decoration-none'>
          <span className='fw-bold fs-4 text-dark'>
            {intl.formatMessage({id: 'LANDING.PLATFORM_NAME'})}
          </span>
        </Link>
        <Link to='/auth/login' className='btn btn-sm btn-primary'>
          {intl.formatMessage({id: 'LANDING.SIGN_IN'})}
        </Link>
      </div>
    </nav>
  )
}
