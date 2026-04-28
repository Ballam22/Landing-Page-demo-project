import {Link} from 'react-router-dom'
import {MutableRefObject} from 'react'

type PropsType = {
  sidebarRef: MutableRefObject<HTMLDivElement | null>
}

const SidebarLogo = (props: PropsType) => {
  void props

  return (
    <div className='app-sidebar-logo px-6' id='kt_app_sidebar_logo'>
      <Link to='/dashboard' className='orbit-cms-logo' aria-label='Orbit CMS dashboard'>
        <span className='orbit-cms-logo-default app-sidebar-logo-default'>
          <span className='orbit-cms-mark' aria-hidden='true'>
            <svg viewBox='0 0 40 40' role='img'>
              <circle className='orbit-cms-core' cx='20' cy='20' r='6' />
              <ellipse className='orbit-cms-ring orbit-cms-ring-main' cx='20' cy='20' rx='16' ry='7' />
              <ellipse
                className='orbit-cms-ring orbit-cms-ring-alt'
                cx='20'
                cy='20'
                rx='16'
                ry='7'
                transform='rotate(62 20 20)'
              />
              <circle className='orbit-cms-satellite' cx='33' cy='16' r='3' />
            </svg>
          </span>
          <span className='orbit-cms-wordmark'>Orbit CMS</span>
        </span>
      </Link>
    </div>
  )
}

export {SidebarLogo}
