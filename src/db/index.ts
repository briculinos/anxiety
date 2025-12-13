import Dexie, { Table } from 'dexie'
import type {
  Episode,
  UserProfile,
  SafetyEvent,
  PostponedWorry,
  ToolboxItem,
  ThoughtRecord,
  WeeklyInsight
} from '../types'

export class AnxietyDB extends Dexie {
  episodes!: Table<Episode>
  userProfile!: Table<UserProfile>
  safetyEvents!: Table<SafetyEvent>
  postponedWorries!: Table<PostponedWorry>
  toolboxItems!: Table<ToolboxItem>
  thoughtRecords!: Table<ThoughtRecord>
  weeklyInsights!: Table<WeeklyInsight>

  constructor() {
    super('AnxietyDB')

    this.version(1).stores({
      episodes: 'id, timestamp, intensity, *triggers, *toolsUsed',
      userProfile: 'id',
      safetyEvents: 'id, timestamp, type',
      postponedWorries: 'id, scheduledFor, addressed',
      toolboxItems: 'id, type, isFavorite, usageCount',
      thoughtRecords: 'id, timestamp',
      weeklyInsights: 'id, weekStart'
    })
  }
}

export const db = new AnxietyDB()

// Initialize default user profile if none exists
export async function initializeDB() {
  const profileCount = await db.userProfile.count()

  if (profileCount === 0) {
    await db.userProfile.add({
      id: 'default',
      preferredBreathingPace: 'medium',
      favoriteTools: [],
      customMantras: [],
      safeMemories: [],
      triggerCategories: [],
      emergencyContacts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
}

// Helper functions for common operations

export async function logEpisode(episode: Omit<Episode, 'id'>) {
  const id = crypto.randomUUID()
  await db.episodes.add({ ...episode, id })
  return id
}

export async function getRecentEpisodes(days: number = 7): Promise<Episode[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  return db.episodes
    .where('timestamp')
    .above(cutoff)
    .reverse()
    .sortBy('timestamp')
}

export async function getEpisodesByDateRange(start: Date, end: Date): Promise<Episode[]> {
  return db.episodes
    .where('timestamp')
    .between(start, end)
    .toArray()
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
  return db.userProfile.get('default')
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  await db.userProfile.update('default', {
    ...updates,
    updatedAt: new Date()
  })
}

export async function logSafetyEvent(event: Omit<SafetyEvent, 'id'>) {
  const id = crypto.randomUUID()
  await db.safetyEvents.add({ ...event, id })
  return id
}

export async function addPostponedWorry(worry: string, scheduledFor: Date) {
  const id = crypto.randomUUID()
  await db.postponedWorries.add({
    id,
    worry,
    createdAt: new Date(),
    scheduledFor,
    addressed: false
  })
  return id
}

export async function getPendingWorries(): Promise<PostponedWorry[]> {
  return db.postponedWorries
    .where('addressed')
    .equals(0) // Dexie uses 0/1 for boolean
    .toArray()
}

export async function markWorryAddressed(id: string) {
  await db.postponedWorries.update(id, { addressed: true })
}

export async function addToolboxItem(item: Omit<ToolboxItem, 'id' | 'usageCount' | 'lastUsed'>) {
  const id = crypto.randomUUID()
  await db.toolboxItems.add({
    ...item,
    id,
    usageCount: 0
  })
  return id
}

export async function incrementToolUsage(id: string) {
  const item = await db.toolboxItems.get(id)
  if (item) {
    await db.toolboxItems.update(id, {
      usageCount: item.usageCount + 1,
      lastUsed: new Date()
    })
  }
}

export async function getToolboxItems(): Promise<ToolboxItem[]> {
  return db.toolboxItems.toArray()
}

export async function getFavoriteTools(): Promise<ToolboxItem[]> {
  return db.toolboxItems
    .where('isFavorite')
    .equals(1)
    .toArray()
}

export async function saveThoughtRecord(record: Omit<ThoughtRecord, 'id'>) {
  const id = crypto.randomUUID()
  await db.thoughtRecords.add({ ...record, id })
  return id
}

export async function getThoughtRecords(limit: number = 10): Promise<ThoughtRecord[]> {
  return db.thoughtRecords
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray()
}

// Statistics helpers

export async function getWeeklyStats() {
  const episodes = await getRecentEpisodes(7)

  if (episodes.length === 0) {
    return null
  }

  // Calculate average intensity
  const avgIntensity = episodes.reduce((sum, ep) => sum + ep.intensity, 0) / episodes.length

  // Count triggers
  const triggerCounts: Record<string, number> = {}
  episodes.forEach(ep => {
    ep.triggers.forEach(trigger => {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1
    })
  })
  const topTriggers = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([trigger, count]) => ({ trigger, count }))

  // Count tools and their helpfulness
  const toolStats: Record<string, { count: number; totalHelpfulness: number }> = {}
  episodes.forEach(ep => {
    ep.toolsUsed.forEach(tool => {
      if (!toolStats[tool]) {
        toolStats[tool] = { count: 0, totalHelpfulness: 0 }
      }
      toolStats[tool].count++
      if (ep.helpfulRating) {
        toolStats[tool].totalHelpfulness += ep.helpfulRating
      }
    })
  })
  const topTools = Object.entries(toolStats)
    .map(([tool, stats]) => ({
      tool,
      count: stats.count,
      avgHelpfulness: stats.totalHelpfulness / stats.count || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // Time patterns (hour of day)
  const hourCounts: Record<number, number> = {}
  episodes.forEach(ep => {
    const hour = new Date(ep.timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  const timePatterns = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalEpisodes: episodes.length,
    averageIntensity: Math.round(avgIntensity * 10) / 10,
    topTriggers,
    topTools,
    timePatterns
  }
}
