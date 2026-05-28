/**
 * Helper utilities for working with subscription plans on the frontend.
 *
 * Plan data is fetched from /api/subscription/plans (single source of truth
 * lives in backend/src/config/plans.js). These helpers only deal with
 * client-side concerns: comparing tiers, formatting, and feature gating.
 */

export const PLAN_RANK = {
  free: 0,
  pro: 1,
  business: 2,
}

export function getPlanRank(planId) {
  if (!planId) return -1
  return PLAN_RANK[String(planId).toLowerCase()] ?? -1
}

/**
 * Returns true if the user's plan tier is at least the required tier.
 * @example userHasAccess('free', 'pro') === false
 * @example userHasAccess('business', 'pro') === true
 */
export function userHasAccess(userPlanId, requiredPlanId) {
  return getPlanRank(userPlanId) >= getPlanRank(requiredPlanId)
}

export function isPaidPlan(planId) {
  return getPlanRank(planId) > 0
}

export function getPlanLabel(planId) {
  const value = String(planId || 'free').toLowerCase()
  if (value === 'pro') return 'Pro'
  if (value === 'business') return 'Business'
  return 'Free'
}

const PENDING_PLAN_KEY = 'fresh:pending_plan'

/**
 * Temporarily remember which plan the user picked before logging in.
 * (Permanent subscription state lives on the server, never localStorage.)
 */
export function rememberPendingPlan({ plan, billing_cycle }) {
  try {
    localStorage.setItem(
      PENDING_PLAN_KEY,
      JSON.stringify({ plan, billing_cycle })
    )
  } catch {
    // Storage may be unavailable; ignore.
  }
}

export function consumePendingPlan() {
  try {
    const raw = localStorage.getItem(PENDING_PLAN_KEY)
    if (!raw) return null
    localStorage.removeItem(PENDING_PLAN_KEY)
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function peekPendingPlan() {
  try {
    const raw = localStorage.getItem(PENDING_PLAN_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}
