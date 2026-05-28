import './spinner.css'

export default function Spinner({ size = 20, label, fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="fresh-spinner-fullscreen" role="status" aria-live="polite">
        <span
          className="fresh-spinner"
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
        {label && <span className="fresh-spinner-label">{label}</span>}
      </div>
    )
  }

  return (
    <span className="fresh-spinner-inline" role="status">
      <span
        className="fresh-spinner"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label && <span className="fresh-spinner-label">{label}</span>}
    </span>
  )
}
