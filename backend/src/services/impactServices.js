import { getPersonalImpactStats, getBusinessImpactStats } from '../models/impactModel.js'

// IPCC: 1 kg of edible food waste ≈ 2.5 kg CO₂e (methodology from FAO).
const CO2_KG_PER_FOOD_KG = 2.5
// Average water footprint of mixed food waste (FAO): ~1.0 m³ per kg.
const WATER_LITERS_PER_FOOD_KG = 1000

const toNumber = (value) => Number(value || 0)

const buildEnvironmentalImpact = (savedKg) => {
  const kg = toNumber(savedKg)
  return {
    co2_avoided_kg: Math.round(kg * CO2_KG_PER_FOOD_KG * 100) / 100,
    water_saved_liters: Math.round(kg * WATER_LITERS_PER_FOOD_KG),
    meals_equivalent: Math.round(kg / 0.4),
  }
}

export const getPersonalImpactService = async (userId) => {
  const stats = await getPersonalImpactStats(userId)
  const totalUsed = toNumber(stats.total_used)
  const totalDonated = toNumber(stats.total_donated)
  const totalSavedKg = totalUsed + totalDonated

  return {
    summary: {
      total_inventory: toNumber(stats.total_inventory),
      total_high: toNumber(stats.total_high),
      total_warning: toNumber(stats.total_warning),
      total_fresh: toNumber(stats.total_fresh),
    },
    saved: {
      used_kg: Math.round(totalUsed * 100) / 100,
      donated_kg: Math.round(totalDonated * 100) / 100,
      total_kg: Math.round(totalSavedKg * 100) / 100,
      donation_count: toNumber(stats.donation_count),
      approved_donation_requests: toNumber(stats.approved_donation_requests),
    },
    environment: buildEnvironmentalImpact(totalSavedKg),
    category_breakdown: Array.isArray(stats.category_breakdown)
      ? stats.category_breakdown
      : [],
  }
}

export const getBusinessImpactService = async (sellerId) => {
  const stats = await getBusinessImpactStats(sellerId)
  const totalUnits = toNumber(stats.total_units_sold)

  return {
    summary: {
      total_products: toNumber(stats.total_products),
      available_products: toNumber(stats.available_products),
      sold_out_products: toNumber(stats.sold_out_products),
      total_orders: toNumber(stats.total_orders),
      expiring_count: toNumber(stats.expiring_count),
    },
    revenue: {
      total_units_sold: totalUnits,
      total_revenue: toNumber(stats.total_revenue),
    },
    environment: buildEnvironmentalImpact(totalUnits),
  }
}
