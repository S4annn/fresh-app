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
  pgm.createTable('products', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    seller_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },

    product_name: {
      type: 'varchar(150)',
      notNull: true,
    },

    category: {
      type: 'varchar(50)',
    },

    description: {
      type: 'text',
    },

    expiry_date: {
      type: 'date',
    },

    price: {
      type: 'numeric(10,2)',
      notNull: true,
    },

    stock: {
      type: 'integer',
      notNull: true,
      default: 0,
    },

    status: {
      type: 'varchar(30)',
      default: 'tersedia',
    },

    image_url: {
      type: 'text',
    },

    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    updated_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },

    unit: {
      type: 'varchar(50)',
      notNull: true,
      default: 'pcs',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('products');
};