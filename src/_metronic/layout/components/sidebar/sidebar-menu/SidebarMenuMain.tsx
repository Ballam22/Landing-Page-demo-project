import {useIntl} from 'react-intl'
import {SidebarMenuItem} from './SidebarMenuItem'
import './SidebarMenu.css'

const SidebarMenuMain = () => {
  const intl = useIntl()

  return (
    <>
      <SidebarMenuItem
        to='/blog-management/blogs'
        icon='notepad'
        title={intl.formatMessage({id: 'BLOG_MANAGEMENT.PAGE_TITLE'})}
        fontIcon='bi-journal-text'
      />
      <SidebarMenuItem
        to='/blog-management/categories'
        icon='category'
        title={intl.formatMessage({id: 'CATEGORY_MANAGEMENT.PAGE_TITLE'})}
        fontIcon='bi-bookmark'
      />
      <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
        fontIcon='bi-app-indicator'
      />
      <SidebarMenuItem
        to='/messages'
        icon='message-text-2'
        title={intl.formatMessage({id: 'MESSAGES.PAGE_TITLE'})}
        fontIcon='bi-chat'
      />
      <SidebarMenuItem
        to='/profile/overview'
        icon='profile-circle'
        title={intl.formatMessage({id: 'MENU.PROFILE'})}
        fontIcon='bi-person'
      />
      <SidebarMenuItem
        to='/user-management'
        icon='profile-user'
        title={intl.formatMessage({id: 'USER_MANAGEMENT.TITLE'})}
        fontIcon='bi-people'
      />
    </>
  )
}

export {SidebarMenuMain}
