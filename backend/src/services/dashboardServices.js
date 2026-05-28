import { getPersonalDashboardStats, getLatestInventoryItems, getBusinessDashboardStats, getBusinessDashboardProducts, getBusinessDashboardOrders } from '../models/dashboardModel.js';
import { getTopRecommendation,} from './recommendationServices.js';

const buildWarningMessage = (items) => {
  const highItems = items.filter((item) => item.status === 'high');
  const warningItems = items.filter((item) => item.status === 'warning');

  if (highItems.length > 0) {
    return {
      type: 'high',
      title: `${highItems.length} bahan makanan hampir kadaluwarsa`,
      message: `${highItems.map((i) => i.food_name).join(', ')} perlu segera digunakan.`,
    };
  }

  if (warningItems.length > 0) {
    return {
      type: 'warning',
      title: `${warningItems.length} bahan makanan mendekati kadaluwarsa`,
      message: `${warningItems.map((i) => i.food_name).join(', ')} sebaiknya segera digunakan.`,
    };
  }

  return {
    type: 'safe',
    title: 'Tidak ada bahan makanan prioritas',
    message: 'Semua bahan makanan masih aman.',
  };
};

export const getPersonalDashboardService = async (userId) => {
  const stats = await getPersonalDashboardStats(userId);
  const latestInventories = await getLatestInventoryItems(userId);
  const topRecommendation = await getTopRecommendation(userId);

  return {
    summary: {
      total_inventory: stats.total_inventory,
      total_high: stats.total_high,
      total_warning: stats.total_warning,
    },

    warning: buildWarningMessage(latestInventories),

    latest_inventories: latestInventories,

    top_recommendation: topRecommendation,
  };
};

export const getBusinessDashboardService = async (sellerId) => {
  const stats = await getBusinessDashboardStats(sellerId);
  const products = await getBusinessDashboardProducts(sellerId);
  const orders = await getBusinessDashboardOrders(sellerId);

  return {
    summary: {
      total_products: stats.total_products,
      total_orders: stats.total_orders,
    },

    products,
    orders,
  };
};