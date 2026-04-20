import {KTIcon} from '../../../helpers'
import {useAuth} from '../../../../app/modules/auth'

const SidebarFooter = () => {
  const {logout} = useAuth()

  return (
    <div className='app-sidebar-footer flex-column-auto pt-2 pb-6 px-6' id='kt_app_sidebar_footer'>
      <button
        onClick={logout}
        className='btn btn-flex flex-center btn-custom btn-light-danger overflow-hidden text-nowrap px-0 h-40px w-100'
      >
        <span className='btn-label'>Sign Out</span>
        <KTIcon iconName='exit-right' className='btn-icon fs-2 m-0' />
      </button>
    </div>
  )
}

export {SidebarFooter}
