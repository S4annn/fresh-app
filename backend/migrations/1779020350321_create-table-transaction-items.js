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
  pgm.createTable('transaction_items', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    transaction_id: {
      type: 'integer',
      notNull: true,
      references: 'transactions(id)',
      onDelete: 'CASCADE',
    },

    product_id: {
      type: 'integer',
      notNull: true,
      references: 'products(id)',
      onDelete: 'CASCADE',
    },

    quantity: {
      type: 'integer',
      notNull: true,
    },

    price: {
      type: 'numeric(10,2)',
      notNull: true,
    },

    subtotal: {
      type: 'numeric(10,2)',
      notNull: true,
    },

    created_at: {
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
  pgm.dropTable('transaction_items');
};