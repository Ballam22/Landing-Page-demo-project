import {useMutation, useQuery, useQueryClient} from 'react-query'
import {useAuth} from '../../../modules/auth'
import {fetchCourseWithSections} from '../service/courseService'
import {enrollmentExists, createEnrollment} from '../repository/enrollmentRepository'
import {getLessonProgressByUserAndLessons} from '../repository/lessonRepository'
import type {Course} from '../model/Course'
import type {Section} from '../model/Section'
import type {Lesson} from '../model/Lesson'

export type UseCourseDetailResult = {
  course: (Course & {sections: (Section & {lessons: Lesson[]})[]}) | undefined
  isLoading: boolean
  error: Error | null
  isEnrolled: boolean
  lessonProgressMap: Record<string, boolean>
  enroll: () => Promise<void>
  enrolling: boolean
}

export function useCourseDetail(courseId: string): UseCourseDetailResult {
  const {currentUser} = useAuth()
  const userId = currentUser?.id != null ? String(currentUser.id) : undefined
  const queryClient = useQueryClient()

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery(
    ['course-detail', courseId],
    () => fetchCourseWithSections(courseId),
    {staleTime: 0, enabled: !!courseId}
  )

  const {data: isEnrolled = false, isLoading: enrollLoading} = useQuery(
    ['course-enrollment', courseId, userId],
    () => enrollmentExists(userId!, courseId),
    {staleTime: 0, enabled: !!userId && !!courseId}
  )

  const allLessonIds =
    course?.sections.flatMap((s) => s.lessons.map((l) => l.id)) ?? []

  const {data: progressList = []} = useQuery(
    ['course-lesson-progress', courseId, userId],
    () => getLessonProgressByUserAndLessons(userId!, allLessonIds),
    {staleTime: 0, enabled: !!userId && !!courseId && allLessonIds.length > 0}
  )

  const lessonProgressMap: Record<string, boolean> = {}
  for (const p of progressList) {
    lessonProgressMap[p.lessonId] = p.completed
  }

  const enrollMutation = useMutation(
    () => createEnrollment({userId: userId!, courseId}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-enrollment', courseId, userId])
      },
    }
  )

  const isLoading = courseLoading || enrollLoading

  return {
    course,
    isLoading,
    error: (courseError as Error | null) ?? null,
    isEnrolled,
    lessonProgressMap,
    enroll: () => enrollMutation.mutateAsync().then(() => undefined),
    enrolling: enrollMutation.isLoading,
  }
}
