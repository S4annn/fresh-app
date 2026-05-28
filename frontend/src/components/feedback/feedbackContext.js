import { createContext, useContext } from 'react'

export const FeedbackContext = createContext(null)

let externalApi = null

export const feedback = {
  toast(message, options) { externalApi?.toast(message, options) },
  success(message, options) { externalApi?.toast(message, { ...options, type: 'success' }) },
  error(message, options) { externalApi?.toast(message, { ...options, type: 'error' }) },
  info(message, options) { externalApi?.toast(message, { ...options, type: 'info' }) },
  warning(message, options) { externalApi?.toast(message, { ...options, type: 'warning' }) },
  confirm(options) {
    return externalApi ? externalApi.confirm(options) : Promise.resolve(false)
  },
}

export function setExternalFeedbackApi(api) {
  externalApi = api
}

export function clearExternalFeedbackApi() {
  externalApi = null
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) return feedback
  return context
}
