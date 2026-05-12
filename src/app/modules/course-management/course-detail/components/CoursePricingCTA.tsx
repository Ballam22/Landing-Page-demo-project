import {useIntl} from 'react-intl'

type CoursePricingCTAProps = {
  price: number
  isEnrolled: boolean
  onEnroll: () => Promise<void>
  enrolling: boolean
}

export function CoursePricingCTA({price, isEnrolled, onEnroll, enrolling}: CoursePricingCTAProps) {
  const intl = useIntl()

  if (isEnrolled) {
    return (
      <div className='d-flex align-items-center gap-2'>
        <i className='ki-duotone ki-check-circle fs-2 text-success'>
          <span className='path1' />
          <span className='path2' />
        </i>
        <span className='badge badge-light-success fs-6 px-4 py-3'>
          {intl.formatMessage({id: 'COURSE_DETAIL.CONTINUE_LEARNING'})}
        </span>
      </div>
    )
  }

  const priceLabel =
    price === 0
      ? intl.formatMessage({id: 'COURSE_DETAIL.FREE'})
      : intl.formatMessage({id: 'COURSE_DETAIL.PRICE_FORMAT'}, {price: price.toFixed(2)})

  return (
    <div className='d-flex flex-column gap-3'>
      <div className='fs-2 fw-bolder text-gray-900'>{priceLabel}</div>
      <button
        type='button'
        className='btn btn-primary w-100'
        onClick={onEnroll}
        disabled={enrolling}
      >
        {enrolling ? (
          <span className='spinner-border spinner-border-sm me-2' />
        ) : null}
        {intl.formatMessage({id: 'COURSE_DETAIL.ENROLL_NOW'})}
      </button>
    </div>
  )
}
