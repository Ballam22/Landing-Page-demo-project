import {supabase} from '../../../lib/supabaseClient'
import type {Lesson, LessonFormValues} from '../model/Lesson'

type LessonDbRow = {
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
}

function rowToLesson(row: LessonDbRow): Lesson {
  return {
    id: row.id,
    sectionId: row.section_id,
    title: row.title,
    description: row.description ?? undefined,
    videoPath: row.video_path ?? undefined,
    videoSignedUrl: undefined,
    duration: row.duration ?? undefined,
    sortOrder: row.sort_order,
    isFree: row.is_free,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getLessonsBySection(sectionId: string): Promise<Lesson[]> {
  const {data, error} = await supabase
    .from('lessons')
    .select('*')
    .eq('section_id', sectionId)
    .order('sort_order', {ascending: true})
  if (error) throw new Error(error.message)
  return (data as LessonDbRow[]).map(rowToLesson)
}

export async function createLesson(
  sectionId: string,
  values: Omit<LessonFormValues, 'videoFile'> & {videoPath?: string}
): Promise<Lesson> {
  const {data, error} = await supabase
    .from('lessons')
    .insert({
      section_id: sectionId,
      title: values.title,
      description: values.description || null,
      video_path: values.videoPath ?? null,
      duration: values.duration ?? null,
      sort_order: values.sortOrder,
      is_free: values.isFree,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return rowToLesson(data as LessonDbRow)
}

export async function updateLesson(
  id: string,
  values: Partial<Omit<LessonFormValues, 'videoFile'> & {videoPath?: string}>
): Promise<Lesson> {
  const payload: Record<string, unknown> = {}
  if (values.title !== undefined) payload.title = values.title
  if (values.description !== undefined) payload.description = values.description || null
  if (values.videoPath !== undefined) payload.video_path = values.videoPath
  if (values.duration !== undefined) payload.duration = values.duration ?? null
  if (values.sortOrder !== undefined) payload.sort_order = values.sortOrder
  if (values.isFree !== undefined) payload.is_free = values.isFree

  const {data, error} = await supabase
    .from('lessons')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return rowToLesson(data as LessonDbRow)
}

export async function deleteLesson(id: string): Promise<void> {
  const {error} = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function reorderLessons(
  updates: {id: string; sortOrder: number}[]
): Promise<void> {
  for (const item of updates) {
    const {error} = await supabase
      .from('lessons')
      .update({sort_order: item.sortOrder})
      .eq('id', item.id)
    if (error) throw new Error(error.message)
  }
}

export async function uploadVideo(lessonId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${lessonId}/${Date.now()}.${ext}`
  const {error} = await supabase.storage
    .from('course-videos')
    .upload(path, file, {upsert: true})
  if (error) throw new Error(error.message)
  return path
}

export async function getSignedVideoUrl(path: string): Promise<string> {
  const {data, error} = await supabase.storage
    .from('course-videos')
    .createSignedUrl(path, 3600)
  if (error) throw new Error(error.message)
  return data.signedUrl
}
