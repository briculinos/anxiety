// Default mantras in Romanian and English
import { getDeviceLanguage, Language } from './language'

export interface Mantra {
  id: string
  ro: string
  en: string
}

export const defaultMantras: Mantra[] = [
  { id: '1', ro: 'Acest moment va trece', en: 'This moment will pass' },
  { id: '2', ro: 'Sunt în siguranță', en: 'I am safe' },
  { id: '3', ro: 'Respir și mă calmez', en: 'I breathe and calm down' },
  { id: '4', ro: 'Am trecut prin asta înainte', en: 'I\'ve been through this before' },
  { id: '5', ro: 'Sunt mai puternic decât anxietatea', en: 'I am stronger than anxiety' },
  { id: '6', ro: 'Pot face față oricărei situații', en: 'I can handle any situation' },
  { id: '7', ro: 'Sunt calm și centrat', en: 'I am calm and centered' },
  { id: '8', ro: 'Anxietatea nu mă definește', en: 'Anxiety doesn\'t define me' },
  { id: '9', ro: 'Merit să fiu fericit și liniștit', en: 'I deserve to be happy and peaceful' },
  { id: '10', ro: 'Cu fiecare respirație, mă relaxez', en: 'With every breath, I relax' },
  { id: '11', ro: 'Sunt înconjurat de dragoste și sprijin', en: 'I am surrounded by love and support' },
  { id: '12', ro: 'Totul va fi bine', en: 'Everything will be okay' }
]

export function getMantraText(mantra: Mantra, lang?: Language): string {
  const language = lang || getDeviceLanguage()
  return mantra[language]
}

export function getRandomMantra(): Mantra {
  return defaultMantras[Math.floor(Math.random() * defaultMantras.length)]
}
