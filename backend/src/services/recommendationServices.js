import { getPriorityInventories, getAllUserInventories } from '../models/recommendationModel.js'

const getStatusLabel = (status) => {
  if (status === 'high') return 'Risiko Tinggi'
  if (status === 'warning') return 'Warning'
  if (status === 'fresh') return 'Aman'

  return 'Aman'
}

const getFallbackRecommendation = (inventory) => {
  if (inventory.status === 'high') {
    return {
      title: `Segera gunakan ${inventory.food_name}`,
      recommendation: `${inventory.food_name} tinggal ${inventory.days_left} hari lagi. Sebaiknya segera digunakan agar tidak terbuang.`,
    }
  }

  if (inventory.status === 'warning') {
    return {
      title: `${inventory.food_name} hampir kedaluwarsa`,
      recommendation: `${inventory.food_name} masih bisa digunakan dalam beberapa hari ke depan. Prioritaskan bahan ini untuk menu harian.`,
    }
  }

  return {
    title: `Menu sehat dari ${inventory.food_name}`,
    recommendation: `${inventory.food_name} masih dalam kondisi aman dan segar untuk digunakan.`,
  }
}

const normalizeAIResponse = (result) => {
  if (Array.isArray(result)) return result
  if (Array.isArray(result?.data)) return result.data
  if (Array.isArray(result?.recommendations)) return result.recommendations
  if (Array.isArray(result?.data?.recommendations)) {
    return result.data.recommendations
  }

  return []
}

const getAIRecommendations = async (userId, inventories) => {
  if (!process.env.AI_RECOMMENDATION_URL) {
    return []
  }

  try {
    const response = await fetch(
      process.env.AI_RECOMMENDATION_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-fresh-user-id': String(userId),
        },
        body: JSON.stringify({
          user_id: userId,
          inventories,
        }),
      }
    )

    if (!response.ok) return []

    const result = await response.json()
    return normalizeAIResponse(result)
  } catch {
    return []
  }
}

function mapInventoryRecommendation(item) {
  const fallback = getFallbackRecommendation(item)

  return {
    inventory_id: item.id,
    id: item.id,
    food_name: item.food_name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    storage_location: item.storage_location,
    status: item.status,
    urgency: item.status,
    status_label: getStatusLabel(item.status),
    expiry_date: item.expiry_date,
    days_left: item.days_left,
    title: fallback.title,
    recommendation: fallback.recommendation,
    recipe: fallback.title,
    recipe_description: fallback.recommendation,
  }
}

function sortByPriority(items) {
  return [...items].sort((a, b) => {
    const priority = {
      high: 1,
      warning: 2,
      fresh: 3,
    }

    const statusA = priority[a.status] || 4
    const statusB = priority[b.status] || 4

    if (statusA !== statusB) {
      return statusA - statusB
    }

    return Number(a.days_left || 999) - Number(b.days_left || 999)
  })
}

export const getInventoryRecommendations = async (userId) => {
  const priorityInventories = await getPriorityInventories(userId)

  const allInventories = await getAllUserInventories(userId)

  const sortedInventories = sortByPriority(allInventories)

  const aiRecommendations = await getAIRecommendations(userId, sortedInventories)

  const fallbackRecommendations = sortedInventories.map(mapInventoryRecommendation)

  return {
    use_today_items:
      sortByPriority(priorityInventories).map(
        mapInventoryRecommendation
      ),

    recommendations:
      aiRecommendations.length > 0
        ? aiRecommendations.map((item) => {
            const matchedInventory =
              allInventories.find(
                (inventory) =>
                  String(inventory.food_name).toLowerCase() ===
                  String(item.food_name).toLowerCase()
              )

            return {
              ...item,
              status:
                matchedInventory?.status ||
                item.status ||
                item.urgency ||
                'fresh',
              urgency:
                matchedInventory?.status ||
                item.urgency ||
                item.status ||
                'fresh',
              status_label: getStatusLabel(
                matchedInventory?.status ||
                  item.urgency ||
                  item.status ||
                  'fresh'
              ),
            }
          })
        : fallbackRecommendations,
  }
}

export const getTopRecommendation = async (userId) => {
  const allInventories = await getAllUserInventories(userId)

  if (allInventories.length === 0) {
    return null
  }

  const sortedInventories =
    sortByPriority(allInventories)

  return mapInventoryRecommendation(
    sortedInventories[0]
  )
}