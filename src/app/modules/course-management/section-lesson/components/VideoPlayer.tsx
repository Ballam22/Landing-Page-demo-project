import {useEffect, useState} from 'react'
import {fetchSignedVideoUrl} from '../../service/lessonService'

type Props = {
  videoPath: string
}

export function VideoPlayer({videoPath}: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr(null)
    fetchSignedVideoUrl(videoPath)
      .then((url) => {
        if (!cancelled) {
          setSignedUrl(url)
          setLoading(false)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setErr(e.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [videoPath])

  if (loading) {
    return (
      <div className='d-flex align-items-center gap-2 py-2'>
        <span className='spinner-border spinner-border-sm text-primary' />
        <span className='text-muted fs-7'>Loading video…</span>
      </div>
    )
  }

  if (err || !signedUrl) {
    return <div className='text-danger fs-7'>Could not load video: {err}</div>
  }

  return (
    <video
      src={signedUrl}
      controls
      controlsList='nodownload'
      disablePictureInPicture
      style={{width: '100%', maxHeight: '360px', borderRadius: '6px'}}
    />
  )
}
