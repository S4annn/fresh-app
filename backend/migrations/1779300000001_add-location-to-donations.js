/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Tambahkan kolom latitude dan longitude ke tabel donations
 * agar lokasi penjemputan bisa ditampilkan di peta
 */
export const up = (pgm) => {
  pgm.addColumns('donations', {
    latitude: {
      type: 'numeric(10,8)',
      notNull: false,
    },
    longitude: {
      type: 'numeric(11,8)',
      notNull: false,
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumns('donations', ['latitude', 'longitude']);
};
