import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from './components/common'
import { Home, Toolbox, Mantras, Reflect, Progress } from './pages'
import { useAppStore } from './stores/appStore'
import { initializeDB } from './db'

function App() {
  const activeTab = useAppStore(state => state.activeTab)

  useEffect(() => {
    // Initialize database on app start
    initializeDB()
  }, [])

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home />
      case 'toolbox':
        return <Toolbox />
      case 'mantras':
        return <Mantras />
      case 'reflect':
        return <Reflect />
      case 'progress':
        return <Progress />
      default:
        return <Home />
    }
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default App
