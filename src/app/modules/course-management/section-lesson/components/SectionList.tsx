import {useState} from 'react'
import {KTIcon} from '../../../../../_metronic/helpers'
import {useSectionController} from '../../controller/useSectionController'
import type {Section, SectionFormValues} from '../../model/Section'
import {SectionForm} from './SectionForm'
import {LessonList} from './LessonList'

type Props = {
  courseId: string
}

export function SectionList({courseId}: Props) {
  const {sections, isLoading, addSection, updateSection, deleteSection, moveUp, moveDown} =
    useSectionController(courseId)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAdd(values: SectionFormValues) {
    setActionError(null)
    try {
      await addSection(values)
      setShowAddForm(false)
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleUpdate(id: string, values: Partial<SectionFormValues>) {
    setActionError(null)
    try {
      await updateSection(id, values)
      setEditingId(null)
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)
    try {
      await deleteSection(id)
      setDeleteId(null)
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : String(e))
    }
  }

  if (isLoading) {
    return (
      <div className='d-flex align-items-center gap-2 py-4'>
        <span className='spinner-border spinner-border-sm text-primary' />
        <span className='text-muted'>Loading sections…</span>
      </div>
    )
  }

  return (
    <div className='mt-6'>
      <div className='d-flex align-items-center justify-content-between mb-4'>
        <h4 className='fw-bold mb-0'>Sections</h4>
      </div>

      {actionError && (
        <div className='alert alert-danger py-2 mb-3 fs-7'>{actionError}</div>
      )}

      {sections.length === 0 && !showAddForm && (
        <div className='text-muted mb-4'>No sections yet. Add a section to get started.</div>
      )}

      {sections.map((section: Section, idx: number) => (
        <div key={section.id} className='card mb-3 border'>
          <div className='card-header min-h-50px d-flex align-items-center justify-content-between px-4'>
            {editingId === section.id ? (
              <div className='flex-grow-1 me-3'>
                <SectionForm
                  initial={section}
                  onSave={(vals) => handleUpdate(section.id, vals)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <>
                <div
                  className='d-flex align-items-center gap-2 cursor-pointer flex-grow-1'
                  onClick={() => toggleExpand(section.id)}
                  style={{cursor: 'pointer'}}
                >
                  <KTIcon
                    iconName={expandedIds.has(section.id) ? 'down' : 'right'}
                    className='fs-5 text-muted'
                  />
                  <span className='fw-semibold'>{section.title}</span>
                </div>
                <div className='d-flex gap-1 ms-3'>
                  <button
                    className='btn btn-icon btn-sm btn-light-secondary'
                    title='Move up'
                    disabled={idx === 0}
                    onClick={() => moveUp(section.id)}
                  >
                    <KTIcon iconName='arrow-up' className='fs-5' />
                  </button>
                  <button
                    className='btn btn-icon btn-sm btn-light-secondary'
                    title='Move down'
                    disabled={idx === sections.length - 1}
                    onClick={() => moveDown(section.id)}
                  >
                    <KTIcon iconName='arrow-down' className='fs-5' />
                  </button>
                  <button
                    className='btn btn-icon btn-sm btn-light-primary'
                    title='Edit section'
                    onClick={() => setEditingId(section.id)}
                  >
                    <KTIcon iconName='pencil' className='fs-5' />
                  </button>
                  <button
                    className='btn btn-icon btn-sm btn-light-danger'
                    title='Delete section'
                    onClick={() => setDeleteId(section.id)}
                  >
                    <KTIcon iconName='trash' className='fs-5' />
                  </button>
                </div>
              </>
            )}
          </div>

          {expandedIds.has(section.id) && (
            <div className='card-body py-3'>
              <LessonList sectionId={section.id} />
            </div>
          )}

          {deleteId === section.id && (
            <div className='card-footer bg-light-danger py-3 px-4'>
              <p className='mb-2 fs-7 fw-semibold'>
                Delete section &ldquo;{section.title}&rdquo; and all its lessons?
              </p>
              {deleteError && (
                <div className='text-danger fs-7 mb-2'>{deleteError}</div>
              )}
              <div className='d-flex gap-2'>
                <button
                  className='btn btn-sm btn-danger'
                  onClick={() => handleDelete(section.id)}
                >
                  Delete
                </button>
                <button
                  className='btn btn-sm btn-light'
                  onClick={() => {
                    setDeleteId(null)
                    setDeleteError(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddForm ? (
        <div className='card border p-4 mb-3'>
          <SectionForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      ) : (
        <button
          className='btn btn-light-primary'
          onClick={() => setShowAddForm(true)}
        >
          <KTIcon iconName='plus' className='fs-4 me-1' />
          Add Section
        </button>
      )}
    </div>
  )
}
