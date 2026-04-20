/* eslint-disable react-refresh/only-export-components */
import {FC, createContext, useContext, useMemo, useState} from 'react'
import {WithChildren} from '../helpers'

const I18N_CONFIG_KEY = import.meta.env.VITE_APP_I18N_CONFIG_KEY || 'i18nConfig'
export const SUPPORTED_LANGUAGES = ['en', 'de'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

type Props = {
  selectedLang: SupportedLanguage
  setSelectedLang: (lang: SupportedLanguage) => void
}
const initialState: Props = {
  selectedLang: 'en',
  setSelectedLang: () => {},
}

type StoredConfig = {
  selectedLang: SupportedLanguage
}

function getConfig(): StoredConfig {
  const ls = localStorage.getItem(I18N_CONFIG_KEY)
  if (ls) {
    try {
      const parsed = JSON.parse(ls) as Partial<StoredConfig>

      if (parsed.selectedLang && SUPPORTED_LANGUAGES.includes(parsed.selectedLang)) {
        return {selectedLang: parsed.selectedLang}
      }
    } catch (er) {
      console.error(er)
    }
  }

  const fallbackConfig: StoredConfig = {selectedLang: 'en'}
  localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify(fallbackConfig))
  return fallbackConfig
}

const I18nContext = createContext<Props>(initialState)

const useLang = () => {
  return useContext(I18nContext).selectedLang
}

const useSetLang = () => {
  return useContext(I18nContext).setSelectedLang
}

const MetronicI18nProvider: FC<WithChildren> = ({children}) => {
  const [selectedLang, setSelectedLangState] = useState<SupportedLanguage>(() => getConfig().selectedLang)

  const setSelectedLang = (lang: SupportedLanguage) => {
    localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({selectedLang: lang}))
    setSelectedLangState(lang)
  }

  const value = useMemo(
    () => ({
      selectedLang,
      setSelectedLang,
    }),
    [selectedLang]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export {MetronicI18nProvider, useLang, useSetLang}
