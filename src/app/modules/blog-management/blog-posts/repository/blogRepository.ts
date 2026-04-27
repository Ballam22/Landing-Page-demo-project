import {supabase} from '../../../../lib/supabaseClient'
import {Blog, BlogStatus} from '../model/Blog'

type BlogDbRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category_id: string
  categories: {name: string} | null
  featured_image_url: string | null
  content: string
  reading_time: number | null
  status: string
  created_at: string
  updated_at: string
}

function rowToBlog(row: BlogDbRow): Blog {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? undefined,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? '',
    featuredImageUrl: row.featured_image_url ?? undefined,
    content: row.content,
    readingTime: row.reading_time ?? undefined,
    status: row.status as BlogStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAllBlogs(): Promise<Blog[]> {
  const {data, error} = await supabase
    .from('blogs')
    .select('*, categories(name)')
    .order('created_at', {ascending: false})

  if (error) throw new Error(error.message)
  return (data as BlogDbRow[]).map(rowToBlog)
}

export async function getBlogById(id: string): Promise<Blog> {
  const {data, error} = await supabase
    .from('blogs')
    .select('*, categories(name)')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return rowToBlog(data as BlogDbRow)
}

export async function createBlog(
  payload: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'> & {id?: string}
): Promise<Blog> {
  const insertPayload: Record<string, unknown> = {
    ...(payload.id ? {id: payload.id} : {}),
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt ?? null,
    category_id: payload.categoryId,
    content: payload.content,
    reading_time: payload.readingTime ?? null,
    status: payload.status,
  }

  if (payload.featuredImageUrl !== undefined) {
    insertPayload.featured_image_url = payload.featuredImageUrl
  }

  const {data, error} = await supabase
    .from('blogs')
    .insert(insertPayload)
    .select('*, categories(name)')
    .single()

  if (error) throw new Error(error.message)
  return rowToBlog(data as BlogDbRow)
}

export async function updateBlog(
  id: string,
  payload: Partial<Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>>
): Promise<Blog> {
  const patch: Record<string, unknown> = {}
  if (payload.title !== undefined) patch.title = payload.title
  if (payload.slug !== undefined) patch.slug = payload.slug
  if (payload.excerpt !== undefined) patch.excerpt = payload.excerpt ?? null
  if (payload.categoryId !== undefined) patch.category_id = payload.categoryId
  if (payload.featuredImageUrl !== undefined) patch.featured_image_url = payload.featuredImageUrl ?? null
  if (payload.content !== undefined) patch.content = payload.content
  if (payload.readingTime !== undefined) patch.reading_time = payload.readingTime ?? null
  if (payload.status !== undefined) patch.status = payload.status

  const {data, error} = await supabase
    .from('blogs')
    .update(patch)
    .eq('id', id)
    .select('*, categories(name)')
    .single()

  if (error) throw new Error(error.message)
  return rowToBlog(data as BlogDbRow)
}

export async function deleteBlog(id: string): Promise<void> {
  const {error} = await supabase.from('blogs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from('blogs').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const {data, error} = await query
  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

export async function uploadImage(blogId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${blogId}/${Date.now()}.${ext}`

  const {error} = await supabase.storage
    .from('blog-images')
    .upload(path, file, {upsert: true})

  if (error) throw new Error(error.message)

  const {data} = supabase.storage.from('blog-images').getPublicUrl(path)
  return data.publicUrl
}

export function getBlogImagePath(publicUrl: string | undefined): string | null {
  if (!publicUrl) return null
  const marker = '/storage/v1/object/public/blog-images/'
  const markerIndex = publicUrl.indexOf(marker)
  if (markerIndex === -1) return null
  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length).split('?')[0])
}

export async function deleteImage(path: string): Promise<void> {
  const {error} = await supabase.storage.from('blog-images').remove([path])
  if (error) throw new Error(error.message)
}
