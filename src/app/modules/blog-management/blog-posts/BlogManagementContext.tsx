import {createContext, FC} from 'react'
import {WithChildren} from '../../../../_metronic/helpers'
import {useBlogController} from './controller/useBlogController'
import {Blog} from './model/Blog'

type BlogManagementContextValue = {
  addBlog: (payload: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>, imageFile?: File) => Promise<Blog>
  updateBlog: (id: string, payload: Partial<Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>>, imageFile?: File) => Promise<Blog>
  deleteBlog: (id: string) => Promise<void>
}

const BlogManagementContext = createContext<BlogManagementContextValue | null>(null)

const BlogManagementProvider: FC<WithChildren> = ({children}) => {
  const {addBlog, updateBlog, deleteBlog} = useBlogController()

  return (
    <BlogManagementContext.Provider value={{addBlog, updateBlog, deleteBlog}}>
      {children}
    </BlogManagementContext.Provider>
  )
}

export {BlogManagementContext, BlogManagementProvider}
