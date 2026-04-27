import {useState} from 'react'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../../_metronic/layout/core'
import {Category, CATEGORY_FORM_DEFAULTS, CategoryFormValues} from './model/Category'
import {CategoryManagementProvider} from './CategoryManagementContext'
import {useCategoryManagement} from './hooks/useCategoryManagement'
import {useCategoryController} from './controller/useCategoryController'
import {CategoriesTable} from './components/CategoriesTable'
import {CategoryModal} from './components/CategoryModal'
import {DeleteConfirmDialog} from './components/DeleteConfirmDialog'

function CategoryManagementContent() {
  const intl = useIntl()
  const {deleteCategory} = useCategoryManagement()
  const {categories} = useCategoryController()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [modalInitialValues, setModalInitialValues] = useState<CategoryFormValues>(CATEGORY_FORM_DEFAULTS)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const activeCount = categories.filter((category) => category.isActive).length
  const inactiveCount = categories.length - activeCount

  const handleAdd = () => {
    setSelectedCategory(null)
    setModalMode('add')
    setModalInitialValues(CATEGORY_FORM_DEFAULTS)
    setModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setModalMode('edit')
    setModalInitialValues({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    })
    setModalOpen(true)
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    try {
      await deleteCategory(categoryToDelete.id)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === 'HAS_BLOGS') {
        setDeleteError(intl.formatMessage({id: 'CATEGORY_MANAGEMENT.DELETE_HAS_BLOGS'}))
      } else {
        setDeleteError(msg)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
    setDeleteError(null)
  }

  return (
    <div className='blog-management-shell'>
      <div className='blog-management-header'>
        <div className='blog-management-header-content'>
          <div>
            <div className='blog-management-kicker'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.HEADER_KICKER'})}
            </div>
            <h1 className='blog-management-title'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.HEADER_TITLE'})}
            </h1>
            <p className='blog-management-subtitle'>
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.HEADER_SUBTITLE'})}
            </p>
          </div>
          <button className='btn btn-lg' onClick={handleAdd}>
            <i className='ki-duotone ki-plus fs-2' />
            {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.ADD_CATEGORY'})}
          </button>
        </div>
      </div>

      <div className='blog-management-stats'>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.STAT_TOTAL'})}
          </div>
          <div className='blog-management-stat-value'>{categories.length}</div>
          <div className='blog-management-stat-accent info' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.STAT_ACTIVE'})}
          </div>
          <div className='blog-management-stat-value'>{activeCount}</div>
          <div className='blog-management-stat-accent success' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.STAT_INACTIVE'})}
          </div>
          <div className='blog-management-stat-value'>{inactiveCount}</div>
          <div className='blog-management-stat-accent warning' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.STAT_VISIBLE'})}
          </div>
          <div className='blog-management-stat-value'>{activeCount}</div>
          <div className='blog-management-stat-accent danger' />
        </div>
      </div>

      <div className='card blog-management-card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title blog-management-card-title'>
            <h2>{intl.formatMessage({id: 'CATEGORY_MANAGEMENT.TABLE_TITLE'})}</h2>
            <span>{intl.formatMessage({id: 'CATEGORY_MANAGEMENT.TABLE_SUBTITLE'})}</span>
          </div>
          <div className='card-toolbar'>
            <button className='btn btn-primary' onClick={handleAdd}>
              <i className='ki-duotone ki-plus fs-2' />
              {intl.formatMessage({id: 'CATEGORY_MANAGEMENT.ADD_CATEGORY'})}
            </button>
          </div>
        </div>
        <div className='card-body py-4'>
          <CategoriesTable onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <CategoryModal
        isOpen={modalOpen}
        mode={modalMode}
        initialValues={modalInitialValues}
        categoryId={selectedCategory?.id}
        onClose={() => setModalOpen(false)}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        category={categoryToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        errorMessage={deleteError}
      />
    </div>
  )
}

export default function CategoryManagementPage() {
  const intl = useIntl()
  return (
    <CategoryManagementProvider>
      <PageTitle>{intl.formatMessage({id: 'CATEGORY_MANAGEMENT.PAGE_TITLE'})}</PageTitle>
      <CategoryManagementContent />
    </CategoryManagementProvider>
  )
}
