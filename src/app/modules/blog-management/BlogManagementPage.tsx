import {NavLink, Route, Routes} from 'react-router-dom'
import {lazy, Suspense} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import {Content} from '../../../_metronic/layout/components/content'
import {ToolbarWrapper} from '../../../_metronic/layout/components/toolbar'
import './BlogManagement.css'

const CategoryManagementPage = lazy(
  () => import('./category-management/CategoryManagementPage')
)
const BlogListPage = lazy(() => import('./blog-posts/BlogListPage'))
const BlogFormPage = lazy(() => import('./blog-posts/BlogFormPage'))
const BlogReviewPage = lazy(() => import('./BlogReviewPage'))

const blogNavigation = [
  {to: '/blog-management', label: 'Blog Review', icon: 'chart-simple', end: true},
  {to: '/blog-management/blogs', label: 'Blog Management', icon: 'notepad'},
  {to: '/blog-management/categories', label: 'Blog Category Management', icon: 'category'},
]

export default function BlogManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolbarWrapper showActions={false} />
      <Content>
        <div className='blog-module-layout'>
          <aside className='blog-module-sidebar'>
            <div className='blog-module-sidebar-title'>Blogs</div>
            <nav className='blog-module-nav'>
              {blogNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({isActive}) => `blog-module-nav-link${isActive ? ' active' : ''}`}
                >
                  <KTIcon iconName={item.icon} className='fs-3' />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className='blog-module-content'>
            <Routes>
              <Route index element={<BlogReviewPage />} />
              <Route path='categories' element={<CategoryManagementPage />} />
              <Route path='blogs' element={<BlogListPage />} />
              <Route path='blogs/new' element={<BlogFormPage />} />
              <Route path='blogs/:id/edit' element={<BlogFormPage />} />
            </Routes>
          </main>
        </div>
      </Content>
    </Suspense>
  )
}
