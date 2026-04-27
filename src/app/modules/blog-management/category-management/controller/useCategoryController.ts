import {useQuery, useMutation, useQueryClient} from 'react-query'
import {Category} from '../model/Category'
import {getAllCategories} from '../repository/categoryRepository'
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../service/categoryService'

export const CATEGORY_QUERY_KEY = ['categories'] as const

export type UseCategoryControllerResult = {
  categories: Category[]
  isLoading: boolean
  error: Error | null
  addCategory: (payload: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>
  updateCategory: (id: string, payload: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
}

export function useCategoryController(): UseCategoryControllerResult {
  const queryClient = useQueryClient()

  const {data: categories = [], isLoading, error} = useQuery(
    CATEGORY_QUERY_KEY,
    getAllCategories,
    {staleTime: 0}
  )

  const addMutation = useMutation(
    (payload: Omit<Category, 'id' | 'createdAt'>) => createCategory(payload),
    {onSuccess: () => queryClient.invalidateQueries(CATEGORY_QUERY_KEY)}
  )

  const updateMutation = useMutation(
    ({id, payload}: {id: string; payload: Partial<Omit<Category, 'id' | 'createdAt'>>}) =>
      updateCategory(id, payload),
    {onSuccess: () => queryClient.invalidateQueries(CATEGORY_QUERY_KEY)}
  )

  const deleteMutation = useMutation(
    (id: string) => deleteCategory(id),
    {onSuccess: () => queryClient.invalidateQueries(CATEGORY_QUERY_KEY)}
  )

  return {
    categories,
    isLoading,
    error: (error as Error | null) ?? null,
    addCategory: (payload) => addMutation.mutateAsync(payload),
    updateCategory: (id, payload) => updateMutation.mutateAsync({id, payload}),
    deleteCategory: (id) => deleteMutation.mutateAsync(id),
  }
}
