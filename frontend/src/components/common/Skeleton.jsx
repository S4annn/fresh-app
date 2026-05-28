export default function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
  className = '',
}) {
  return (
    <span
      className={`fresh-skeleton ${className}`}
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
