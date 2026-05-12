import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'

export function LandingFooter() {
  const intl = useIntl()
  const year = new Date().getFullYear()
  return (
    <footer className='landing-footer'>
      <div className='container'>
        <div className='row gy-4 mb-5'>
          <div className='col-12 col-md-6'>
            <div className='fw-bold fs-5 text-white mb-2'>
              {intl.formatMessage({id: 'LANDING.PLATFORM_NAME'})}
            </div>
            <div className='fs-7'>{intl.formatMessage({id: 'LANDING.FOOTER_TAGLINE'})}</div>
          </div>
          <div className='col-12 col-md-6 d-flex gap-6 align-items-start justify-content-md-end flex-wrap'>
            <Link to='/'>{intl.formatMessage({id: 'LANDING.FOOTER_HOME'})}</Link>
            <Link to='/auth/login'>{intl.formatMessage({id: 'LANDING.FOOTER_SIGN_IN'})}</Link>
            <Link to='/auth/login'>Dashboard</Link>
          </div>
        </div>
        <div className='border-top border-secondary pt-4 text-center fs-8'>
          {intl.formatMessage({id: 'LANDING.FOOTER_COPYRIGHT'}, {year})}
        </div>
      </div>
    </footer>
  )
}
