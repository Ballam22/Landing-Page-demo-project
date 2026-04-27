import {useContext} from 'react'
import {BlogManagementContext} from '../BlogManagementContext'

export function useBlogManagement() {
  const ctx = useContext(BlogManagementContext)
  if (!ctx) throw new Error('useBlogManagement must be used inside BlogManagementProvider')
  return ctx
}
