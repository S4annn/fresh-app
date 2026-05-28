import { Component } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import './errorboundary.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined' && window.console) {
      window.console.error('App error boundary caught:', error, info)
    }
  }

  handleReload = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="fresh-error-boundary" role="alert">
        <div className="fresh-error-boundary__icon">
          <AlertTriangle size={36} strokeWidth={1.8} />
        </div>
        <h1>Terjadi kesalahan tak terduga</h1>
        <p>
          Tenang, halaman ini bisa dimuat ulang. Tim kami akan menerima
          laporan ini secara otomatis.
        </p>
        <button type="button" onClick={this.handleReload}>
          <RefreshCcw size={18} strokeWidth={2.2} />
          Muat Ulang Beranda
        </button>
      </div>
    )
  }
}
