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
  { path: '/profile', label: 'Profil', icon: UserRound },
]

export default function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__logo">
        <img src={logo} alt="" />
        <div className="app-sidebar__brand">
          <h1>F.R.E.S.H</h1>
          <p>Pangan Efisien & Penanganan Cerdas</p>
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
