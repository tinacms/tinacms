import { Translator } from '../../../Translator'
import { createContext } from 'react'

export const TranslatorContext = createContext<Translator | null>(null)
