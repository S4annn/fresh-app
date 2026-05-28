import { createDonation, getAllDonations, updateDonationStatus, deleteDonation } from '../models/donationModel.js'

export const addDonation = async (userId, data) => {
  return await createDonation(userId, data)
}

export const getDonations = async (viewerId) => {
  return await getAllDonations(viewerId)
}

export const changeDonationStatus = async (id, userId, status) => {
  const donation = await updateDonationStatus(id, userId, status)

  if (!donation) {
    const error = new Error('Donasi tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return donation
}

export const removeDonation = async (id, userId) => {
  const donation = await deleteDonation(id, userId)

  if (!donation) {
    const error = new Error('Donasi tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return donation
}