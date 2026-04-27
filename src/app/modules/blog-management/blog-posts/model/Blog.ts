export type BlogStatus = 'Draft' | 'Review' | 'Scheduled' | 'Published' | 'Archived'

export const BLOG_STATUSES: BlogStatus[] = [
  'Draft',
  'Review',
  'Scheduled',
  'Published',
  'Archived',
]

export const STATUS_BADGE_CLASS: Record<BlogStatus, string> = {
  Draft: 'badge-secondary',
  Review: 'badge-primary',
  Scheduled: 'badge-warning',
  Published: 'badge-success',
  Archived: 'badge-dark',
}

export type Blog = {
  id: string
  title: string
  slug: string
  excerpt: string | undefined
  categoryId: string
  categoryName: string
  featuredImageUrl: string | undefined
  content: string
  readingTime: number | undefined
  status: BlogStatus
  createdAt: string
  updatedAt: string
}

export type BlogFormValues = {
  title: string
  slug: string
  excerpt: string
  categoryId: string
  featuredImageFile: File | null
  featuredImageUrl: string | undefined
  content: string
  readingTime: string
  status: BlogStatus
}

export const BLOG_FORM_DEFAULTS: BlogFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  categoryId: '',
  featuredImageFile: null,
  featuredImageUrl: undefined,
  content: '',
  readingTime: '',
  status: 'Draft',
}
