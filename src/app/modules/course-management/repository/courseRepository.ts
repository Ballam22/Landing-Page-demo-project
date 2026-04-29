import {supabase} from '../../../lib/supabaseClient'
import type {Course, CourseFormValues} from '../model/Course'

type CourseDbRow = {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  thumbnail_path: string | null
  status: string
  sort_order: number
  created_at: string
  updated_at: string
  categories: {id: string; name: string} | null
}

function rowToCourse(row: CourseDbRow): Course {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? undefined,
    categoryId: row.category_id ?? undefined,
    thumbnailPath: row.thumbnail_path ?? undefined,
    thumbnailUrl: row.thumbnail_path ? getPublicThumbnailUrl(row.thumbnail_path) : undefined,
    status: row.status as Course['status'],
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: row.categories ?? undefined,
  }
}

export async function getCourses(): Promise<Course[]> {
  const {data, error} = await supabase
    .from('courses')
    .select('*, categories(id, name)')
    .order('sort_order', {ascending: true})
  if (error) throw new Error(error.message)
  return (data as CourseDbRow[]).map(rowToCourse)
}

export async function getCourseById(id: string): Promise<Course> {
  const {data, error} = await supabase
    .from('courses')
    .select('*, categories(id, name)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return rowToCourse(data as CourseDbRow)
}

export async function createCourse(
  values: Omit<CourseFormValues, 'thumbnailFile'> & {thumbnailPath?: string}
): Promise<Course> {
  const {data, error} = await supabase
    .from('courses')
    .insert({
      title: values.title,
      slug: values.slug,
      description: values.description || null,
      category_id: values.categoryId || null,
      thumbnail_path: values.thumbnailPath ?? null,
      status: values.status,
      sort_order: values.sortOrder,
    })
    .select('*, categories(id, name)')
    .single()
  if (error) throw new Error(error.message)
  return rowToCourse(data as CourseDbRow)
}

export async function updateCourse(
  id: string,
  values: Partial<Omit<CourseFormValues, 'thumbnailFile'> & {thumbnailPath?: string}>
): Promise<Course> {
  const payload: Record<string, unknown> = {}
  if (values.title !== undefined) payload.title = values.title
  if (values.slug !== undefined) payload.slug = values.slug
  if (values.description !== undefined) payload.description = values.description || null
  if (values.categoryId !== undefined) payload.category_id = values.categoryId || null
  if (values.thumbnailPath !== undefined) payload.thumbnail_path = values.thumbnailPath
  if (values.status !== undefined) payload.status = values.status
  if (values.sortOrder !== undefined) payload.sort_order = values.sortOrder

  const {data, error} = await supabase
    .from('courses')
    .update(payload)
    .eq('id', id)
    .select('*, categories(id, name)')
    .single()
  if (error) throw new Error(error.message)
  return rowToCourse(data as CourseDbRow)
}

export async function deleteCourse(id: string): Promise<void> {
  const {error} = await supabase.from('courses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from('courses').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const {data, error} = await query
  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

export async function uploadThumbnail(courseId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${courseId}/${Date.now()}.${ext}`
  const {error} = await supabase.storage.from('course-thumbnails').upload(path, file, {upsert: true})
  if (error) throw new Error(error.message)
  return path
}

export function getPublicThumbnailUrl(path: string): string {
  const {data} = supabase.storage.from('course-thumbnails').getPublicUrl(path)
  return data.publicUrl
}

export async function countEnrollmentsByCourse(courseId: string): Promise<number> {
  const {count, error} = await supabase
    .from('enrollments')
    .select('id', {count: 'exact', head: true})
    .eq('course_id', courseId)
  if (error) throw new Error(error.message)
  return count ?? 0
}
