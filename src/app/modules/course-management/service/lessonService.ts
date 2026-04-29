import type {Lesson, LessonFormValues} from '../model/Lesson'
import {
  getLessonsBySection,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  uploadVideo,
  getSignedVideoUrl,
} from '../repository/lessonRepository'

export async function fetchLessonsBySection(sectionId: string): Promise<Lesson[]> {
  return getLessonsBySection(sectionId)
}

export function detectVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(Math.round(video.duration))
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      resolve(0)
    }
    video.src = URL.createObjectURL(file)
  })
}

export async function addLesson(
  sectionId: string,
  values: LessonFormValues
): Promise<Lesson> {
  const lesson = await createLesson(sectionId, {
    title: values.title,
    description: values.description,
    duration: values.duration,
    sortOrder: values.sortOrder,
    isFree: values.isFree,
    videoPath: undefined,
  })
  if (values.videoFile) {
    const path = await uploadVideo(lesson.id, values.videoFile)
    return updateLesson(lesson.id, {videoPath: path})
  }
  return lesson
}

export async function editLesson(
  id: string,
  values: LessonFormValues
): Promise<Lesson> {
  let videoPath: string | undefined
  if (values.videoFile) {
    videoPath = await uploadVideo(id, values.videoFile)
  }
  return updateLesson(id, {
    title: values.title,
    description: values.description,
    duration: values.duration,
    sortOrder: values.sortOrder,
    isFree: values.isFree,
    ...(videoPath !== undefined ? {videoPath} : {}),
  })
}

export async function removeLesson(id: string): Promise<void> {
  return deleteLesson(id)
}

export async function fetchSignedVideoUrl(videoPath: string): Promise<string> {
  return getSignedVideoUrl(videoPath)
}

export async function moveLessonUp(
  lessons: Lesson[],
  lessonId: string
): Promise<void> {
  const idx = lessons.findIndex((l) => l.id === lessonId)
  if (idx <= 0) return
  const updates = lessons.map((l, i) => ({id: l.id, sortOrder: i}))
  const tmp = updates[idx].sortOrder
  updates[idx].sortOrder = updates[idx - 1].sortOrder
  updates[idx - 1].sortOrder = tmp
  await reorderLessons(updates)
}

export async function moveLessonDown(
  lessons: Lesson[],
  lessonId: string
): Promise<void> {
  const idx = lessons.findIndex((l) => l.id === lessonId)
  if (idx < 0 || idx >= lessons.length - 1) return
  const updates = lessons.map((l, i) => ({id: l.id, sortOrder: i}))
  const tmp = updates[idx].sortOrder
  updates[idx].sortOrder = updates[idx + 1].sortOrder
  updates[idx + 1].sortOrder = tmp
  await reorderLessons(updates)
}
