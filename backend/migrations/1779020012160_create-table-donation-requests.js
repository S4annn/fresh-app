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
  pgm.createTable('donation_requests', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    donation_id: {
      type: 'integer',
      notNull: true,
      references: 'donations(id)',
      onDelete: 'CASCADE',
    },

    requester_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },

    quantity: {
      type: 'numeric',
      notNull: true,
    },

    pickup_time: {
      type: 'timestamp',
      notNull: true,
    },

    notes: {
      type: 'text',
    },

    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    updated_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('donation_requests');
};