import {supabase} from '../../../../lib/supabaseClient'
import {Category} from '../model/Category'

type CategoryDbRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

function rowToCategory(row: CategoryDbRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const {data, error} = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', {ascending: true})

  if (error) throw new Error(error.message)
  return (data as CategoryDbRow[]).map(rowToCategory)
}

export async function createCategory(
  payload: Omit<Category, 'id' | 'createdAt'>
): Promise<Category> {
  const {data, error} = await supabase
    .from('categories')
    .insert({
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToCategory(data as CategoryDbRow)
}

export async function updateCategory(
  id: string,
  payload: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category> {
  const patch: Partial<CategoryDbRow> = {}
  if (payload.name !== undefined) patch.name = payload.name
  if (payload.slug !== undefined) patch.slug = payload.slug
  if (payload.description !== undefined) patch.description = payload.description ?? null
  if (payload.sortOrder !== undefined) patch.sort_order = payload.sortOrder
  if (payload.isActive !== undefined) patch.is_active = payload.isActive

  const {data, error} = await supabase
    .from('categories')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToCategory(data as CategoryDbRow)
}

export async function deleteCategory(id: string): Promise<void> {
  const {error} = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from('categories').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const {data, error} = await query
  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

export async function countByCategory(categoryId: string): Promise<number> {
  const {count, error} = await supabase
    .from('blogs')
    .select('id', {count: 'exact', head: true})
    .eq('category_id', categoryId)

  if (error) throw new Error(error.message)
  return count ?? 0
}
