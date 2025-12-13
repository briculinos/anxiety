import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, Target, Clock, Sparkles, RefreshCw } from 'lucide-react'
import { Card, Button } from '../components/common'
import { getWeeklyStats, getRecentEpisodes } from '../db'
import { generateWeeklyInsight } from '../agents/gemini'

interface WeeklyStats {
  totalEpisodes: number
  averageIntensity: number
  topTriggers: { trigger: string; count: number }[]
  topTools: { tool: string; count: number; avgHelpfulness: number }[]
  timePatterns: { hour: number; count: number }[]
}

export function Progress() {
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [insight, setInsight] = useState<{ insight: string; experiment: string } | null>(null)
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const weeklyStats = await getWeeklyStats()
    setStats(weeklyStats)
  }

  const handleGenerateInsight = async () => {
    if (!stats) return

    setIsLoadingInsight(true)
    try {
      const episodes = await getRecentEpisodes(7)
      const result = await generateWeeklyInsight(
        episodes,
        stats.topTriggers,
        stats.topTools
      )
      setInsight(result)
    } catch (error) {
      setInsight({
        insight: 'Unable to generate insight right now. Keep tracking your episodes!',
        experiment: 'Try a new coping tool this week.'
      })
    }
    setIsLoadingInsight(false)
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am'
    if (hour === 12) return '12pm'
    if (hour < 12) return `${hour}am`
    return `${hour - 12}pm`
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Progress</h1>
        <p className="text-slate-400 text-sm">
          Your patterns from the past 7 days
        </p>
      </div>

      {!stats ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No data yet</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Use the app during anxious moments to start seeing your patterns here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalEpisodes}
              </div>
              <div className="text-sm text-slate-400">Episodes this week</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.averageIntensity}
              </div>
              <div className="text-sm text-slate-400">Avg intensity</div>
            </Card>
          </div>

          {/* Top triggers */}
          {stats.topTriggers.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="font-medium text-white">Top Triggers</h3>
              </div>
              <div className="space-y-3">
                {stats.topTriggers.map((trigger, i) => (
                  <div key={trigger.trigger} className="flex items-center gap-3">
                    <div className="w-6 text-center text-sm text-slate-400">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white">{trigger.trigger}</span>
                        <span className="text-sm text-slate-400">{trigger.count}x</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(trigger.count / stats.topTriggers[0].count) * 100}%` }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* What helped */}
          {stats.topTools.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-green-400" />
                <h3 className="font-medium text-white">What Helped</h3>
              </div>
              <div className="space-y-3">
                {stats.topTools.map((tool) => (
                  <div key={tool.tool} className="flex items-center justify-between">
                    <span className="text-white">{tool.tool}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">
                        {tool.count}x used
                      </span>
                      {tool.avgHelpfulness > 0 && (
                        <span className="text-sm text-green-400">
                          {tool.avgHelpfulness.toFixed(1)}/5
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Time patterns */}
          {stats.timePatterns.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-medium text-white">Time Patterns</h3>
              </div>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const pattern = stats.timePatterns.find(p => p.hour === hour)
                  const maxCount = Math.max(...stats.timePatterns.map(p => p.count))
                  const height = pattern ? (pattern.count / maxCount) * 100 : 5

                  return (
                    <div
                      key={hour}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-full rounded-t ${pattern ? 'bg-amber-500' : 'bg-slate-700'}`}
                        style={{ height: `${height}%` }}
                      />
                      {hour % 6 === 0 && (
                        <span className="text-xs text-slate-500">{formatHour(hour)}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Most anxiety occurs around{' '}
                <span className="text-amber-400">
                  {formatHour(stats.timePatterns[0]?.hour || 0)}
                </span>
              </p>
            </Card>
          )}

          {/* AI Insight */}
          <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-medium text-white">Weekly Insight</h3>
            </div>

            {insight ? (
              <div className="space-y-4">
                <p className="text-indigo-100">{insight.insight}</p>
                <div className="p-3 bg-indigo-800/30 rounded-xl">
                  <p className="text-sm text-indigo-300 font-medium mb-1">Try this week:</p>
                  <p className="text-white">{insight.experiment}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateInsight}
                  className="text-indigo-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate new insight
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-indigo-200 mb-4">
                  Get personalized insights based on your patterns
                </p>
                <Button
                  variant="primary"
                  onClick={handleGenerateInsight}
                  loading={isLoadingInsight}
                >
                  {isLoadingInsight ? 'Analyzing...' : 'Generate Insight'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
