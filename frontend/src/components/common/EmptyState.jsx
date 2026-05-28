import { PackageOpen } from 'lucide-react'
import './emptystate.css'

export default function EmptyState({
  icon: IconComponent = PackageOpen,
  title = 'Belum ada data',
  description,
  action,
  variant = 'default',
}) {
  const Icon = IconComponent
  return (
    <div className={`fresh-empty fresh-empty--${variant}`} role="status">
      <div className="fresh-empty__icon" aria-hidden="true">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h3 className="fresh-empty__title">{title}</h3>
      {description && <p className="fresh-empty__desc">{description}</p>}
      {action && <div className="fresh-empty__action">{action}</div>}
    </div>
  )
}
