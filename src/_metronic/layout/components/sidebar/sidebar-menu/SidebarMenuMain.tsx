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
      <SidebarMenuItemWithSub to='/profile' title='Profile' fontIcon='bi-person' icon='profile-circle'>
        <SidebarMenuItem to='/profile/overview' title='Overview' hasBullet={true} />
        <SidebarMenuItem to='/profile/projects' title='Projects' hasBullet={true} />
        <SidebarMenuItem to='/profile/campaigns' title='Campaigns' hasBullet={true} />
        <SidebarMenuItem to='/profile/documents' title='Documents' hasBullet={true} />
        <SidebarMenuItem to='/profile/connections' title='Connections' hasBullet={true} />
      </SidebarMenuItemWithSub>
    </>
  )
}

export {SidebarMenuMain}
