import {supabase} from '../../../lib/supabaseClient'
import type {Review, ReviewFormValues} from '../model/Review'

type ReviewDbRow = {
  id: string
  course_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  users: {id: string; full_name: string; avatar_url: string | null} | null
}

function rowToReview(row: ReviewDbRow): Review {
  return {
    id: row.id,
    courseId: row.course_id,
    userId: row.user_id,
    rating: row.rating,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
    user: row.users
      ? {
          id: row.users.id,
          fullName: row.users.full_name,
          avatarUrl: row.users.avatar_url ?? undefined,
        }
      : undefined,
  }
}

export async function getReviewsByCourse(courseId: string): Promise<Review[]> {
  const {data, error} = await supabase
    .from('reviews')
    .select('*, users(id, full_name, avatar_url)')
    .eq('course_id', courseId)
    .order('created_at', {ascending: false})
  if (error) throw new Error(error.message)
  return (data as ReviewDbRow[]).map(rowToReview)
}

export async function createReview(
  courseId: string,
  userId: string,
  values: ReviewFormValues
): Promise<Review> {
  const {data, error} = await supabase
    .from('reviews')
    .insert({
      course_id: courseId,
      user_id: userId,
      rating: values.rating,
      comment: values.comment || null,
    })
    .select('*, users(id, full_name, avatar_url)')
    .single()
  if (error) throw new Error(error.message)
  return rowToReview(data as ReviewDbRow)
}

export async function getUserReviewForCourse(
  courseId: string,
  userId: string
): Promise<Review | null> {
  const {data, error} = await supabase
    .from('reviews')
    .select('*, users(id, full_name, avatar_url)')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return rowToReview(data as ReviewDbRow)
}
