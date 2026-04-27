import {Blog} from '../model/Blog'
import {
  createBlog as repoCreate,
  updateBlog as repoUpdate,
  deleteBlog as repoDelete,
  getBlogById,
  isSlugTaken,
  uploadImage,
  deleteImage,
  getBlogImagePath,
} from '../repository/blogRepository'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

function validateImage(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) throw new Error('IMAGE_TYPE_INVALID')
  if (file.size > MAX_FILE_SIZE) throw new Error('IMAGE_SIZE_EXCEEDED')
}

export async function createBlog(
  payload: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>,
  imageFile?: File
): Promise<Blog> {
  const taken = await isSlugTaken(payload.slug)
  if (taken) throw new Error('SLUG_TAKEN')

  const id = crypto.randomUUID()
  let featuredImageUrl = payload.featuredImageUrl

  if (imageFile) {
    validateImage(imageFile)
    featuredImageUrl = await uploadImage(id, imageFile)
  }

  try {
    return await repoCreate({...payload, id, featuredImageUrl})
  } catch (error) {
    const imagePath = getBlogImagePath(featuredImageUrl)
    if (imageFile && imagePath) {
      await deleteImage(imagePath).catch(() => undefined)
    }
    throw error
  }
}

export async function updateBlog(
  id: string,
  payload: Partial<Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>>,
  imageFile?: File
): Promise<Blog> {
  if (payload.slug) {
    const taken = await isSlugTaken(payload.slug, id)
    if (taken) throw new Error('SLUG_TAKEN')
  }

  const previousImageUrl = payload.featuredImageUrl
  let featuredImageUrl = previousImageUrl

  if (imageFile) {
    validateImage(imageFile)
    featuredImageUrl = await uploadImage(id, imageFile)
  }

  try {
    const blog = await repoUpdate(id, {...payload, featuredImageUrl})
    const oldPath = getBlogImagePath(previousImageUrl)
    const newPath = getBlogImagePath(featuredImageUrl)
    if (imageFile && oldPath && oldPath !== newPath) {
      await deleteImage(oldPath).catch(() => undefined)
    }
    return blog
  } catch (error) {
    const newPath = getBlogImagePath(featuredImageUrl)
    if (imageFile && newPath) {
      await deleteImage(newPath).catch(() => undefined)
    }
    throw error
  }
}

export async function deleteBlog(id: string): Promise<void> {
  const blog = await getBlogById(id)
  await repoDelete(id)

  const imagePath = getBlogImagePath(blog.featuredImageUrl)
  if (imagePath) {
    await deleteImage(imagePath).catch(() => undefined)
  }
}
