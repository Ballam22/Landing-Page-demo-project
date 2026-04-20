import {FC} from 'react'
import clsx from 'clsx'
import {KTIcon} from '../../helpers'

type Props = {
  isDrawer?: boolean
}

const ChatInner: FC<Props> = ({isDrawer = false}) => {
  return (
    <div
      className='card-body'
      id={isDrawer ? 'kt_drawer_chat_messenger_body' : 'kt_chat_messenger_body'}
    >
      <div
        className={clsx('scroll-y me-n5 pe-5 d-flex align-items-center justify-content-center', {
          'h-300px h-lg-auto': !isDrawer,
          'min-h-300px': isDrawer,
        })}
        data-kt-element='messages'
        data-kt-scroll='true'
        data-kt-scroll-activate='{default: false, lg: true}'
        data-kt-scroll-max-height='auto'
        data-kt-scroll-dependencies={
          isDrawer
            ? '#kt_drawer_chat_messenger_header, #kt_drawer_chat_messenger_footer'
            : '#kt_header, #kt_app_header, #kt_app_toolbar, #kt_toolbar, #kt_footer, #kt_app_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer'
        }
        data-kt-scroll-wrappers={
          isDrawer
            ? '#kt_drawer_chat_messenger_body'
            : '#kt_content, #kt_app_content, #kt_chat_messenger_body'
        }
        data-kt-scroll-offset={isDrawer ? '0px' : '5px'}
      >
        <div className='text-center mw-350px py-10'>
          <div className='symbol symbol-65px mx-auto mb-5'>
            <span className='symbol-label bg-light-info text-info'>
              <KTIcon iconName='message-text-2' className='fs-1' />
            </span>
          </div>

          <div className='fw-bolder text-gray-900 fs-4 mb-2'>No messages yet</div>
          <div className='text-muted fs-6'>
            Demo conversations have been removed. Real messaging content can appear here once chat
            is connected to a backend service.
          </div>
        </div>
      </div>

      <div
        className='card-footer pt-4'
        id={isDrawer ? 'kt_drawer_chat_messenger_footer' : 'kt_chat_messenger_footer'}
      >
        <textarea
          className='form-control form-control-flush mb-3'
          rows={1}
          data-kt-element='input'
          placeholder='Messaging is not connected yet'
          disabled
        ></textarea>

        <div className='d-flex justify-content-end'>
          <button className='btn btn-primary' type='button' data-kt-element='send' disabled>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export {ChatInner}
