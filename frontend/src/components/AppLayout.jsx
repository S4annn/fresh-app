import { useState } from 'react'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'
import '../styles/layout.css'

export default function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="app-sidebar__overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        />
      )}

      <main className="app-main">
        <AppHeader
          title={title}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <section className="app-content">
          {children}
        </section>
      </main>
    </div>
  )
}