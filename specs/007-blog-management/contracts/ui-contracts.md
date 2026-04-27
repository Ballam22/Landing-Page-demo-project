# UI Contracts: Blog Management Module

**Branch**: `007-blog-management` | **Phase**: 1 | **Date**: 2026-04-27

This document defines the component interface contracts (props) for the Blog Management module. These contracts are the boundary between the controller layer and the view layer.

---

## Category Management

### `CategoriesTable`

```ts
type CategoriesTableProps = {
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}
```

Renders a react-table with columns: name, slug, description, sort_order, is_active, created_at, actions.
Actions column renders Edit and Delete buttons that call the respective prop callbacks.

---

### `CategoryModal`

```ts
type CategoryModalProps = {
  isOpen: boolean
  mode: 'add' | 'edit'
  initialValues: CategoryFormValues
  categoryId: string | undefined          // undefined in add mode
  onClose: () => void
}
```

Wraps the Bootstrap modal shell. Renders `CategoryModalForm` inside. Closes on successful submit or Cancel.

---

### `CategoryModalForm`

```ts
type CategoryModalFormProps = {
  mode: 'add' | 'edit'
  initialValues: CategoryFormValues
  categoryId: string | undefined
  onClose: () => void
}
```

Formik-driven form. Fields: name (text), slug (text, auto-derived from name), description (textarea), sort_order (number), is_active (toggle/checkbox). Yup validation. Submit calls `addCategory` or `updateCategory` from context.

---

### `DeleteConfirmDialog` (Categories)

```ts
type CategoryDeleteConfirmDialogProps = {
  isOpen: boolean
  category: Category | null
  onConfirm: () => void
  onCancel: () => void
  errorMessage: string | null             // set when category has referenced blogs
}
```

---

## Blog Management

### `BlogsTable`

```ts
type BlogsTableProps = {
  onEdit: (blog: Blog) => void
  onDelete: (blog: Blog) => void
}
```

Renders a react-table with columns: featured_image (thumbnail `<img>`), title, slug, category name, status (`<StatusBadge>`), reading_time, created_at, updated_at, actions.

---

### `StatusBadge`

```ts
type StatusBadgeProps = {
  status: BlogStatus
}
```

Renders a Bootstrap badge `<span className={`badge ${STATUS_BADGE_CLASS[status]}`}>`. Pure presentational component.

---

### `BlogForm`

```ts
type BlogFormProps = {
  mode: 'add' | 'edit'
  initialValues: BlogFormValues
  blogId: string | undefined              // undefined in add mode
  categories: Category[]                  // active categories for dropdown
  onSuccess: () => void                   // called after successful save → navigate back to list
  onCancel: () => void                    // called on Cancel button → navigate back to list
}
```

Full-page Formik form. Fields: title (text), slug (text, auto-derived from title), excerpt (textarea), category (select), featured_image (file input + preview), content (TinyMCE Editor), reading_time (number), status (select). Submit calls `addBlog` or `updateBlog` from context.

---

### `BlogListPage`

No props (reads from context and router). Renders `BlogsTable` + "Add Blog" button that navigates to `/blog-management/blogs/new`.

---

### `BlogFormPage`

No props (reads `id` param from `useParams` to determine add vs edit mode). Fetches blog by ID in edit mode. Renders `BlogForm`.

---

### `DeleteConfirmDialog` (Blogs)

```ts
type BlogDeleteConfirmDialogProps = {
  isOpen: boolean
  blog: Blog | null
  onConfirm: () => void
  onCancel: () => void
}
```

---

## Controller Hook Contracts

### `useCategoryController`

```ts
type UseCategoryControllerResult = {
  categories: Category[]
  isLoading: boolean
  error: Error | null
  addCategory: (payload: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>
  updateCategory: (id: string, payload: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
}
```

### `useBlogController`

```ts
type UseBlogControllerResult = {
  blogs: Blog[]
  isLoading: boolean
  error: Error | null
  addBlog: (payload: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>, imageFile?: File) => Promise<Blog>
  updateBlog: (id: string, payload: Partial<Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>>, imageFile?: File) => Promise<Blog>
  deleteBlog: (id: string) => Promise<void>
  getBlogById: (id: string) => Promise<Blog>
}
```

---

## React Query Keys

```ts
export const CATEGORY_QUERY_KEY = ['categories'] as const
export const BLOG_QUERY_KEY = ['blogs'] as const
export const BLOG_DETAIL_QUERY_KEY = (id: string) => ['blogs', id] as const
```
