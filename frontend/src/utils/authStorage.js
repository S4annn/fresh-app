/**
 * Centralized helpers for reading/writing auth data from localStorage.
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function normalizeRole(role) {
  const value = String(role || '').toLowerCase().trim()
  if (value === 'bisnis' || value === 'business' || value === 'seller') {
    return 'bisnis'
  }
  if (value === 'pribadi' || value === 'personal' || value === 'user') {
    return 'pribadi'
  }
  return 'unknown'
}

export function isBusinessRole(role) {
  return normalizeRole(role) === 'bisnis'
}

export function isPersonalRole(role) {
  return normalizeRole(role) === 'pribadi'
}
