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
  pgm.createTable('inventories', {
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
      type: 'varchar(100)',
      notNull: true,
    },

    quantity: {
      type: 'numeric(10,0)',
      notNull: true,
    },

    unit: {
      type: 'varchar(20)',
      default: 'pcs',
    },

    purchase_date: {
      type: 'date',
      notNull: true,
    },

    expiry_date: {
      type: 'date',
    },

    storage_location: {
      type: 'varchar(50)',
    },

    category: {
      type: 'varchar(50)',
    },

    shelf_life: {
      type: 'integer',
      notNull: true,
    },

    status: {
      type: 'varchar(30)',
      default: 'fresh',
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
  pgm.dropTable('inventories');
};