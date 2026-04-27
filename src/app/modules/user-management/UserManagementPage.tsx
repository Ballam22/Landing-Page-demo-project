import {FC, useState, useCallback} from 'react'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../_metronic/layout/core'
import {EMPTY_SOCIAL_LINKS, User, UserFormValues} from './model/User'
import {UserManagementProvider} from './UserManagementContext'
import {useUserManagement} from './hooks/useUserManagement'
import {UsersTable} from './components/UsersTable'
import {UserModal} from './components/UserModal'
import {DeleteConfirmDialog} from './components/DeleteConfirmDialog'
import {useUserDetailDrawer} from './controller/useUserDetailDrawer'
import {UserDetailDrawer} from './components/UserDetailDrawer'
import {useUserController} from './controller/useUserController'
import '../blog-management/BlogManagement.css'

const EMPTY_FORM_VALUES: UserFormValues = {
  fullName: '',
  email: '',
  role: 'User',
  status: 'Active',
  avatarFile: null,
  avatarUrl: undefined,
  socialLinks: {
    linkedin: {...EMPTY_SOCIAL_LINKS.linkedin},
    instagram: {...EMPTY_SOCIAL_LINKS.instagram},
    x: {...EMPTY_SOCIAL_LINKS.x},
  },
}

const userToFormValues = (user: User): UserFormValues => ({
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  avatarFile: null,
  avatarUrl: user.avatarUrl,
  socialLinks: {
    linkedin: {...user.socialLinks.linkedin},
    instagram: {...user.socialLinks.instagram},
    x: {...user.socialLinks.x},
  },
})

const UserManagementContent: FC = () => {
  const intl = useIntl()
  const {currentUserId, deleteUser} = useUserManagement()
  const {users} = useUserController()
  const {selectedDetailUser, isOpen, openDrawer, closeDrawer} = useUserDetailDrawer()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleAddUser = useCallback(() => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback((user: User) => {
    setUserToDelete(user)
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleDeleteClose = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
    setDeleteError(null)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return
    try {
      await deleteUser(userToDelete.id)
      handleDeleteClose()
    } catch {
      setDeleteError(intl.formatMessage({id: 'USER_MANAGEMENT.DELETE_ERROR'}))
    }
  }, [userToDelete, deleteUser, handleDeleteClose, intl])

  const modalInitialValues = selectedUser ? userToFormValues(selectedUser) : EMPTY_FORM_VALUES
  const modalMode = selectedUser ? 'edit' : 'add'
  const activeUsers = users.filter((user) => user.status === 'Active').length
  const admins = users.filter((user) => user.role === 'Admin').length
  const managers = users.filter((user) => user.role === 'Manager').length

  return (
    <div className='blog-management-shell'>
      <div className='blog-management-header'>
        <div className='blog-management-header-content'>
          <div>
            <div className='blog-management-kicker'>
              {intl.formatMessage({id: 'USER_MANAGEMENT.HEADER_KICKER'})}
            </div>
            <h1 className='blog-management-title'>
              {intl.formatMessage({id: 'USER_MANAGEMENT.TITLE'})}
            </h1>
            <p className='blog-management-subtitle'>
              {intl.formatMessage({id: 'USER_MANAGEMENT.HEADER_SUBTITLE'})}
            </p>
          </div>
          <button type='button' className='btn btn-lg' onClick={handleAddUser}>
            <i className='ki-duotone ki-plus fs-3 me-1'>
              <span className='path1'></span>
              <span className='path2'></span>
            </i>
            {intl.formatMessage({id: 'USER_MANAGEMENT.ADD_USER'})}
          </button>
        </div>
      </div>

      <div className='blog-management-stats'>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.STAT_TOTAL'})}
          </div>
          <div className='blog-management-stat-value'>{users.length}</div>
          <div className='blog-management-stat-accent info' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.STAT_ACTIVE'})}
          </div>
          <div className='blog-management-stat-value'>{activeUsers}</div>
          <div className='blog-management-stat-accent success' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.STAT_ADMINS'})}
          </div>
          <div className='blog-management-stat-value'>{admins}</div>
          <div className='blog-management-stat-accent warning' />
        </div>
        <div className='blog-management-stat'>
          <div className='blog-management-stat-label'>
            {intl.formatMessage({id: 'USER_MANAGEMENT.STAT_MANAGERS'})}
          </div>
          <div className='blog-management-stat-value'>{managers}</div>
          <div className='blog-management-stat-accent danger' />
        </div>
      </div>

      {deleteError && (
        <div className='alert alert-danger mb-4'>{deleteError}</div>
      )}

      <div className='card blog-management-card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title blog-management-card-title'>
            <h2>{intl.formatMessage({id: 'USER_MANAGEMENT.TABLE_TITLE'})}</h2>
            <span>{intl.formatMessage({id: 'USER_MANAGEMENT.TABLE_SUBTITLE'})}</span>
          </div>
        </div>
        <div className='card-body py-4'>
          <UsersTable
            currentUserId={currentUserId}
            selectedDetailUserId={selectedDetailUser?.id ?? null}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={openDrawer}
          />
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialValues={modalInitialValues}
        mode={modalMode}
        userId={selectedUser?.id}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.fullName ?? ''}
      />

      <UserDetailDrawer user={selectedDetailUser} isOpen={isOpen} onClose={closeDrawer} />
    </div>
  )
}

const UserManagementPage: FC = () => {
  const intl = useIntl()

  return (
    <UserManagementProvider>
      <PageTitle>{intl.formatMessage({id: 'USER_MANAGEMENT.TITLE'})}</PageTitle>
      <UserManagementContent />
    </UserManagementProvider>
  )
}

export default UserManagementPage
