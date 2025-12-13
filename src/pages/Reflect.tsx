import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '../components/common'
import { getRecentEpisodes, getThoughtRecords, getPendingWorries, markWorryAddressed } from '../db'
import type { Episode, ThoughtRecord, PostponedWorry } from '../types'

export function Reflect() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>([])
  const [pendingWorries, setPendingWorries] = useState<PostponedWorry[]>([])
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [episodesData, thoughtsData, worriesData] = await Promise.all([
      getRecentEpisodes(7),
      getThoughtRecords(5),
      getPendingWorries()
    ])
    setEpisodes(episodesData)
    setThoughtRecords(thoughtsData)
    setPendingWorries(worriesData)
  }

  const handleAddressWorry = async (id: string) => {
    await markWorryAddressed(id)
    loadData()
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) {
      return `Today at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-green-500'
    if (intensity <= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900 mb-2">Reflect</h1>
        <p className="text-warm-900/60 text-sm">
          Look back at your experiences and insights
        </p>
      </div>

      {/* Pending Worries */}
      {pendingWorries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-warm-900/60 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Scheduled Worries
          </h2>
          <div className="space-y-3">
            {pendingWorries.map((worry) => (
              <Card key={worry.id} className="bg-warm-300/30 border-warm-400/50">
                <p className="text-warm-900 mb-2">{worry.worry}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-warm-700">
                    Scheduled for {formatDate(worry.scheduledFor)}
                  </span>
                  <button
                    onClick={() => handleAddressWorry(worry.id)}
                    className="text-warm-500 hover:text-warm-600"
                  >
                    Mark as addressed
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Episodes */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-warm-900/60 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Recent Episodes
        </h2>

        {episodes.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-warm-900/60">No episodes recorded yet</p>
            <p className="text-warm-900/40 text-sm mt-1">
              They'll appear here when you use the app during anxious moments
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {episodes.map((episode) => (
              <motion.div key={episode.id} layout>
                <Card
                  variant="interactive"
                  onClick={() => setExpandedEpisode(
                    expandedEpisode === episode.id ? null : episode.id
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getIntensityColor(episode.intensity)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-warm-900">
                          Intensity: {episode.intensity}/10
                        </span>
                        {episode.durationMinutes && (
                          <span className="text-sm text-warm-900/60">
                            ({episode.durationMinutes} min)
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-warm-900/60">
                        {formatDate(episode.timestamp)}
                      </span>
                    </div>
                    {expandedEpisode === episode.id ? (
                      <ChevronUp className="w-5 h-5 text-warm-900/40" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-warm-900/40" />
                    )}
                  </div>

                  {expandedEpisode === episode.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-warm-200 space-y-3"
                    >
                      {episode.triggers.length > 0 && (
                        <div>
                          <label className="text-xs text-warm-900/60 block mb-1">Triggers</label>
                          <div className="flex flex-wrap gap-1">
                            {episode.triggers.map((trigger) => (
                              <span
                                key={trigger}
                                className="px-2 py-1 bg-warm-200 rounded text-xs text-warm-900"
                              >
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {episode.symptoms.length > 0 && (
                        <div>
                          <label className="text-xs text-warm-900/60 block mb-1">Symptoms</label>
                          <div className="flex flex-wrap gap-1">
                            {episode.symptoms.map((symptom) => (
                              <span
                                key={symptom}
                                className="px-2 py-1 bg-warm-200 rounded text-xs text-warm-900"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {episode.toolsUsed.length > 0 && (
                        <div>
                          <label className="text-xs text-warm-900/60 block mb-1">Tools used</label>
                          <div className="flex flex-wrap gap-1">
                            {episode.toolsUsed.map((tool) => (
                              <span
                                key={tool}
                                className="px-2 py-1 bg-warm-500/20 rounded text-xs text-warm-600"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Thought Records */}
      {thoughtRecords.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-warm-900/60 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Thought Records
          </h2>
          <div className="space-y-3">
            {thoughtRecords.map((record) => (
              <Card key={record.id}>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-warm-900/60">Situation</label>
                    <p className="text-warm-900 text-sm">{record.situation}</p>
                  </div>
                  <div>
                    <label className="text-xs text-warm-900/60">Thought</label>
                    <p className="text-warm-900 text-sm">{record.automaticThought}</p>
                  </div>
                  {record.balancedThought && (
                    <div className="pt-2 border-t border-warm-200">
                      <label className="text-xs text-warm-500">Reframe</label>
                      <p className="text-warm-700 text-sm">{record.balancedThought}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 text-xs text-warm-900/40">
                    <span>{record.emotion} ({record.emotionIntensity}/10)</span>
                    <span>{formatDate(record.timestamp)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
