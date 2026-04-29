import type {Enrollment, EnrollUserFormValues} from '../model/Enrollment'
import {
  getEnrollmentsWithProgress,
  createEnrollment,
  deleteEnrollment,
  enrollmentExists,
} from '../repository/enrollmentRepository'

export async function fetchEnrollments(): Promise<Enrollment[]> {
  return getEnrollmentsWithProgress()
}

export async function enrollUser(values: EnrollUserFormValues): Promise<Enrollment> {
  const alreadyEnrolled = await enrollmentExists(values.userId, values.courseId)
  if (alreadyEnrolled) {
    throw new Error('This user is already enrolled in this course.')
  }
  return createEnrollment(values)
}

export async function removeEnrollment(id: string): Promise<void> {
  return deleteEnrollment(id)
}
