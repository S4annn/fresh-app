import BusinessSidebar from './BusinessSidebar'
import AppHeader from './AppHeader'
import '../styles/layout.css'

export default function BusinessLayout({ title, children }) {
  return (
    <div className="app-layout">
      <BusinessSidebar />
      <main className="app-main">
        <AppHeader title={title} />
        <section className="app-content">
          {children}
        </section>
      </main>
    </div>
  )
}