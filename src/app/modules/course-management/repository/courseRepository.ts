import {supabase} from '../../../lib/supabaseClient'
import type {Course, CourseFormValues} from '../model/Course'
import type {Section} from '../model/Section'
import type {Lesson} from '../model/Lesson'

type CourseDbRow = {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  thumbnail_path: string | null
  status: string
  sort_order: number
  price: number | null
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
    price: row.price ?? 0,
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
      price: values.price ?? 0,
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
  if (values.price !== undefined) payload.price = values.price

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

type SectionWithLessonsDbRow = {
  id: string
  course_id: string
  title: string
  sort_order: number
  created_at: string
  updated_at: string
  lessons: {
    id: string
    section_id: string
    title: string
    description: string | null
    video_path: string | null
    duration: number | null
    sort_order: number
    is_free: boolean
    created_at: string
    updated_at: string
  }[]
}

export async function getCourseWithSections(
  courseId: string
): Promise<Course & {sections: (Section & {lessons: Lesson[]})[]}> {
  const {data: courseData, error: courseError} = await supabase
    .from('courses')
    .select('*, categories(id, name)')
    .eq('id', courseId)
    .single()
  if (courseError) throw new Error(courseError.message)
  const course = rowToCourse(courseData as CourseDbRow)

  const {data: sectionsData, error: sectionsError} = await supabase
    .from('sections')
    .select('*, lessons(*)')
    .eq('course_id', courseId)
    .order('sort_order', {ascending: true})
  if (sectionsError) throw new Error(sectionsError.message)

  const sections = (sectionsData as SectionWithLessonsDbRow[]).map((s) => ({
    id: s.id,
    courseId: s.course_id,
    title: s.title,
    sortOrder: s.sort_order,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    lessons: (s.lessons ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({
        id: l.id,
        sectionId: l.section_id,
        title: l.title,
        description: l.description ?? undefined,
        videoPath: l.video_path ?? undefined,
        videoSignedUrl: undefined,
        duration: l.duration ?? undefined,
        sortOrder: l.sort_order,
        isFree: l.is_free,
        createdAt: l.created_at,
        updatedAt: l.updated_at,
      })),
  }))

  return {...course, sections}
}

export async function getFeaturedCoursesByCategory(): Promise<
  {category: {id: string; name: string}; course: Course | null}[]
> {
  const {data: categories, error: catError} = await supabase
    .from('categories')
    .select('id, name')
    .order('name', {ascending: true})
  if (catError) throw new Error(catError.message)

  const results: {category: {id: string; name: string}; course: Course | null}[] = []

  for (const cat of categories as {id: string; name: string}[]) {
    const {data, error} = await supabase
      .from('courses')
      .select('*, categories(id, name)')
      .eq('category_id', cat.id)
      .eq('status', 'Published')
      .order('sort_order', {ascending: true})
      .limit(1)
    if (error) throw new Error(error.message)
    results.push({
      category: cat,
      course: data && data.length > 0 ? rowToCourse(data[0] as CourseDbRow) : null,
    })
  }

  return results
}
