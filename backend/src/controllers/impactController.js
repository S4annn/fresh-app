import {
  getPersonalImpactService,
  getBusinessImpactService,
} from '../services/impactServices.js'

export const getPersonalImpact = async (req, res, next) => {
  try {
    const data = await getPersonalImpactService(req.user.id)
    return res.status(200).json({
      status: 'success',
      message: 'Sustainability impact pribadi berhasil diambil',
      data,
    })
  } catch (error) {
    next(error)
  }
}

export const getBusinessImpact = async (req, res, next) => {
  try {
    const data = await getBusinessImpactService(req.user.id)
    return res.status(200).json({
      status: 'success',
      message: 'Sustainability impact bisnis berhasil diambil',
      data,
    })
  } catch (error) {
    next(error)
  }
}
