/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.addColumns('users', {
    otp_code: {
      type: 'varchar(10)',
    },
    otp_expired_at: {
      type: 'timestamp',
    },
    is_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    // Digunakan untuk membedakan akun OAuth (Google) yang tidak punya
    // password lokal dan dibuat otomatis oleh backend.
    auth_provider: {
      type: 'varchar(20)',
      notNull: true,
      default: 'local',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropColumns('users', ['otp_code', 'otp_expired_at', 'is_verified', 'auth_provider']);
};
