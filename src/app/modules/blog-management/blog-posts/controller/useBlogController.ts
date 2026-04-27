import {useQuery, useMutation, useQueryClient} from 'react-query'
import {Blog} from '../model/Blog'
import {getAllBlogs, getBlogById} from '../repository/blogRepository'
import {createBlog, updateBlog, deleteBlog} from '../service/blogService'

export const BLOG_QUERY_KEY = ['blogs'] as const
export const BLOG_DETAIL_QUERY_KEY = (id: string) => ['blogs', id] as const

export type UseBlogControllerResult = {
  blogs: Blog[]
  isLoading: boolean
  error: Error | null
  addBlog: (payload: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>, imageFile?: File) => Promise<Blog>
  updateBlog: (id: string, payload: Partial<Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>>, imageFile?: File) => Promise<Blog>
  deleteBlog: (id: string) => Promise<void>
  getBlogById: (id: string) => Promise<Blog>
}

export function useBlogController(): UseBlogControllerResult {
  const queryClient = useQueryClient()

  const {data: blogs = [], isLoading, error} = useQuery(
    BLOG_QUERY_KEY,
    getAllBlogs,
    {staleTime: 0}
  )

  const addMutation = useMutation(
    ({payload, imageFile}: {payload: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>; imageFile?: File}) =>
      createBlog(payload, imageFile),
    {onSuccess: () => queryClient.invalidateQueries(BLOG_QUERY_KEY)}
  )

  const updateMutation = useMutation(
    ({id, payload, imageFile}: {id: string; payload: Partial<Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>>; imageFile?: File}) =>
      updateBlog(id, payload, imageFile),
    {onSuccess: () => queryClient.invalidateQueries(BLOG_QUERY_KEY)}
  )

  const deleteMutation = useMutation(
    (id: string) => deleteBlog(id),
    {onSuccess: () => queryClient.invalidateQueries(BLOG_QUERY_KEY)}
  )

  return {
    blogs,
    isLoading,
    error: (error as Error | null) ?? null,
    addBlog: (payload, imageFile) => addMutation.mutateAsync({payload, imageFile}),
    updateBlog: (id, payload, imageFile) => updateMutation.mutateAsync({id, payload, imageFile}),
    deleteBlog: (id) => deleteMutation.mutateAsync(id),
    getBlogById,
  }
}
