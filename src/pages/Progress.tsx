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
        <h1 className="text-2xl font-bold text-warm-900 mb-2">Progress</h1>
        <p className="text-warm-900/60 text-sm">
          Your patterns from the past 7 days
        </p>
      </div>

      {!stats ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-200 flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-warm-500" />
          </div>
          <h3 className="text-lg font-medium text-warm-900 mb-2">No data yet</h3>
          <p className="text-warm-900/60 text-sm max-w-xs mx-auto">
            Use the app during anxious moments to start seeing your patterns here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <div className="text-3xl font-bold text-warm-900 mb-1">
                {stats.totalEpisodes}
              </div>
              <div className="text-sm text-warm-900/60">Episodes this week</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-warm-900 mb-1">
                {stats.averageIntensity}
              </div>
              <div className="text-sm text-warm-900/60">Avg intensity</div>
            </Card>
          </div>

          {/* Top triggers */}
          {stats.topTriggers.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-warm-500" />
                <h3 className="font-medium text-warm-900">Top Triggers</h3>
              </div>
              <div className="space-y-3">
                {stats.topTriggers.map((trigger, i) => (
                  <div key={trigger.trigger} className="flex items-center gap-3">
                    <div className="w-6 text-center text-sm text-warm-900/60">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-warm-900">{trigger.trigger}</span>
                        <span className="text-sm text-warm-900/60">{trigger.count}x</span>
                      </div>
                      <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(trigger.count / stats.topTriggers[0].count) * 100}%` }}
                          className="h-full bg-warm-500"
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
                <Sparkles className="w-5 h-5 text-warm-700" />
                <h3 className="font-medium text-warm-900">What Helped</h3>
              </div>
              <div className="space-y-3">
                {stats.topTools.map((tool) => (
                  <div key={tool.tool} className="flex items-center justify-between">
                    <span className="text-warm-900">{tool.tool}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-warm-900/60">
                        {tool.count}x used
                      </span>
                      {tool.avgHelpfulness > 0 && (
                        <span className="text-sm text-warm-700">
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
                <Clock className="w-5 h-5 text-warm-400" />
                <h3 className="font-medium text-warm-900">Time Patterns</h3>
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
                        className={`w-full rounded-t ${pattern ? 'bg-warm-400' : 'bg-warm-200'}`}
                        style={{ height: `${height}%` }}
                      />
                      {hour % 6 === 0 && (
                        <span className="text-xs text-warm-900/40">{formatHour(hour)}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-warm-900/60 mt-4">
                Most anxiety occurs around{' '}
                <span className="text-warm-500">
                  {formatHour(stats.timePatterns[0]?.hour || 0)}
                </span>
              </p>
            </Card>
          )}

          {/* AI Insight */}
          <Card className="bg-gradient-to-br from-warm-200 to-warm-300 border-warm-300">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-warm-600" />
              <h3 className="font-medium text-warm-900">Weekly Insight</h3>
            </div>

            {insight ? (
              <div className="space-y-4">
                <p className="text-warm-900">{insight.insight}</p>
                <div className="p-3 bg-warm-50 rounded-xl">
                  <p className="text-sm text-warm-700 font-medium mb-1">Try this week:</p>
                  <p className="text-warm-900">{insight.experiment}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateInsight}
                  className="text-warm-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate new insight
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-warm-800 mb-4">
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
