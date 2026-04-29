import {useMutation, useQuery, useQueryClient} from 'react-query'
import type {Course, CourseFormValues} from '../model/Course'
import {fetchCourses, fetchCourse, addCourse, editCourse, removeCourse} from '../service/courseService'

export const COURSE_QUERY_KEY = ['courses'] as const

export type UseCourseControllerResult = {
  courses: Course[]
  isLoading: boolean
  error: Error | null
  addCourse: (values: CourseFormValues) => Promise<Course>
  updateCourse: (id: string, values: CourseFormValues) => Promise<Course>
  deleteCourse: (id: string) => Promise<void>
}

export function useCourseController(): UseCourseControllerResult {
  const queryClient = useQueryClient()

  const {data: courses = [], isLoading, error} = useQuery(COURSE_QUERY_KEY, fetchCourses, {
    staleTime: 0,
  })

  const addMutation = useMutation(
    (values: CourseFormValues) => addCourse(values),
    {onSuccess: () => queryClient.invalidateQueries(COURSE_QUERY_KEY)}
  )

  const updateMutation = useMutation(
    ({id, values}: {id: string; values: CourseFormValues}) => editCourse(id, values),
    {onSuccess: () => queryClient.invalidateQueries(COURSE_QUERY_KEY)}
  )

  const deleteMutation = useMutation(
    (id: string) => removeCourse(id),
    {onSuccess: () => queryClient.invalidateQueries(COURSE_QUERY_KEY)}
  )

  return {
    courses,
    isLoading,
    error: (error as Error | null) ?? null,
    addCourse: (values) => addMutation.mutateAsync(values),
    updateCourse: (id, values) => updateMutation.mutateAsync({id, values}),
    deleteCourse: (id) => deleteMutation.mutateAsync(id),
  }
}

export type UseSingleCourseResult = {
  course: Course | undefined
  isLoading: boolean
  error: Error | null
}

export function useSingleCourse(id: string): UseSingleCourseResult {
  const {data: course, isLoading, error} = useQuery(
    [...COURSE_QUERY_KEY, id],
    () => fetchCourse(id),
    {staleTime: 0, enabled: !!id}
  )
  return {course, isLoading, error: (error as Error | null) ?? null}
}
