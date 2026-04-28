import clsx from 'clsx'
import {KeyboardEvent} from 'react'
import {useQuery} from 'react-query'
import {KTIcon} from '../../../helpers'
import {HeaderNotificationsMenu, HeaderUserMenu, Search, ThemeModeSwitcher} from '../../../partials'
import {useLayout} from '../../core'
import {UserAvatarButton} from '../../../../app/components/UserAvatarButton'
import {useAuth} from '../../../../app/modules/auth'
import {useCurrentProfile} from '../../../../app/hooks/useCurrentProfile'
import {useUnreadCount} from '../../../../app/modules/messages/controller/useMessageController'
import {getAllBlogs} from '../../../../app/modules/blog-management/blog-posts/repository/blogRepository'
import {useBlogNotificationReadState} from '../../../../app/hooks/useBlogNotificationReadState'

const itemClass = 'ms-1 ms-md-4'
const btnClass =
  'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px'
const btnIconClass = 'fs-2'

const Navbar = () => {
  const {config} = useLayout()
  const {currentUser} = useAuth()
  const {data: profile} = useCurrentProfile(currentUser?.email)
  const {data: unreadCount = 0} = useUnreadCount(profile?.id)
  const {isUnread, markViewed} = useBlogNotificationReadState()
  const {data: blogs = []} = useQuery(['blogs'], getAllBlogs, {
    staleTime: 0,
    refetchInterval: 15_000,
  })
  const unreadPublishedBlogCount = blogs.filter(isUnread).length

  const handleViewNotifications = () => {
    markViewed(blogs)
  }

  const handleNotificationKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      markViewed(blogs)
    }
  }

  return (
    <div className='app-navbar flex-shrink-0'>
      <div className={clsx('app-navbar-item align-items-stretch', itemClass)}>
        <Search />
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          id='kt_activities_toggle'
          className={btnClass}
          title='Activity log'
          aria-label='Open activity log'
          role='button'
          tabIndex={0}
        >
          <KTIcon iconName='chart-simple' className={btnIconClass} />
        </div>
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          className={clsx('position-relative', btnClass)}
          title='Notifications'
          aria-label={
            unreadPublishedBlogCount > 0
              ? `Open notifications, ${unreadPublishedBlogCount} unread blog notifications`
              : 'Open notifications'
          }
          role='button'
          tabIndex={0}
          onClick={handleViewNotifications}
          onKeyDown={handleNotificationKeyDown}
        >
          <KTIcon iconName='notification-bing' className={btnIconClass} />
          {unreadPublishedBlogCount > 0 && (
            <span className='badge badge-circle badge-success position-absolute top-0 start-100 translate-middle fs-8'>
              {unreadPublishedBlogCount > 99 ? '99+' : unreadPublishedBlogCount}
            </span>
          )}
        </div>
        <HeaderNotificationsMenu />
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          className={clsx('position-relative', btnClass)}
          id='kt_drawer_chat_toggle'
          title='Messages'
          aria-label={
            unreadCount > 0 ? `Open messages, ${unreadCount} unread messages` : 'Open messages'
          }
          role='button'
          tabIndex={0}
        >
          <KTIcon iconName='message-text-2' className={btnIconClass} />
          {unreadCount > 0 && (
            <span className='badge badge-circle badge-danger position-absolute top-0 start-100 translate-middle fs-8'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <ThemeModeSwitcher toggleBtnClass={clsx('btn-active-light-primary btn-custom')} />
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          className='cursor-pointer'
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
        >
          <UserAvatarButton />
        </div>
        <HeaderUserMenu />
      </div>

      {config.app?.header?.default?.menu?.display && (
        <div className='app-navbar-item d-lg-none ms-2 me-n3' title='Show header menu'>
          <div
            className='btn btn-icon btn-active-color-primary w-35px h-35px'
            id='kt_app_header_menu_toggle'
          >
            <KTIcon iconName='text-align-left' className={btnIconClass} />
          </div>
        </div>
      )}
    </div>
  )
}

export {Navbar}
