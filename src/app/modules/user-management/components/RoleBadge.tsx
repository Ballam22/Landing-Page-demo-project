import {FC} from 'react'
import {useIntl} from 'react-intl'
import {Role} from '../_models'

const badgeClassMap: Record<Role, string> = {
  Admin: 'badge badge-light-danger',
  Manager: 'badge badge-light-warning',
  User: 'badge badge-light-primary',
}

const roleIntlKeyMap: Record<Role, string> = {
  Admin: 'USER_MANAGEMENT.ROLE_ADMIN',
  Manager: 'USER_MANAGEMENT.ROLE_MANAGER',
  User: 'USER_MANAGEMENT.ROLE_USER',
}

type Props = {
  role: Role
}

const RoleBadge: FC<Props> = ({role}) => {
  const intl = useIntl()
  return (
    <span className={badgeClassMap[role]}>
      {intl.formatMessage({id: roleIntlKeyMap[role]})}
    </span>
  )
}

export {RoleBadge}
