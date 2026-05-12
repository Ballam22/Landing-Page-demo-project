import {Link} from 'react-router-dom'
import {MutableRefObject} from 'react'

type PropsType = {
  sidebarRef: MutableRefObject<HTMLDivElement | null>
}

const SidebarLogo = (props: PropsType) => {
  void props

  return (
    <div className='app-sidebar-logo px-6' id='kt_app_sidebar_logo'>
      <Link to='/dashboard' className='learnhub-logo' aria-label='LearnHub dashboard'>
        <span className='learnhub-logo-default app-sidebar-logo-default'>
          <span className='learnhub-mark' aria-hidden='true'>
            <svg viewBox='0 0 40 40' role='img'>
              <circle className='learnhub-core' cx='20' cy='20' r='6' />
              <ellipse className='learnhub-ring learnhub-ring-main' cx='20' cy='20' rx='16' ry='7' />
              <ellipse
                className='learnhub-ring learnhub-ring-alt'
                cx='20'
                cy='20'
                rx='16'
                ry='7'
                transform='rotate(62 20 20)'
              />
              <circle className='learnhub-satellite' cx='33' cy='16' r='3' />
            </svg>
          </span>
          <span className='learnhub-wordmark'>LearnHub</span>
        </span>
      </Link>
    </div>
  )
}

export {SidebarLogo}
