import {supabase} from '../../lib/supabaseClient'
import {getPublicThumbnailUrl} from '../../modules/course-management/repository/courseRepository'
import type {PublicCourse, PublicCategory, PublicReview, PublicBlogPost, LandingStats} from './model'

export async function getPublicCourses(): Promise<PublicCourse[]> {
  const [{data: coursesData, error: coursesError}, {data: reviewsData, error: reviewsError}] =
    await Promise.all([
      supabase
        .from('courses')
        .select('id, title, thumbnail_path, category_id, price, categories(id, name)')
        .eq('status', 'Published')
        .order('sort_order', {ascending: true})
        .limit(6),
      supabase.from('reviews').select('course_id, rating'),
    ])

  if (coursesError) throw new Error(coursesError.message)
  if (reviewsError) throw new Error(reviewsError.message)

  const ratingMap = new Map<string, {sum: number; count: number}>()
  for (const r of (reviewsData ?? []) as {course_id: string; rating: number}[]) {
    const existing = ratingMap.get(r.course_id) ?? {sum: 0, count: 0}
    ratingMap.set(r.course_id, {sum: existing.sum + r.rating, count: existing.count + 1})
  }

  return (
    coursesData as {
      id: string
      title: string
      thumbnail_path: string | null
      category_id: string | null
      price: number | null
      categories: {id: string; name: string} | null
    }[]
  ).map((row) => {
    const ratingEntry = ratingMap.get(row.id)
    return {
      id: row.id,
      title: row.title,
      thumbnailUrl: row.thumbnail_path ? getPublicThumbnailUrl(row.thumbnail_path) : undefined,
      categoryId: row.category_id ?? undefined,
      categoryName: row.categories?.name ?? undefined,
      price: row.price ?? 0,
      avgRating: ratingEntry ? Math.round((ratingEntry.sum / ratingEntry.count) * 10) / 10 : 0,
    }
  })
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  const {data: categories, error: catError} = await supabase
    .from('categories')
    .select('id, name')
    .order('name', {ascending: true})
  if (catError) throw new Error(catError.message)

  const results: PublicCategory[] = []
  for (const cat of categories as {id: string; name: string}[]) {
    const {count, error} = await supabase
      .from('courses')
      .select('id', {count: 'exact', head: true})
      .eq('category_id', cat.id)
      .eq('status', 'Published')
    if (error) throw new Error(error.message)
    results.push({id: cat.id, name: cat.name, courseCount: count ?? 0})
  }
  return results
}

export async function getLandingStats(): Promise<LandingStats> {
  const [
    {count: totalCourses, error: e1},
    {data: enrollments, error: e2},
    {count: totalReviews, error: e3},
    {count: publishedBlogs, error: e4},
  ] = await Promise.all([
    supabase
      .from('courses')
      .select('id', {count: 'exact', head: true})
      .eq('status', 'Published'),
    supabase.from('enrollments').select('user_id'),
    supabase.from('reviews').select('id', {count: 'exact', head: true}),
    supabase
      .from('blogs')
      .select('id', {count: 'exact', head: true})
      .eq('status', 'Published'),
  ])

  if (e1) throw new Error(e1.message)
  if (e2) throw new Error(e2.message)
  if (e3) throw new Error(e3.message)
  if (e4) throw new Error(e4.message)

  const distinctStudents = new Set(
    (enrollments as {user_id: string}[]).map((e) => e.user_id)
  ).size

  return {
    totalCourses: totalCourses ?? 0,
    totalStudents: distinctStudents,
    totalReviews: totalReviews ?? 0,
    publishedBlogs: publishedBlogs ?? 0,
  }
}

export async function getTopReviews(): Promise<PublicReview[]> {
  const {data, error} = await supabase
    .from('reviews')
    .select('id, course_id, rating, comment, created_at, users(full_name, avatar_url), courses(title)')
    .order('rating', {ascending: false})
    .order('created_at', {ascending: false})
    .limit(3)
  if (error) throw new Error(error.message)

  return (
    data as {
      id: string
      course_id: string
      rating: number
      comment: string | null
      created_at: string
      users: {full_name: string; avatar_url: string | null} | null
      courses: {title: string} | null
    }[]
  ).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.courses?.title ?? '',
    rating: row.rating,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
    user: row.users
      ? {fullName: row.users.full_name, avatarUrl: row.users.avatar_url ?? undefined}
      : undefined,
  }))
}

export async function getLatestBlogPosts(): Promise<PublicBlogPost[]> {
  const {data, error} = await supabase
    .from('blogs')
    .select('id, title, excerpt, featured_image_url, created_at, categories(name)')
    .eq('status', 'Published')
    .order('created_at', {ascending: false})
    .limit(3)
  if (error) throw new Error(error.message)

  return (
    data as {
      id: string
      title: string
      excerpt: string | null
      featured_image_url: string | null
      created_at: string
      categories: {name: string} | null
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    featuredImageUrl: row.featured_image_url ?? undefined,
    categoryName: row.categories?.name ?? undefined,
    createdAt: row.created_at,
  }))
}
