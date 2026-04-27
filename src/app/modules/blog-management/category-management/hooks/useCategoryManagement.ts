import {useContext} from 'react'
import {CategoryManagementContext} from '../CategoryManagementContext'

export function useCategoryManagement() {
  const ctx = useContext(CategoryManagementContext)
  if (!ctx) throw new Error('useCategoryManagement must be used inside CategoryManagementProvider')
  return ctx
}
