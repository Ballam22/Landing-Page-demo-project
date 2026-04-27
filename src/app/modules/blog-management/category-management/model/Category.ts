export type Category = {
  id: string
  name: string
  slug: string
  description: string | undefined
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export type CategoryFormValues = {
  name: string
  slug: string
  description: string
  sortOrder: number
  isActive: boolean
}

export const CATEGORY_FORM_DEFAULTS: CategoryFormValues = {
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  isActive: true,
}
