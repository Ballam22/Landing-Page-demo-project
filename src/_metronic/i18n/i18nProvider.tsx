import {FC} from 'react'
import {IntlProvider} from 'react-intl'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en'

import enMessages from './messages/en.json'
import {WithChildren} from '../helpers'

const I18nProvider: FC<WithChildren> = ({children}) => {
  return (
    <IntlProvider locale='en' messages={enMessages}>
      {children}
    </IntlProvider>
  )
}

export {I18nProvider}
