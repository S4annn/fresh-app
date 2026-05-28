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
  pgm.createTable('inventories_out', {
    id: {
      type: 'serial',
      primaryKey: true,
    },

    inventory_id: {
      type: 'integer',
      notNull: true,
      references: 'inventories(id)',
      onDelete: 'CASCADE',
    },

    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },

    quantity: {
      type: 'numeric(10,2)',
      notNull: true,
    },

    out_type: {
      type: 'varchar(30)',
    },

    notes: {
      type: 'text',
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
  pgm.dropTable('inventories_out');
};