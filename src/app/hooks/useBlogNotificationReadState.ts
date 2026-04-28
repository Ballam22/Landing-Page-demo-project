import {useCallback, useEffect, useState} from 'react'
import {Blog} from '../modules/blog-management/blog-posts/model/Blog'

const STORAGE_KEY = 'orbit-cms-blog-notifications-viewed-at'
const STORAGE_EVENT = 'orbit-cms-blog-notifications-viewed'

function readViewedAt(): number {
  const value = window.localStorage.getItem(STORAGE_KEY)
  const timestamp = value ? Number(value) : 0
  return Number.isFinite(timestamp) ? timestamp : 0
}

function getBlogNotificationTime(blog: Blog): number {
  return Date.parse(blog.updatedAt || blog.createdAt) || 0
}

export function useBlogNotificationReadState() {
  const [viewedAt, setViewedAt] = useState(() => readViewedAt())

  useEffect(() => {
    const syncViewedAt = () => setViewedAt(readViewedAt())

    window.addEventListener('storage', syncViewedAt)
    window.addEventListener(STORAGE_EVENT, syncViewedAt)

    return () => {
      window.removeEventListener('storage', syncViewedAt)
      window.removeEventListener(STORAGE_EVENT, syncViewedAt)
    }
  }, [])

  const markViewed = useCallback((blogs: Blog[]) => {
    const latestPublishedAt = blogs
      .filter((blog) => blog.status === 'Published')
      .reduce((latest, blog) => Math.max(latest, getBlogNotificationTime(blog)), Date.now())

    window.localStorage.setItem(STORAGE_KEY, String(latestPublishedAt))
    window.dispatchEvent(new Event(STORAGE_EVENT))
  }, [])

  return {
    viewedAt,
    markViewed,
    isUnread: (blog: Blog) => blog.status === 'Published' && getBlogNotificationTime(blog) > viewedAt,
  }
}
