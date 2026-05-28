export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Endpoint ${req.originalUrl} tidak ditemukan`,
  });
};
