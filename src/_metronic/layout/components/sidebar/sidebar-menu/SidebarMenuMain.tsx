import {useIntl} from 'react-intl'
import {SidebarMenuItem} from './SidebarMenuItem'
import './SidebarMenu.css'

const SidebarMenuMain = () => {
  const intl = useIntl()

  return (
    <>
      <SidebarMenuItem
        to='/blog-management'
        icon='book-open'
        title='Blogs'
      />
      <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
      />
      <SidebarMenuItem
        to='/messages'
        icon='message-text-2'
        title={intl.formatMessage({id: 'MESSAGES.PAGE_TITLE'})}
      />
      <SidebarMenuItem
        to='/profile/overview'
        icon='profile-circle'
        title={intl.formatMessage({id: 'MENU.PROFILE'})}
      />
      <SidebarMenuItem
        to='/user-management'
        icon='profile-user'
        title={intl.formatMessage({id: 'USER_MANAGEMENT.TITLE'})}
      />
    </>
  )
}

export {SidebarMenuMain}
