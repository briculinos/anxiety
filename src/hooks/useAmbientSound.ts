import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'

export type SoundType = 'waves' | 'rain' | 'forest' | 'music' | null

// Free ambient sound URLs (royalty-free sources)
const soundUrls: Record<Exclude<SoundType, null>, string> = {
  waves: 'https://cdn.pixabay.com/audio/2022/05/27/audio_8bfb3dfc09.mp3',
  rain: 'https://cdn.pixabay.com/audio/2022/10/30/audio_26b9509cda.mp3',
  forest: 'https://cdn.pixabay.com/audio/2022/02/23/audio_2a834f3f98.mp3',
  music: 'https://cdn.pixabay.com/audio/2024/02/14/audio_c4ef7d2b9a.mp3'
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
