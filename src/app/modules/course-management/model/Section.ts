import type {Lesson} from './Lesson'

export type Section = {
  id: string
  courseId: string
  title: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  lessons?: Lesson[]
}

export type SectionFormValues = {
  title: string
  sortOrder: number
}

export const SECTION_FORM_DEFAULTS: SectionFormValues = {
  title: '',
  sortOrder: 0,
}
