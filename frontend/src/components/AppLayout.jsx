import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'
import '../styles/layout.css'

export default function AppLayout({ children, title }) 
{

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <AppHeader title={title} />
        <section className="app-content">
          {children}
        </section>
      </main>
    </div>
  )
}