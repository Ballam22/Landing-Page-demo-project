import {FC} from 'react'
import {Link} from 'react-router-dom'
import {KTIcon} from '../../../helpers'

const ActivityDrawer: FC = () => (
  <div
    id='kt_activities'
    className='bg-body'
    data-kt-drawer='true'
    data-kt-drawer-name='activities'
    data-kt-drawer-activate='true'
    data-kt-drawer-overlay='true'
    data-kt-drawer-width="{default:'300px', 'lg': '900px'}"
    data-kt-drawer-direction='end'
    data-kt-drawer-toggle='#kt_activities_toggle'
    data-kt-drawer-close='#kt_activities_close'
  >
    <div className='card shadow-none rounded-0'>
      <div className='card-header' id='kt_activities_header'>
        <h3 className='card-title fw-bolder text-gray-900'>Activity Log</h3>

        <div className='card-toolbar'>
          <button
            type='button'
            className='btn btn-sm btn-icon btn-active-light-primary me-n5'
            id='kt_activities_close'
          >
            <KTIcon iconName='cross' className='fs-1' />
          </button>
        </div>
      </div>

      <div className='card-body d-flex align-items-center justify-content-center min-h-400px'>
        <div className='text-center mw-400px'>
          <div className='symbol symbol-75px mx-auto mb-6'>
            <span className='symbol-label bg-light-warning text-warning'>
              <KTIcon iconName='time' className='fs-1' />
            </span>
          </div>

          <div className='fw-bolder text-gray-900 fs-3 mb-3'>No activity recorded</div>
          <div className='text-muted fs-6 mb-7'>
            This activity log has been cleared of demo entries. Real account and app events can be
            added here once an audit trail is wired in.
          </div>

          <Link to='/dashboard' className='btn btn-light-primary'>
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  </div>
)

export {ActivityDrawer}
