import {Category} from '../model/Category'
import {
  createCategory as repoCreate,
  updateCategory as repoUpdate,
  deleteCategory as repoDelete,
  isSlugTaken,
  countByCategory,
} from '../repository/categoryRepository'
import {toSlug} from '../../utils/slugUtils'

export {toSlug}

export async function createCategory(
  payload: Omit<Category, 'id' | 'createdAt'>
): Promise<Category> {
  const taken = await isSlugTaken(payload.slug)
  if (taken) throw new Error('SLUG_TAKEN')
  return repoCreate(payload)
}

export async function updateCategory(
  id: string,
  payload: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category> {
  if (payload.slug) {
    const taken = await isSlugTaken(payload.slug, id)
    if (taken) throw new Error('SLUG_TAKEN')
  }
  return repoUpdate(id, payload)
}

export async function deleteCategory(id: string): Promise<void> {
  const count = await countByCategory(id)
  if (count > 0) throw new Error('HAS_BLOGS')
  return repoDelete(id)
}
