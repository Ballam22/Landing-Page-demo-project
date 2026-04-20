import {FC} from 'react'
import {useIntl} from 'react-intl'
import {Role} from '../_models'

const badgeClassMap: Record<Role, string> = {
  Admin: 'badge badge-light-primary',
  Manager: 'badge badge-light-success',
  User: 'badge badge-light-secondary',
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
