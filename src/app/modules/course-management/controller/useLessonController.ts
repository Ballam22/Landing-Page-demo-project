import {useMutation, useQuery, useQueryClient} from 'react-query'
import type {Lesson, LessonFormValues} from '../model/Lesson'
import {
  fetchLessonsBySection,
  addLesson,
  editLesson,
  removeLesson,
  moveLessonUp,
  moveLessonDown,
} from '../service/lessonService'

export function lessonQueryKey(sectionId: string) {
  return ['lessons', sectionId] as const
}

export type UseLessonControllerResult = {
  lessons: Lesson[]
  isLoading: boolean
  error: Error | null
  addLesson: (values: LessonFormValues) => Promise<Lesson>
  updateLesson: (id: string, values: LessonFormValues) => Promise<Lesson>
  deleteLesson: (id: string) => Promise<void>
  moveUp: (lessonId: string) => Promise<void>
  moveDown: (lessonId: string) => Promise<void>
}

export function useLessonController(sectionId: string): UseLessonControllerResult {
  const queryClient = useQueryClient()
  const key = lessonQueryKey(sectionId)

  const {data: lessons = [], isLoading, error} = useQuery(
    key,
    () => fetchLessonsBySection(sectionId),
    {staleTime: 0, enabled: !!sectionId}
  )

  const invalidate = () => queryClient.invalidateQueries(key)

  const addMutation = useMutation(
    (values: LessonFormValues) => addLesson(sectionId, values),
    {onSuccess: invalidate}
  )

  const updateMutation = useMutation(
    ({id, values}: {id: string; values: LessonFormValues}) => editLesson(id, values),
    {onSuccess: invalidate}
  )

  const deleteMutation = useMutation(
    (id: string) => removeLesson(id),
    {onSuccess: invalidate}
  )

  const moveUpMutation = useMutation(
    (lessonId: string) => moveLessonUp(lessons, lessonId),
    {onSuccess: invalidate}
  )

  const moveDownMutation = useMutation(
    (lessonId: string) => moveLessonDown(lessons, lessonId),
    {onSuccess: invalidate}
  )

  return {
    lessons,
    isLoading,
    error: (error as Error | null) ?? null,
    addLesson: (values) => addMutation.mutateAsync(values),
    updateLesson: (id, values) => updateMutation.mutateAsync({id, values}),
    deleteLesson: (id) => deleteMutation.mutateAsync(id),
    moveUp: (id) => moveUpMutation.mutateAsync(id),
    moveDown: (id) => moveDownMutation.mutateAsync(id),
  }
}
