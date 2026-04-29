import type {Section, SectionFormValues} from '../model/Section'
import {
  getSectionsByCourse,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from '../repository/sectionRepository'

export async function fetchSectionsByCourse(courseId: string): Promise<Section[]> {
  return getSectionsByCourse(courseId)
}

export async function addSection(
  courseId: string,
  values: SectionFormValues
): Promise<Section> {
  const siblings = await getSectionsByCourse(courseId)
  const sortOrder = values.sortOrder || siblings.length
  return createSection(courseId, {...values, sortOrder})
}

export async function editSection(
  id: string,
  values: Partial<SectionFormValues>
): Promise<Section> {
  return updateSection(id, values)
}

export async function removeSection(id: string): Promise<void> {
  return deleteSection(id)
}

export async function moveSectionUp(
  sections: Section[],
  sectionId: string
): Promise<void> {
  const idx = sections.findIndex((s) => s.id === sectionId)
  if (idx <= 0) return
  const updates = sections.map((s, i) => ({id: s.id, sortOrder: i}))
  const tmp = updates[idx].sortOrder
  updates[idx].sortOrder = updates[idx - 1].sortOrder
  updates[idx - 1].sortOrder = tmp
  await reorderSections(updates)
}

export async function moveSectionDown(
  sections: Section[],
  sectionId: string
): Promise<void> {
  const idx = sections.findIndex((s) => s.id === sectionId)
  if (idx < 0 || idx >= sections.length - 1) return
  const updates = sections.map((s, i) => ({id: s.id, sortOrder: i}))
  const tmp = updates[idx].sortOrder
  updates[idx].sortOrder = updates[idx + 1].sortOrder
  updates[idx + 1].sortOrder = tmp
  await reorderSections(updates)
}
