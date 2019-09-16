import { Translator } from '../../../Translator'
import { createContext } from 'react'

export let TranslatorContext = createContext<Translator | null>(null)
