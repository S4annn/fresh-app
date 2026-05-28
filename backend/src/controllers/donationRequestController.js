import { createDonationRequest, getDonationRequests, getMyDonationRequests, changeDonationRequestStatus } from '../services/donationRequestServices.js'

export const createRequest = async (req, res, next) => {
  try {
    const request = await createDonationRequest(
      Number(req.params.id),
      req.user.id,
      req.body
    )

    res.status(201).json({
      status: 'success',
      message: 'Request donasi berhasil dibuat',
      data: request,
    })
  } catch (error) {
    next(error)
  }
}

export const getRequests = async (req, res, next) => {
  try {
    const requests = await getDonationRequests(
      Number(req.params.id),
      req.user.id
    )

    res.json({
      status: 'success',
      data: requests,
    })
  } catch (error) {
    next(error)
  }
}

export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await getMyDonationRequests(req.user.id)

    res.json({
      status: 'success',
      data: requests,
    })
  } catch (error) {
    next(error)
  }
}

export const updateRequestStatus = async (req, res, next) => {
  try {
    const request = await changeDonationRequestStatus(
      Number(req.params.id),
      req.user.id,
      req.body.status
    )

    res.json({
      status: 'success',
      message: 'Status request berhasil diperbarui',
      data: request,
    })
  } catch (error) {
    next(error)
  }
}