import { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { useAppStore } from '../../stores/appStore'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const flowState = useAppStore(state => state.flowState)
  const showNav = flowState === 'idle' || flowState === 'complete'

  return (
    <div
      className="min-h-screen text-slate-800"
      style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <main className={`${showNav ? 'pb-24' : ''}`}>
        {children}
      </main>
      <Navigation />
    </div>
  )
}
