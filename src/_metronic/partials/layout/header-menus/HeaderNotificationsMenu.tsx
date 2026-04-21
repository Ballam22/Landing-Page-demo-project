import {FC} from 'react'
import {Link} from 'react-router-dom'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'

const HeaderNotificationsMenu: FC = () => (
  <div
    className='menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px'
    data-kt-menu='true'
  >
    <div
      className='d-flex flex-column bgi-no-repeat rounded-top'
      style={{backgroundImage: `url('${toAbsoluteUrl('media/misc/menu-header-bg.jpg')}')`}}
    >
      <h3 className='text-white fw-bold px-9 mt-10 mb-3'>Notifications</h3>
      <div className='text-white opacity-75 px-9 pb-8'>No live notifications are available yet.</div>
    </div>

    <div className='px-9 py-10 text-center'>
      <div className='symbol symbol-65px mx-auto mb-5'>
        <span className='symbol-label bg-light-primary text-primary'>
          <KTIcon iconName='notification-bing' className='fs-1' />
        </span>
      </div>

      <div className='fw-bolder text-gray-900 fs-4 mb-2'>No notifications yet</div>
      <div className='text-muted fs-6 mb-7'>
        Real notification activity will appear here once this feature is connected to backend events.
      </div>

      <Link to='/dashboard' className='btn btn-light-primary'>
        Back to dashboard
      </Link>
    </div>
  </div>
)

export {HeaderNotificationsMenu}
