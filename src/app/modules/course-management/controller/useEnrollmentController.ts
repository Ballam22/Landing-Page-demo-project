import {useMutation, useQuery, useQueryClient} from 'react-query'
import type {Enrollment, EnrollUserFormValues} from '../model/Enrollment'
import {fetchEnrollments, enrollUser, removeEnrollment} from '../service/enrollmentService'

export const ENROLLMENT_QUERY_KEY = ['enrollments'] as const

export type UseEnrollmentControllerResult = {
  enrollments: Enrollment[]
  isLoading: boolean
  error: Error | null
  enroll: (values: EnrollUserFormValues) => Promise<Enrollment>
  unenroll: (id: string) => Promise<void>
}

export function useEnrollmentController(): UseEnrollmentControllerResult {
  const queryClient = useQueryClient()

  const {data: enrollments = [], isLoading, error} = useQuery(
    ENROLLMENT_QUERY_KEY,
    fetchEnrollments,
    {staleTime: 0}
  )

  const enrollMutation = useMutation(
    (values: EnrollUserFormValues) => enrollUser(values),
    {onSuccess: () => queryClient.invalidateQueries(ENROLLMENT_QUERY_KEY)}
  )

  const unenrollMutation = useMutation(
    (id: string) => removeEnrollment(id),
    {onSuccess: () => queryClient.invalidateQueries(ENROLLMENT_QUERY_KEY)}
  )

  return {
    enrollments,
    isLoading,
    error: (error as Error | null) ?? null,
    enroll: (values) => enrollMutation.mutateAsync(values),
    unenroll: (id) => unenrollMutation.mutateAsync(id),
  }
}
