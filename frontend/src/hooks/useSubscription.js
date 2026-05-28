import { useCallback, useEffect, useRef, useState } from 'react'
import { getMySubscription } from '../services/subscriptionService'
import { getStoredToken } from '../utils/authStorage'

/**
 * Subscription hook — pulls the canonical plan from the server.
 *
 * IMPORTANT: this is the only place the UI should learn about a user's plan.
 * We never read plan from localStorage so it survives `clear cache` and
 * stays consistent across logins.
 */
export default function useSubscription({ enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mountedRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!getStoredToken()) {
      setData(null)
      setLoading(false)
      return null
    }
    try {
      setLoading(true)
      setError(null)
      const result = await getMySubscription()
      setData(result)
      return result
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    if (mountedRef.current) return undefined
    mountedRef.current = true
    refresh()
    return undefined
  }, [enabled, refresh])

  return {
    subscription: data,
    plan: data?.plan || 'free',
    planDetails: data?.plan_details || null,
    isActive: (data?.status || 'active') === 'active',
    isLoading: loading,
    error,
    refresh,
  }
}
