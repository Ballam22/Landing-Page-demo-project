import {useState} from 'react'
import {useIntl} from 'react-intl'
import type {Section} from '../../model/Section'
import type {Lesson} from '../../model/Lesson'

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '—'
  if (seconds < 60) return `${seconds}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

type LessonIconProps = {isEnrolled: boolean; completed: boolean}

function LessonIcon({isEnrolled, completed}: LessonIconProps) {
  if (!isEnrolled) {
    return (
      <i className='ki-duotone ki-lock fs-4 text-muted'>
        <span className='path1' />
        <span className='path2' />
      </i>
    )
  }
  if (completed) {
    return (
      <i className='ki-duotone ki-check-circle fs-4 text-success'>
        <span className='path1' />
        <span className='path2' />
      </i>
    )
  }
  return (
    <i className='ki-duotone ki-media fs-4 text-primary'>
      <span className='path1' />
      <span className='path2' />
      <span className='path3' />
    </i>
  )
}

type CourseAccordionProps = {
  sections: (Section & {lessons: Lesson[]})[]
  lessonProgressMap: Record<string, boolean>
  isEnrolled: boolean
}

export function CourseAccordion({sections, lessonProgressMap, isEnrolled}: CourseAccordionProps) {
  const intl = useIntl()
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    sections.length > 0 ? sections[0].id : null
  )

  if (sections.length === 0) {
    return (
      <p className='text-muted py-4'>
        {intl.formatMessage({id: 'COURSE_DETAIL.NO_CURRICULUM'})}
      </p>
    )
  }

  return (
    <div className='accordion' id='courseAccordion'>
      {sections.map((section) => {
        const isOpen = openSectionId === section.id
        const totalDuration = section.lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0)

        return (
          <div key={section.id} className='accordion-item border mb-2 rounded'>
            <h2 className='accordion-header'>
              <button
                type='button'
                className={`accordion-button fw-semibold ${isOpen ? '' : 'collapsed'} bg-light`}
                onClick={() => setOpenSectionId(isOpen ? null : section.id)}
                aria-expanded={isOpen}
              >
                <span className='flex-grow-1 text-start'>{section.title}</span>
                <span className='badge badge-light-secondary me-3 ms-3'>
                  {intl.formatMessage(
                    {id: 'COURSE_DETAIL.LESSONS_COUNT'},
                    {count: section.lessons.length}
                  )}
                </span>
                <span className='text-muted fs-7 fw-normal me-2'>
                  {formatDuration(totalDuration)}
                </span>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
              <div className='accordion-body p-0'>
                {section.lessons.length === 0 ? (
                  <div className='px-5 py-3 text-muted fs-7'>
                    {intl.formatMessage({id: 'COURSE_DETAIL.LESSONS_COUNT'}, {count: 0})}
                  </div>
                ) : (
                  <ul className='list-unstyled mb-0'>
                    {section.lessons.map((lesson) => {
                      const completed = lessonProgressMap[lesson.id] === true
                      return (
                        <li
                          key={lesson.id}
                          className='d-flex align-items-center px-5 py-3 border-top gap-3'
                        >
                          <LessonIcon isEnrolled={isEnrolled} completed={completed} />
                          <span className='flex-grow-1 fs-6'>{lesson.title}</span>
                          <span className='text-muted fs-7'>
                            {formatDuration(lesson.duration)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
