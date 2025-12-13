import { Home, Briefcase, Sparkles, BookOpen, BarChart2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../stores/appStore'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'toolbox', label: 'Toolbox', icon: Briefcase },
  { id: 'mantras', label: 'Mantras', icon: Sparkles },
  { id: 'reflect', label: 'Reflect', icon: BookOpen },
  { id: 'progress', label: 'Progress', icon: BarChart2 }
] as const

export function Navigation() {
  const { activeTab, setActiveTab, flowState } = useAppStore()

  // Hide navigation during active flows
  if (flowState !== 'idle' && flowState !== 'complete') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-warm-100 backdrop-blur-lg border-t border-warm-200 safe-bottom z-50">
      <div className="flex justify-around items-center px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-warm-600'
                  : 'text-warm-400/60 hover:text-warm-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-warm-600"
                  />
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
