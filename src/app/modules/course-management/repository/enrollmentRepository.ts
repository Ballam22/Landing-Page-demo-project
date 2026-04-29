import {supabase} from '../../../lib/supabaseClient'
import type {Enrollment, EnrollUserFormValues} from '../model/Enrollment'

type EnrollmentDbRow = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  completed_at: string | null
  users: {id: string; full_name: string; email: string} | null
  courses: {id: string; title: string} | null
}

function rowToEnrollment(row: EnrollmentDbRow): Enrollment {
  const totalLessons = 0
  const completedLessons = 0
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at ?? undefined,
    progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    user: row.users
      ? {id: row.users.id, fullName: row.users.full_name, email: row.users.email}
      : undefined,
    course: row.courses ?? undefined,
  }
}

export async function getEnrollments(): Promise<Enrollment[]> {
  const {data, error} = await supabase
    .from('enrollments')
    .select('*, users(id, full_name, email), courses(id, title)')
    .order('enrolled_at', {ascending: false})
  if (error) throw new Error(error.message)
  return (data as EnrollmentDbRow[]).map(rowToEnrollment)
}

export async function getEnrollmentsWithProgress(): Promise<Enrollment[]> {
  const {data: enrollments, error} = await supabase
    .from('enrollments')
    .select('*, users(id, full_name, email), courses(id, title)')
    .order('enrolled_at', {ascending: false})
  if (error) throw new Error(error.message)

  const results: Enrollment[] = []

  for (const row of enrollments as EnrollmentDbRow[]) {
    const {count: totalCount} = await supabase
      .from('lessons')
      .select('id', {count: 'exact', head: true})
      .in(
        'section_id',
        (
          await supabase.from('sections').select('id').eq('course_id', row.course_id)
        ).data?.map((s: {id: string}) => s.id) ?? []
      )

    const {count: completedCount} = await supabase
      .from('lesson_progress')
      .select('id', {count: 'exact', head: true})
      .eq('user_id', row.user_id)
      .eq('completed', true)

    const total = totalCount ?? 0
    const completed = completedCount ?? 0

    results.push({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      enrolledAt: row.enrolled_at,
      completedAt: row.completed_at ?? undefined,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      user: row.users
        ? {id: row.users.id, fullName: row.users.full_name, email: row.users.email}
        : undefined,
      course: row.courses ?? undefined,
    })
  }

  return results
}

export async function createEnrollment(values: EnrollUserFormValues): Promise<Enrollment> {
  const {data, error} = await supabase
    .from('enrollments')
    .insert({
      user_id: values.userId,
      course_id: values.courseId,
    })
    .select('*, users(id, full_name, email), courses(id, title)')
    .single()
  if (error) throw new Error(error.message)
  return rowToEnrollment(data as EnrollmentDbRow)
}

export async function deleteEnrollment(id: string): Promise<void> {
  const {error} = await supabase.from('enrollments').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function enrollmentExists(userId: string, courseId: string): Promise<boolean> {
  const {data, error} = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}
