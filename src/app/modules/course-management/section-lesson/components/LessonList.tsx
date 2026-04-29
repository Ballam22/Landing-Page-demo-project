import {useState} from 'react'
import {KTIcon} from '../../../../../_metronic/helpers'
import {useLessonController} from '../../controller/useLessonController'
import type {Lesson, LessonFormValues} from '../../model/Lesson'
import {LessonForm} from './LessonForm'
import {VideoPlayer} from './VideoPlayer'

type Props = {
  sectionId: string
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function LessonList({sectionId}: Props) {
  const {lessons, isLoading, addLesson, updateLesson, deleteLesson, moveUp, moveDown} =
    useLessonController(sectionId)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleAdd(values: LessonFormValues) {
    setActionError(null)
    try {
      await addLesson(values)
      setShowAddForm(false)
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleUpdate(id: string, values: LessonFormValues) {
    setActionError(null)
    try {
      await updateLesson(id, values)
      setEditingId(null)
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)
    try {
      await deleteLesson(id)
      setDeleteId(null)
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : String(e))
    }
  }

  if (isLoading) {
    return (
      <div className='py-3 ps-4'>
        <span className='spinner-border spinner-border-sm text-primary' />
      </div>
    )
  }

  return (
    <div className='ms-4 mt-2'>
      {actionError && (
        <div className='alert alert-danger py-2 mb-2 fs-7'>{actionError}</div>
      )}

      {lessons.length === 0 && !showAddForm && (
        <div className='text-muted fs-7 mb-2'>No lessons yet.</div>
      )}

      {lessons.map((lesson: Lesson, idx: number) => (
        <div key={lesson.id} className='border rounded mb-2 p-3 bg-white'>
          {editingId === lesson.id ? (
            <LessonForm
              initial={lesson}
              onSave={(vals) => handleUpdate(lesson.id, vals)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <div className='d-flex align-items-center justify-content-between'>
                <div className='d-flex align-items-center gap-2'>
                  <span className='fw-semibold fs-7'>{lesson.title}</span>
                  {lesson.isFree && (
                    <span className='badge badge-light-success fs-8'>Free</span>
                  )}
                  <span className='text-muted fs-8'>{formatDuration(lesson.duration)}</span>
                </div>
                <div className='d-flex gap-1'>
                  <button
                    className='btn btn-icon btn-sm btn-light-secondary'
                    title='Move up'
                    disabled={idx === 0}
                    onClick={() => moveUp(lesson.id)}
                  >
                    <KTIcon iconName='arrow-up' className='fs-5' />
                  </button>
                  <button
                    className='btn btn-icon btn-sm btn-light-secondary'
                    title='Move down'
                    disabled={idx === lessons.length - 1}
                    onClick={() => moveDown(lesson.id)}
                  >
                    <KTIcon iconName='arrow-down' className='fs-5' />
                  </button>
                  {lesson.videoPath && (
                    <button
                      className='btn btn-icon btn-sm btn-light-info'
                      title='Preview video'
                      onClick={() =>
                        setPreviewId(previewId === lesson.id ? null : lesson.id)
                      }
                    >
                      <KTIcon iconName='media' className='fs-5' />
                    </button>
                  )}
                  <button
                    className='btn btn-icon btn-sm btn-light-primary'
                    title='Edit'
                    onClick={() => setEditingId(lesson.id)}
                  >
                    <KTIcon iconName='pencil' className='fs-5' />
                  </button>
                  <button
                    className='btn btn-icon btn-sm btn-light-danger'
                    title='Delete'
                    onClick={() => setDeleteId(lesson.id)}
                  >
                    <KTIcon iconName='trash' className='fs-5' />
                  </button>
                </div>
              </div>

              {previewId === lesson.id && lesson.videoPath && (
                <div className='mt-3'>
                  <VideoPlayer videoPath={lesson.videoPath} />
                </div>
              )}

              {deleteId === lesson.id && (
                <div className='mt-3 p-3 bg-light-danger rounded'>
                  <p className='mb-2 fs-7 fw-semibold'>
                    Delete lesson &ldquo;{lesson.title}&rdquo;?
                  </p>
                  {deleteError && (
                    <div className='text-danger fs-7 mb-2'>{deleteError}</div>
                  )}
                  <div className='d-flex gap-2'>
                    <button
                      className='btn btn-sm btn-danger'
                      onClick={() => handleDelete(lesson.id)}
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
            </>
          )}
        </div>
      ))}

      {showAddForm ? (
        <div className='border rounded p-3 bg-light-primary mb-2'>
          <LessonForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      ) : (
        <button
          className='btn btn-sm btn-light-primary mt-1'
          onClick={() => setShowAddForm(true)}
        >
          <KTIcon iconName='plus' className='fs-5 me-1' />
          Add Lesson
        </button>
      )}
    </div>
  )
}
