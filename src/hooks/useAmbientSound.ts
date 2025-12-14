import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'

export type SoundType = 'waves' | 'rain' | 'forest' | 'music' | null

// Local ambient sound files (royalty-free from SoundJay)
const soundUrls: Record<Exclude<SoundType, null>, string> = {
  waves: '/sounds/waves.mp3',
  rain: '/sounds/rain.mp3',
  forest: '/sounds/forest.mp3',
  music: '/sounds/music.mp3'
}

export const soundLabels: Record<Exclude<SoundType, null>, { en: string; ro: string }> = {
  waves: { en: 'Ocean Waves', ro: 'Valuri' },
  rain: { en: 'Rain', ro: 'Ploaie' },
  forest: { en: 'Forest', ro: 'Pădure' },
  music: { en: 'Meditation', ro: 'Meditație' }
}

export function useAmbientSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { soundEnabled, currentSound, soundVolume, setSoundEnabled, setCurrentSound, setSoundVolume } = useAppStore()

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.loop = true
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Handle sound changes
  useEffect(() => {
    if (!audioRef.current) return

    if (soundEnabled && currentSound) {
      const url = soundUrls[currentSound]
      if (audioRef.current.src !== url) {
        audioRef.current.src = url
      }
      audioRef.current.volume = soundVolume
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked - user interaction required
        console.log('Audio autoplay blocked - user interaction required')
      })
    } else {
      audioRef.current.pause()
    }
  }, [soundEnabled, currentSound, soundVolume])

  // Update volume without restarting
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume
    }
  }, [soundVolume])

  const play = useCallback((sound: Exclude<SoundType, null>) => {
    setCurrentSound(sound)
    setSoundEnabled(true)
  }, [setCurrentSound, setSoundEnabled])

  const stop = useCallback(() => {
    setSoundEnabled(false)
  }, [setSoundEnabled])

  const toggle = useCallback(() => {
    if (soundEnabled) {
      stop()
    } else if (currentSound) {
      setSoundEnabled(true)
    }
  }, [soundEnabled, currentSound, stop, setSoundEnabled])

  return {
    isPlaying: soundEnabled && !!currentSound,
    currentSound,
    volume: soundVolume,
    play,
    stop,
    toggle,
    setVolume: setSoundVolume
  }
}
