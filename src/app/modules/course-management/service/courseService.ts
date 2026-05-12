import type {Course, CourseFormValues} from '../model/Course'
import type {Section} from '../model/Section'
import type {Lesson} from '../model/Lesson'
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  slugExists,
  uploadThumbnail,
  countEnrollmentsByCourse,
  getCourseWithSections,
  getFeaturedCoursesByCategory,
} from '../repository/courseRepository'
import {supabase} from '../../../lib/supabaseClient'

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function resolveUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let taken = await slugExists(slug, excludeId)
  if (!taken) return slug
  let i = 2
  while (taken) {
    slug = `${base}-${i}`
    taken = await slugExists(slug, excludeId)
    i++
  }
  return slug
}

export async function fetchCourses(): Promise<Course[]> {
  return getCourses()
}

export async function fetchCourse(id: string): Promise<Course> {
  return getCourseById(id)
}

export async function addCourse(values: CourseFormValues): Promise<Course> {
  const slugBase = values.slug || toSlug(values.title)
  const slug = await resolveUniqueSlug(slugBase)
  const course = await createCourse({...values, slug, thumbnailPath: undefined})
  if (values.thumbnailFile) {
    const path = await uploadThumbnail(course.id, values.thumbnailFile)
    return updateCourse(course.id, {thumbnailPath: path})
  }
  return course
}

export async function editCourse(id: string, values: CourseFormValues): Promise<Course> {
  const slugBase = values.slug || toSlug(values.title)
  const slug = await resolveUniqueSlug(slugBase, id)
  let thumbnailPath: string | undefined
  if (values.thumbnailFile) {
    thumbnailPath = await uploadThumbnail(id, values.thumbnailFile)
  }
  return updateCourse(id, {
    title: values.title,
    slug,
    description: values.description,
    categoryId: values.categoryId,
    status: values.status,
    sortOrder: values.sortOrder,
    price: values.price,
    ...(thumbnailPath !== undefined ? {thumbnailPath} : {}),
  })
}

export async function fetchCourseWithSections(
  courseId: string
): Promise<Course & {sections: (Section & {lessons: Lesson[]})[]}> {
  return getCourseWithSections(courseId)
}

export async function fetchFeaturedCoursesByCategory(): Promise<
  {category: {id: string; name: string}; course: Course | null}[]
> {
  return getFeaturedCoursesByCategory()
}

export async function fetchAverageRatingsByCourse(): Promise<
  {courseId: string; avgRating: number; reviewCount: number}[]
> {
  const {data, error} = await supabase.from('reviews').select('course_id, rating')
  if (error) throw new Error(error.message)

  const map = new Map<string, {sum: number; count: number}>()
  for (const row of data as {course_id: string; rating: number}[]) {
    const existing = map.get(row.course_id) ?? {sum: 0, count: 0}
    map.set(row.course_id, {sum: existing.sum + row.rating, count: existing.count + 1})
  }

  return Array.from(map.entries()).map(([courseId, {sum, count}]) => ({
    courseId,
    avgRating: Math.round((sum / count) * 10) / 10,
    reviewCount: count,
  }))
}

export async function removeCourse(id: string): Promise<void> {
  const count = await countEnrollmentsByCourse(id)
  if (count > 0) {
    throw new Error('COURSE_MANAGEMENT.COURSES.DELETE_BLOCKED')
  }
  return deleteCourse(id)
}
