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
  pgm.createTable('donations', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },

    food_name: {
      type: 'varchar(255)',
      notNull: true,
    },

    quantity: {
      type: 'numeric(10,2)',
      notNull: true,
    },

    unit: {
      type: 'varchar(50)',
      notNull: true,
    },

    pickup_location: {
      type: 'text',
      notNull: true,
    },

    expiry_date: {
      type: 'date',
      notNull: true,
    },

    donor_name: {
      type: 'varchar(255)',
      notNull: true,
    },

    notes: {
      type: 'text',
    },

    status: {
      type: 'varchar(50)',
      default: 'available',
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    remaining_quantity: {
      type: 'numeric',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('donations');
};