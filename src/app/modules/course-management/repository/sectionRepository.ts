import {supabase} from '../../../lib/supabaseClient'
import type {Section, SectionFormValues} from '../model/Section'

type SectionDbRow = {
  id: string
  course_id: string
  title: string
  sort_order: number
  created_at: string
  updated_at: string
}

function rowToSection(row: SectionDbRow): Section {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getSectionsByCourse(courseId: string): Promise<Section[]> {
  const {data, error} = await supabase
    .from('sections')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', {ascending: true})
  if (error) throw new Error(error.message)
  return (data as SectionDbRow[]).map(rowToSection)
}

export async function createSection(
  courseId: string,
  values: SectionFormValues
): Promise<Section> {
  const {data, error} = await supabase
    .from('sections')
    .insert({
      course_id: courseId,
      title: values.title,
      sort_order: values.sortOrder,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return rowToSection(data as SectionDbRow)
}

export async function updateSection(
  id: string,
  values: Partial<SectionFormValues>
): Promise<Section> {
  const payload: Record<string, unknown> = {}
  if (values.title !== undefined) payload.title = values.title
  if (values.sortOrder !== undefined) payload.sort_order = values.sortOrder

  const {data, error} = await supabase
    .from('sections')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return rowToSection(data as SectionDbRow)
}

export async function deleteSection(id: string): Promise<void> {
  const {error} = await supabase.from('sections').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function reorderSections(
  updates: {id: string; sortOrder: number}[]
): Promise<void> {
  for (const item of updates) {
    const {error} = await supabase
      .from('sections')
      .update({sort_order: item.sortOrder})
      .eq('id', item.id)
    if (error) throw new Error(error.message)
  }
}
