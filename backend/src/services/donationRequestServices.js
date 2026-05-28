import { createDonationRequestModel, getDonationRequestsModel, getRequestsByRequester, updateDonationRequestStatusModel, getDonationRequestById } from '../models/donationRequestModel.js'
import { getDonationById, updateDonationRemainingQuantity } from '../models/donationModel.js'
import { createNotification } from '../models/notificationModel.js'
import pool from '../config/db.js'

export const createDonationRequest = async (donationId, requesterId, data) => {
  const donation = await getDonationById(donationId)

  if (!donation) {
    const error = new Error('Donasi tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  if (Number(donation.donor_id) === Number(requesterId)) {
    const error = new Error('Tidak bisa request donasi sendiri')
    error.statusCode = 400
    throw error
  }

  if (donation.status !== 'available') {
    const error = new Error('Donasi tidak tersedia')
    error.statusCode = 400
    throw error
  }

  if (Number(data.quantity) > Number(donation.remaining_quantity)) {
    const error = new Error('Jumlah request melebihi stok donasi')
    error.statusCode = 400
    throw error
  }

  const request = await createDonationRequestModel({
    donation_id: donationId,
    requester_id: requesterId,
    quantity: data.quantity,
    pickup_time: data.pickup_time,
    notes: data.notes,
  })

  await createNotification({
    user_id: donation.donor_id,
    title: 'Request Donasi Baru',
    message: `Ada request baru untuk donasi ${donation.food_name}`,
  })

  return request
}

export const getDonationRequests = async (donationId, userId) => {
  const donation = await getDonationById(donationId)

  if (!donation) {
    const error = new Error('Donasi tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  if (Number(donation.donor_id) !== Number(userId)) {
    const error = new Error('Tidak punya akses melihat request ini')
    error.statusCode = 403
    throw error
  }

  return await getDonationRequestsModel(donationId)
}

export const getMyDonationRequests = async (userId) => {
  return await getRequestsByRequester(userId)
}

export const changeDonationRequestStatus = async (requestId, donorId, status) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Lock the request row
    const requestResult = await client.query(
      `SELECT * FROM donation_requests WHERE id = $1 FOR UPDATE`,
      [requestId]
    )

    const request = requestResult.rows[0]

    if (!request) {
      const error = new Error('Request tidak ditemukan')
      error.statusCode = 404
      throw error
    }

    if (request.status !== 'pending') {
      const error = new Error('Request sudah diproses')
      error.statusCode = 400
      throw error
    }

    // Lock the donation row
    const donationResult = await client.query(
      `SELECT * FROM donations WHERE id = $1 FOR UPDATE`,
      [request.donation_id]
    )

    const donation = donationResult.rows[0]

    if (!donation) {
      const error = new Error('Donasi tidak ditemukan')
      error.statusCode = 404
      throw error
    }

    if (Number(donation.user_id) !== Number(donorId)) {
      const error = new Error('Tidak punya akses mengubah request ini')
      error.statusCode = 403
      throw error
    }

    if (status === 'approved') {
      const remaining =
        Number(donation.remaining_quantity) -
        Number(request.quantity)

      if (remaining < 0) {
        const error = new Error('Sisa donasi tidak mencukupi')
        error.statusCode = 400
        throw error
      }

      const newStatus = remaining <= 0 ? 'completed' : donation.status

      await client.query(
        `UPDATE donations SET remaining_quantity = $1, status = $2 WHERE id = $3`,
        [remaining, newStatus, donation.id]
      )
    }

    // Update request status
    const updatedResult = await client.query(
      `UPDATE donation_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, requestId]
    )

    await client.query('COMMIT')

    const updatedRequest = updatedResult.rows[0]

    // Send notification (outside transaction - non-critical)
    await createNotification({
      user_id: request.requester_id,
      title:
        status === 'approved'
          ? 'Request Donasi Diterima'
          : 'Request Donasi Ditolak',
      message:
        status === 'approved'
          ? `Request kamu untuk donasi ${donation.food_name} diterima`
          : `Request kamu untuk donasi ${donation.food_name} ditolak`,
    })

    return updatedRequest
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
