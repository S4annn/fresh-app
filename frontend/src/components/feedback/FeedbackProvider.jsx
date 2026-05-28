import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react'
import {
  FeedbackContext,
  setExternalFeedbackApi,
  clearExternalFeedbackApi,
} from './feedbackContext'
import './feedback.css'

const TOAST_DURATION = 3500

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

export default function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const idRef = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, options = {}) => {
      idRef.current += 1
      const id = idRef.current
      const toast = {
        id,
        message,
        type: options.type || 'success',
        title: options.title,
        duration: options.duration ?? TOAST_DURATION,
      }
      setToasts((prev) => [...prev, toast])
      if (toast.duration > 0) {
        setTimeout(() => removeToast(id), toast.duration)
      }
      return id
    },
    [removeToast]
  )

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || 'Konfirmasi',
        message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        tone: options.tone || 'primary',
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(
    (value) => {
      if (confirmState?.resolve) confirmState.resolve(value)
      setConfirmState(null)
    },
    [confirmState]
  )

  const value = useMemo(
    () => ({
      toast: pushToast,
      success: (message, opts) => pushToast(message, { ...opts, type: 'success' }),
      error: (message, opts) => pushToast(message, { ...opts, type: 'error' }),
      info: (message, opts) => pushToast(message, { ...opts, type: 'info' }),
      warning: (message, opts) => pushToast(message, { ...opts, type: 'warning' }),
      confirm,
      removeToast,
    }),
    [pushToast, confirm, removeToast]
  )

  useEffect(() => {
    setExternalFeedbackApi(value)
    return clearExternalFeedbackApi
  }, [value])

  useEffect(() => {
    if (!confirmState) return undefined
    function handleKey(e) {
      if (e.key === 'Escape') handleConfirm(false)
      if (e.key === 'Enter') handleConfirm(true)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [confirmState, handleConfirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="fresh-toast-stack" role="region" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type] || Info
          return (
            <div
              key={toast.id}
              className={`fresh-toast fresh-toast--${toast.type}`}
              role={toast.type === 'error' ? 'alert' : 'status'}
            >
              <span className="fresh-toast__icon" aria-hidden="true">
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <div className="fresh-toast__body">
                {toast.title && (
                  <strong className="fresh-toast__title">{toast.title}</strong>
                )}
                <span className="fresh-toast__message">{toast.message}</span>
              </div>
              <button
                type="button"
                className="fresh-toast__close"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>
          )
        })}
      </div>
      {confirmState && (
        <div className="fresh-confirm" role="dialog" aria-modal="true">
          <div
            className="fresh-confirm__backdrop"
            onClick={() => handleConfirm(false)}
          />
          <div className="fresh-confirm__panel" role="document">
            <div
              className={`fresh-confirm__icon fresh-confirm__icon--${confirmState.tone}`}
              aria-hidden="true"
            >
              {confirmState.tone === 'danger' ? (
                <AlertTriangle size={26} strokeWidth={2.2} />
              ) : (
                <Info size={26} strokeWidth={2.2} />
              )}
            </div>
            <h2 className="fresh-confirm__title">{confirmState.title}</h2>
            <p className="fresh-confirm__message">{confirmState.message}</p>
            <div className="fresh-confirm__actions">
              <button
                type="button"
                className="fresh-confirm__btn fresh-confirm__btn--ghost"
                onClick={() => handleConfirm(false)}
                autoFocus
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className={`fresh-confirm__btn fresh-confirm__btn--${confirmState.tone}`}
                onClick={() => handleConfirm(true)}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}
