import {FC} from 'react'
import {IntlProvider} from 'react-intl'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/de'

import enMessages from './messages/en.json'
import deMessages from './messages/de'
import {WithChildren} from '../helpers'
import {useLang} from './Metronici18n'

const I18nProvider: FC<WithChildren> = ({children}) => {
  const locale = useLang()
  const messages = locale === 'de' ? {...enMessages, ...deMessages} : enMessages

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}

export {I18nProvider}
