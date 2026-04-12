import { useEffect, useRef } from 'react'

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

type UseSessionTimeoutOptions = {
  timeoutMs: number
  onTimeout: () => void
}

export default function useSessionTimeout({ timeoutMs, onTimeout }: UseSessionTimeoutOptions): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        onTimeoutRef.current()
      }, timeoutMs)
    }

    resetTimer()

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [timeoutMs])
}
