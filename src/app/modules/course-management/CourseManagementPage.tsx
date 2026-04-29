import {NavLink, Route, Routes} from 'react-router-dom'
import {lazy, Suspense} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import {Content} from '../../../_metronic/layout/components/content'
import {ToolbarWrapper} from '../../../_metronic/layout/components/toolbar'
import './CourseManagement.css'

const CourseListPage = lazy(() => import('./course-list/CourseListPage'))
const CourseFormPage = lazy(() => import('./course-form/CourseFormPage'))
const EnrollmentPage = lazy(() => import('./enrollment/EnrollmentPage'))

const courseNavigation = [
  {to: '/course-management/courses', label: 'Courses', icon: 'book'},
  {to: '/course-management/enrollments', label: 'Enrollments', icon: 'people'},
]

export default function CourseManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolbarWrapper showActions={false} />
      <Content>
        <div className='course-module-layout'>
          <aside className='course-module-sidebar'>
            <div className='course-module-sidebar-title'>Courses</div>
            <nav className='course-module-nav'>
              {courseNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({isActive}) => `course-module-nav-link${isActive ? ' active' : ''}`}
                >
                  <KTIcon iconName={item.icon} className='fs-3' />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className='course-module-content'>
            <Routes>
              <Route index element={<CourseListPage />} />
              <Route path='courses' element={<CourseListPage />} />
              <Route path='add' element={<CourseFormPage />} />
              <Route path='edit/:id' element={<CourseFormPage />} />
              <Route path='enrollments' element={<EnrollmentPage />} />
            </Routes>
          </main>
        </div>
      </Content>
    </Suspense>
  )
}
