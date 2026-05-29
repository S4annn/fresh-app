import { NavLink } from 'react-router-dom'
import {
  House,
  Package,
  ScanSearch,
  Lightbulb,
  ShoppingCart,
  ShoppingBag,
  Handshake,
  UserRound,
  X,
  BarChart3,
} from 'lucide-react'
import logo from '../assets/images/logo.png'

const MENUS = [
  { path: '/dashboard', label: 'Dashboard', icon: House },
  { path: '/inventory', label: 'Inventaris', icon: Package },
  { path: '/scanner', label: 'Pemindai AI', icon: ScanSearch },
  { path: '/rekomendasi', label: 'Rekomendasi', icon: Lightbulb },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
  { path: '/pesanan', label: 'Pesanan', icon: ShoppingBag },
  { path: '/donasi', label: 'Donasi', icon: Handshake },
  { path: '/analytics', label: 'Analitik', icon: BarChart3 },
  { path: '/profile', label: 'Profil', icon: UserRound },
]

export default function AppSidebar({ isOpen = false, onClose }) {
  return (
    <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="app-sidebar__close"
        onClick={onClose}
        aria-label="Tutup menu"
      >
        <X size={20} />
      </button>

      <div className="app-sidebar__logo">
        <img src={logo} alt="" />

        <div className="app-sidebar__brand">
          <h1>F.R.E.S.H</h1>
          <p>Food Resource & Smart Handling</p>
        </div>
      </div>

      <span className="app-sidebar__menu-label">Menu Utama</span>

      <nav className="app-sidebar__menu" aria-label="Navigasi utama">
        {MENUS.map((menu) => {
          const Icon = menu.icon

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'app-sidebar__item active'
                  : 'app-sidebar__item'
              }
            >
              <Icon size={20} strokeWidth={2.2} />
              <span>{menu.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="app-sidebar__footer">
        © {new Date().getFullYear()} F.R.E.S.H
      </div>
    </aside>
  )
}