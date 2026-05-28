import { getPersonalDashboardService, getBusinessDashboardService } from '../services/dashboardServices.js';

export const getPersonalDashboard = async (req, res, next) => {
  try {
    const data = await getPersonalDashboardService(req.user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Dashboard pribadi berhasil diambil',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinessDashboard = async (req, res, next) => {
  try {
    const data = await getBusinessDashboardService(req.user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Dashboard bisnis berhasil diambil',
      data,
    });
  } catch (error) {
    next(error);
  }
};