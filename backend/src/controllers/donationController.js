import { addDonation, getDonations, changeDonationStatus, removeDonation } from '../services/donationServices.js';

export const create = async (req, res, next) => {
  try {
    const data =
      await addDonation(
        req.user.id,
        req.body
      );

    res.status(201).json({
      status: 'success',
      message: 'Donasi berhasil dibuat',
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const data =
      await getDonations(
        req.user.id
      );

    res.json({
      status: 'success',
      total: data.length,
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const data =
      await changeDonationStatus(
        req.params.id,
        req.user.id,
        req.body.status
      );

    res.json({
      status: 'success',
      message: 'Status donasi berhasil diperbarui',
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await removeDonation(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      message: 'Donasi berhasil dihapus',
    });

  } catch (err) {
    next(err);
  }
};