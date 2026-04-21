import {FC, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {useQueryClient, useQuery} from 'react-query'
import {useAuth} from '../../../../app/modules/auth'
import {Languages} from './Languages'
import {supabase} from '../../../../app/lib/supabaseClient'
import {fetchCurrentProfile} from '../../../../app/hooks/useCurrentProfile'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BUCKET = 'avatars'

const HeaderUserMenu: FC = () => {
  const {currentUser, logout} = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const email = currentUser?.email ?? ''
  const {data: profile} = useQuery(
    ['current-user-profile', email],
    () => fetchCurrentProfile(email),
    {enabled: !!email, staleTime: 60_000}
  )

  const handleChangePhoto = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    e.target.value = ''

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only JPEG, PNG or WebP allowed.')
      return
    }
    if (file.size > MAX_SIZE) {
      setUploadError('File must be under 5 MB.')
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${profile.id}.${ext}`
      const {error: uploadErr} = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {upsert: true})
      if (uploadErr) throw new Error(uploadErr.message)

      const {data: urlData} = supabase.storage.from(BUCKET).getPublicUrl(path)
      const {error: updateErr} = await supabase
        .from('users')
        .update({avatar_url: urlData.publicUrl})
        .eq('id', profile.id)
      if (updateErr) throw new Error(updateErr.message)

      queryClient.invalidateQueries(['current-user-profile', email])
      queryClient.invalidateQueries(['users'])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = profile?.avatarUrl
  const displayName = profile?.fullName ?? (`${currentUser?.first_name ?? ''} ${currentUser?.last_name ?? ''}`.trim() || currentUser?.email)

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='symbol symbol-50px me-5'>
            {avatarUrl ? (
              <img
                src={`${avatarUrl}?t=${Date.now()}`}
                alt={profile?.fullName ?? 'avatar'}
                className='rounded-circle'
                style={{width: 50, height: 50, objectFit: 'cover'}}
              />
            ) : (
              <div className='symbol-label fs-3 bg-light-primary text-primary rounded-circle'>
                {(profile?.fullName?.[0] ?? currentUser?.first_name?.[0] ?? currentUser?.email?.[0] ?? '?').toUpperCase()}
              </div>
            )}
          </div>

          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5'>
              {displayName}
            </div>
            <span className='fw-bold text-muted fs-7'>
              {currentUser?.email}
            </span>
          </div>
        </div>
      </div>

      <div className='separator my-2'></div>

      <div className='menu-item px-5'>
        <Link to='/profile/overview' className='menu-link px-5'>
          My Profile
        </Link>
      </div>

      <div className='menu-item px-5'>
        <a
          className='menu-link px-5'
          onClick={handleChangePhoto}
          style={{cursor: 'pointer'}}
        >
          {uploading ? 'Uploading...' : 'Change Photo'}
        </a>
        {uploadError && (
          <div className='text-danger fs-8 px-5 pb-2'>{uploadError}</div>
        )}
        <input
          ref={fileInputRef}
          type='file'
          accept='.jpg,.jpeg,.png,.webp'
          className='d-none'
          onChange={handleFileChange}
        />
      </div>

      <div className='separator my-2'></div>

      <Languages />

      <div className='menu-item px-5'>
        <a onClick={logout} className='menu-link px-5' style={{cursor: 'pointer'}}>
          Sign Out
        </a>
      </div>
    </div>
  )
}

export {HeaderUserMenu}
