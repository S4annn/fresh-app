import { scanFoodService } from '../services/scanServices.js';

export const scanFood = async (req, res, next) => {
  try {
    const data = await scanFoodService(req.file);

    res.json({
      status: 'success',
      message: 'Prediksi berhasil',
      data,
    });
  } catch (err) {
    next(err);
  }
};
