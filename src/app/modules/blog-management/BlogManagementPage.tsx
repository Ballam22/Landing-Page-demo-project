import {Navigate, Route, Routes} from 'react-router-dom'
import {lazy, Suspense} from 'react'
import './BlogManagement.css'

const CategoryManagementPage = lazy(
  () => import('./category-management/CategoryManagementPage')
)
const BlogListPage = lazy(() => import('./blog-posts/BlogListPage'))
const BlogFormPage = lazy(() => import('./blog-posts/BlogFormPage'))

export default function BlogManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<Navigate to='categories' replace />} />
        <Route path='categories' element={<CategoryManagementPage />} />
        <Route path='blogs' element={<BlogListPage />} />
        <Route path='blogs/new' element={<BlogFormPage />} />
        <Route path='blogs/:id/edit' element={<BlogFormPage />} />
      </Routes>
    </Suspense>
  )
}
