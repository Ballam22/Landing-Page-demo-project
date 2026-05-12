import {useEffect} from 'react'
import {Outlet, Link} from 'react-router-dom'

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1'>
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          <div className='w-lg-500px p-10'>
            <Outlet />
          </div>
        </div>
      </div>

      <div
        className='d-flex flex-lg-row-fluid w-lg-50 order-1 order-lg-2'
        style={{background: 'linear-gradient(135deg, #1b1b29 0%, #2b2b40 50%, #1e4a7a 100%)'}}
      >
        <div className='d-flex flex-column flex-center py-15 px-5 px-md-15 w-100'>
          <Link to='/' className='mb-10 text-decoration-none'>
            <span className='text-white fw-bold fs-2qx'>LearnHub</span>
          </Link>
          <h2 className='text-white fs-2x fw-bold text-center mb-5'>Learn Without Limits</h2>
          <div className='text-white opacity-75 fs-5 text-center mb-10' style={{maxWidth: 400}}>
            Explore hundreds of courses taught by industry experts. Advance your career at your own
            pace.
          </div>
          <div className='d-flex flex-column gap-4 w-100' style={{maxWidth: 360}}>
            {[
              {icon: 'ki-duotone ki-book', text: 'Hundreds of expert-led courses'},
              {icon: 'ki-duotone ki-award', text: 'Earn certificates on completion'},
              {icon: 'ki-duotone ki-people', text: 'Join thousands of learners'},
            ].map(({icon, text}) => (
              <div key={text} className='d-flex align-items-center gap-3'>
                <div
                  className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                  style={{width: 40, height: 40, background: 'rgba(255,255,255,0.12)'}}
                >
                  <i className={`${icon} fs-4 text-white`}>
                    <span className='path1' />
                    <span className='path2' />
                  </i>
                </div>
                <span className='text-white opacity-75 fs-6'>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export {AuthLayout}
