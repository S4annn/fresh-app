import { useEffect } from 'react'
import { X } from 'lucide-react'
import './modal.css'

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return undefined
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fresh-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="fresh-modal__backdrop"
        onClick={() => closeOnBackdrop && onClose?.()}
      />
      <div className={`fresh-modal__panel fresh-modal__panel--${size}`}>
        {(title || description) && (
          <header className="fresh-modal__header">
            <div className="fresh-modal__heading">
              {title && <h2>{title}</h2>}
              {description && <p>{description}</p>}
            </div>
            <button
              type="button"
              className="fresh-modal__close"
              aria-label="Tutup"
              onClick={onClose}
            >
              <X size={20} strokeWidth={2.2} />
            </button>
          </header>
        )}
        <div className="fresh-modal__body">{children}</div>
        {footer && <div className="fresh-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
