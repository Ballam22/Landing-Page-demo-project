import {FC, useState, useCallback} from 'react'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../_metronic/layout/core'
import {EMPTY_SOCIAL_LINKS, User, UserFormValues} from './_models'
import {UserManagementProvider} from './UserManagementContext'
import {useUserManagement} from './hooks/useUserManagement'
import {UsersTable} from './components/UsersTable'
import {UserModal} from './components/UserModal'
import {DeleteConfirmDialog} from './components/DeleteConfirmDialog'

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

  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-7'>
        <h1 className='fw-bolder text-dark'>
          {intl.formatMessage({id: 'USER_MANAGEMENT.TITLE'})}
        </h1>
        <button
          type='button'
          className='btn btn-primary'
          onClick={handleAddUser}
        >
          <i className='ki-duotone ki-plus fs-3 me-1'>
            <span className='path1'></span>
            <span className='path2'></span>
          </i>
          {intl.formatMessage({id: 'USER_MANAGEMENT.ADD_USER'})}
        </button>
      </div>

      {deleteError && (
        <div className='alert alert-danger mb-4'>{deleteError}</div>
      )}

      <div className='card'>
        <div className='card-body py-4'>
          <UsersTable
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
    </>
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
