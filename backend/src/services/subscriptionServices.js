import {
  getSubscriptionByUserId,
  upsertSubscription,
  updateSubscriptionStatus,
  recordSubscriptionPayment,
  getPaymentHistoryByUser,
} from '../models/subscriptionModel.js'
import {
  PLANS,
  getPlanById,
  isValidBillingCycle,
  isValidPlan,
  getPlanPrice,
  getDefaultPlan,
} from '../config/plans.js'

const SIMULATED_METHODS = new Set([
  'simulation_card',
  'simulation_bank',
  'simulation_ewallet',
])

/**
 * Compute end date for a subscription period.
 * Free plan never expires (returns null).
 */
function computeEndsAt(plan, billingCycle, startedAt) {
  if (plan === 'free') return null
  const start = startedAt ? new Date(startedAt) : new Date()
  const end = new Date(start)
  if (billingCycle === 'yearly') {
    end.setFullYear(end.getFullYear() + 1)
  } else {
    end.setMonth(end.getMonth() + 1)
  }
  return end.toISOString()
}

function makeMockReference() {
  return `SIM-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`
}

/**
 * Resolve current subscription for a user. If the row doesn't exist, return a
 * synthetic Free record so the frontend always has a plan to render.
 */
export const getCurrentSubscriptionService = async (userId) => {
  const row = await getSubscriptionByUserId(userId)
  if (row) {
    const plan = getPlanById(row.plan) || getDefaultPlan()
    return {
      ...row,
      plan_details: {
        id: plan.id,
        name: plan.name,
        tagline: plan.tagline,
        monthly_price: plan.monthly_price,
        yearly_price: plan.yearly_price,
        features: plan.features,
        limits: plan.limits,
      },
      is_default: false,
    }
  }
  const defaultPlan = getDefaultPlan()
  return {
    user_id: userId,
    plan: defaultPlan.id,
    status: 'active',
    billing_cycle: 'monthly',
    amount_paid: 0,
    last_payment_method: null,
    last_payment_reference: null,
    started_at: null,
    ends_at: null,
    plan_details: {
      id: defaultPlan.id,
      name: defaultPlan.name,
      tagline: defaultPlan.tagline,
      monthly_price: defaultPlan.monthly_price,
      yearly_price: defaultPlan.yearly_price,
      features: defaultPlan.features,
      limits: defaultPlan.limits,
    },
    is_default: true,
  }
}

export const getAllPlansService = () => {
  return Object.values(PLANS)
}

/**
 * Build a checkout summary without creating any DB record yet.
 * Frontend uses this to display the checkout page; the actual subscription is
 * only persisted after `simulate-payment`.
 */
export const createCheckoutService = ({ userId, plan, billing_cycle }) => {
  if (!isValidPlan(plan)) {
    const error = new Error('Plan tidak valid.')
    error.statusCode = 400
    throw error
  }
  if (!isValidBillingCycle(billing_cycle)) {
    const error = new Error('Billing cycle tidak valid.')
    error.statusCode = 400
    throw error
  }
  if (plan === 'free') {
    const error = new Error('Plan Free tidak memerlukan checkout.')
    error.statusCode = 400
    throw error
  }

  const planMeta = getPlanById(plan)
  const amount = getPlanPrice(plan, billing_cycle)

  return {
    user_id: userId,
    plan,
    plan_name: planMeta.name,
    billing_cycle,
    amount,
    currency: planMeta.currency,
    available_methods: [
      { id: 'simulation_card',    label: 'Demo Card (Visa/Mastercard)' },
      { id: 'simulation_bank',    label: 'Demo Bank Transfer' },
      { id: 'simulation_ewallet', label: 'Demo E-Wallet' },
    ],
    is_simulation: true,
    note:
      'Checkout ini adalah simulasi. Tidak ada uang nyata yang dipotong, ' +
      'tidak ada data kartu yang dikumpulkan. Payment gateway sebenarnya ' +
      'akan menggantikan proses ini di rilis berikutnya.',
  }
}

/**
 * Persist a subscription after the simulated payment "succeeds".
 * Atomically writes to subscriptions (upsert) and subscription_payments.
 */
export const simulatePaymentService = async ({
  userId,
  plan,
  billing_cycle,
  payment_method,
}) => {
  if (!isValidPlan(plan) || plan === 'free') {
    const error = new Error('Plan tidak valid untuk simulasi pembayaran.')
    error.statusCode = 400
    throw error
  }
  if (!isValidBillingCycle(billing_cycle)) {
    const error = new Error('Billing cycle tidak valid.')
    error.statusCode = 400
    throw error
  }
  if (!SIMULATED_METHODS.has(payment_method)) {
    const error = new Error('Metode pembayaran simulasi tidak dikenali.')
    error.statusCode = 400
    throw error
  }

  const amount = getPlanPrice(plan, billing_cycle)
  const startedAt = new Date().toISOString()
  const endsAt = computeEndsAt(plan, billing_cycle, startedAt)
  const reference = makeMockReference()

  const subscription = await upsertSubscription({
    user_id: userId,
    plan,
    status: 'active',
    billing_cycle,
    amount_paid: amount,
    last_payment_method: payment_method,
    last_payment_reference: reference,
    started_at: startedAt,
    ends_at: endsAt,
  })

  await recordSubscriptionPayment({
    user_id: userId,
    plan,
    billing_cycle,
    amount,
    payment_method,
    payment_reference: reference,
    status: 'success',
    is_simulation: true,
  })

  return {
    subscription,
    payment: {
      reference,
      amount,
      billing_cycle,
      payment_method,
      paid_at: startedAt,
      is_simulation: true,
    },
  }
}

export const cancelSubscriptionService = async (userId) => {
  const current = await getSubscriptionByUserId(userId)
  if (!current || current.plan === 'free') {
    const error = new Error('Tidak ada subscription aktif untuk dibatalkan.')
    error.statusCode = 400
    throw error
  }
  // Downgrade strategy: mark current as cancelled, then create a free row.
  await updateSubscriptionStatus(userId, 'cancelled')
  return upsertSubscription({
    user_id: userId,
    plan: 'free',
    status: 'active',
    billing_cycle: 'monthly',
    amount_paid: 0,
    last_payment_method: null,
    last_payment_reference: null,
    started_at: new Date().toISOString(),
    ends_at: null,
  })
}

export const getPaymentHistoryService = (userId) => {
  return getPaymentHistoryByUser(userId, 50)
}
