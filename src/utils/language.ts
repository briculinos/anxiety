// Language detection and encouragement messages

export type Language = 'ro' | 'en'

export function getDeviceLanguage(): Language {
  const lang = navigator.language.toLowerCase()
  return lang.startsWith('ro') ? 'ro' : 'en'
}

// Get a random item from an array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const encouragements = {
  ro: {
    phaseComplete: ['Foarte bine!', 'Perfect!', 'Așa da!', 'Excelent!'],
    cycleComplete: ['Bravo!', 'Continuă așa!', 'Superb!', 'Ești grozav!'],
    exerciseComplete: ['Ai reușit!', 'Felicitări!', 'Minunat!', 'Ești puternic!'],
    keepGoing: ['Mai poți!', 'Nu te opri!', 'Ești pe drumul cel bun!', 'Continuă!'],
    almostDone: ['Aproape gata!', 'Ultimul efort!', 'Mai puțin!'],
    starting: ['Hai să începem!', 'Ești pregătit!', 'Poți face asta!']
  },
  en: {
    phaseComplete: ['Great!', 'Perfect!', 'Well done!', 'Excellent!'],
    cycleComplete: ['Bravo!', 'Keep it up!', 'Superb!', 'You\'re amazing!'],
    exerciseComplete: ['You did it!', 'Congratulations!', 'Amazing!', 'You\'re strong!'],
    keepGoing: ['You can do it!', 'Keep going!', 'You\'re on track!', 'Continue!'],
    almostDone: ['Almost there!', 'Final stretch!', 'Just a bit more!'],
    starting: ['Let\'s begin!', 'You\'re ready!', 'You got this!']
  }
}

export type EncouragementType = keyof typeof encouragements.en

export function getEncouragement(type: EncouragementType, lang?: Language): string {
  const language = lang || getDeviceLanguage()
  return randomItem(encouragements[language][type])
}

// Get all encouragement types for a specific message
export function getAllEncouragements(type: EncouragementType, lang?: Language): string[] {
  const language = lang || getDeviceLanguage()
  return encouragements[language][type]
}
