import {useIntl} from 'react-intl'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

const SidebarMenuMain = () => {
  const intl = useIntl()

  return (
    <>
      <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
        fontIcon='bi-app-indicator'
      />
      <SidebarMenuItem
        to='/user-management'
        icon='profile-user'
        title={intl.formatMessage({id: 'USER_MANAGEMENT.TITLE'})}
        fontIcon='bi-people'
      />
      <SidebarMenuItem
        to='/profile/overview'
        icon='profile-circle'
        title='Profile'
        fontIcon='bi-person'
      />
    </>
  )
}

export {SidebarMenuMain}
