type StarRatingProps = {
  value: number
  max?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({value, max = 5, interactive = false, onChange}: StarRatingProps) {
  return (
    <span className='d-inline-flex align-items-center gap-1'>
      {Array.from({length: max}, (_, i) => i + 1).map((star) => {
        const filled = star <= value
        if (interactive) {
          return (
            <button
              key={star}
              type='button'
              className='btn btn-icon btn-sm p-0'
              style={{lineHeight: 1}}
              onClick={() => onChange?.(star)}
            >
              <i
                className={`ki-duotone ki-star fs-4 ${filled ? 'text-warning' : 'text-muted'}`}
              >
                <span className='path1' />
                <span className='path2' />
              </i>
            </button>
          )
        }
        return (
          <span key={star} style={{lineHeight: 1}}>
            <i
              className={`ki-duotone ki-star fs-4 ${filled ? 'text-warning' : 'text-muted'}`}
            >
              <span className='path1' />
              <span className='path2' />
            </i>
          </span>
        )
      })}
    </span>
  )
}
