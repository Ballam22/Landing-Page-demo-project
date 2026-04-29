import {useMutation, useQuery, useQueryClient} from 'react-query'
import type {Section, SectionFormValues} from '../model/Section'
import {
  fetchSectionsByCourse,
  addSection,
  editSection,
  removeSection,
  moveSectionUp,
  moveSectionDown,
} from '../service/sectionService'

export function sectionQueryKey(courseId: string) {
  return ['sections', courseId] as const
}

export type UseSectionControllerResult = {
  sections: Section[]
  isLoading: boolean
  error: Error | null
  addSection: (values: SectionFormValues) => Promise<Section>
  updateSection: (id: string, values: Partial<SectionFormValues>) => Promise<Section>
  deleteSection: (id: string) => Promise<void>
  moveUp: (sectionId: string) => Promise<void>
  moveDown: (sectionId: string) => Promise<void>
}

export function useSectionController(courseId: string): UseSectionControllerResult {
  const queryClient = useQueryClient()
  const key = sectionQueryKey(courseId)

  const {data: sections = [], isLoading, error} = useQuery(
    key,
    () => fetchSectionsByCourse(courseId),
    {staleTime: 0, enabled: !!courseId}
  )

  const invalidate = () => queryClient.invalidateQueries(key)

  const addMutation = useMutation(
    (values: SectionFormValues) => addSection(courseId, values),
    {onSuccess: invalidate}
  )

  const updateMutation = useMutation(
    ({id, values}: {id: string; values: Partial<SectionFormValues>}) =>
      editSection(id, values),
    {onSuccess: invalidate}
  )

  const deleteMutation = useMutation(
    (id: string) => removeSection(id),
    {onSuccess: invalidate}
  )

  const moveUpMutation = useMutation(
    (sectionId: string) => moveSectionUp(sections, sectionId),
    {onSuccess: invalidate}
  )

  const moveDownMutation = useMutation(
    (sectionId: string) => moveSectionDown(sections, sectionId),
    {onSuccess: invalidate}
  )

  return {
    sections,
    isLoading,
    error: (error as Error | null) ?? null,
    addSection: (values) => addMutation.mutateAsync(values),
    updateSection: (id, values) => updateMutation.mutateAsync({id, values}),
    deleteSection: (id) => deleteMutation.mutateAsync(id),
    moveUp: (id) => moveUpMutation.mutateAsync(id),
    moveDown: (id) => moveDownMutation.mutateAsync(id),
  }
}
