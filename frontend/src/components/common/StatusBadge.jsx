import './statusbadge.css'

export default function StatusBadge({
  variant = 'neutral',
  icon: Icon,
  children,
  size = 'md',
}) {
  return (
    <span className={`fresh-badge fresh-badge--${variant} fresh-badge--${size}`}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2.2} />}
      <span>{children}</span>
    </span>
  )
}
