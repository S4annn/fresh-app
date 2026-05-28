/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    name: {
      type: 'varchar(100)',
      notNull: true,
    },

    email: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },

    password: {
      type: 'text',
      notNull: true,
    },

    role: {
      type: 'varchar(20)',
      notNull: true,
    },

    address: {
      type: 'text',
    },

    latitude: {
      type: 'numeric(10,8)',
    },

    longitude: {
      type: 'numeric(11,8)',
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    image_url: {
      type: 'text',
      default: 'default-profile.png',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('users');
};