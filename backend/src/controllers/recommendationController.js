import { getInventoryRecommendations } from '../services/recommendationServices.js';

export const getAllRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'User belum terautentikasi',
      });
    }

    const data = await getInventoryRecommendations(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Rekomendasi AI berhasil diambil',
      data,
    });
  } catch (err) {
    next(err);
  }
};