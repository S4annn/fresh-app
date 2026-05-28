/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('subscriptions', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      unique: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    plan: {
      type: 'varchar(20)',
      notNull: true,
      default: 'free',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'active',
    },
    billing_cycle: {
      type: 'varchar(20)',
      default: 'monthly',
    },
    amount_paid: {
      type: 'numeric(12,2)',
      default: 0,
    },
    last_payment_method: {
      type: 'varchar(50)',
    },
    last_payment_reference: {
      type: 'varchar(100)',
    },
    started_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    ends_at: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  })

  pgm.createIndex('subscriptions', 'user_id')
  pgm.createIndex('subscriptions', 'plan')

  // Audit table for payment history (useful when switching to real gateway).
  pgm.createTable('subscription_payments', {
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
    plan: {
      type: 'varchar(20)',
      notNull: true,
    },
    billing_cycle: {
      type: 'varchar(20)',
      notNull: true,
    },
    amount: {
      type: 'numeric(12,2)',
      notNull: true,
    },
    payment_method: {
      type: 'varchar(50)',
    },
    payment_reference: {
      type: 'varchar(100)',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'success',
    },
    is_simulation: {
      type: 'boolean',
      default: true,
    },
    paid_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  })

  pgm.createIndex('subscription_payments', 'user_id')
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('subscription_payments')
  pgm.dropTable('subscriptions')
}
