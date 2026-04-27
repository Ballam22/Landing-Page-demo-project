import {createContext, FC} from 'react'
import {WithChildren} from '../../../../_metronic/helpers'
import {useCategoryController} from './controller/useCategoryController'
import {Category} from './model/Category'

type CategoryManagementContextValue = {
  addCategory: (payload: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>
  updateCategory: (id: string, payload: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
}

const CategoryManagementContext = createContext<CategoryManagementContextValue | null>(null)

const CategoryManagementProvider: FC<WithChildren> = ({children}) => {
  const {addCategory, updateCategory, deleteCategory} = useCategoryController()

  return (
    <CategoryManagementContext.Provider value={{addCategory, updateCategory, deleteCategory}}>
      {children}
    </CategoryManagementContext.Provider>
  )
}

export {CategoryManagementContext, CategoryManagementProvider}
