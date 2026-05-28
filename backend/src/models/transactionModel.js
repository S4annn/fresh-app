import pool from '../config/db.js'

export const createTransactionWithItems = async (buyerId, items) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const preparedItems = []

    for (const item of items) {
      const productResult = await client.query(
        ` SELECT
            id,
            seller_id,
            price,
            stock,
            status
          FROM products
          WHERE id = $1
          FOR UPDATE
        `, [item.product_id]
      )

      const product = productResult.rows[0]

      if (!product) {
        const error = new Error('Produk tidak ditemukan')
        error.statusCode = 404
        throw error
      }

      const quantity = Number(item.quantity)
      const stock = Number(product.stock)

      if (stock < quantity) {
        const error = new Error('Stok tidak cukup')
        error.statusCode = 400
        throw error
      }

      const price = Number(product.price)
      const subtotal = quantity * price

      preparedItems.push({
        product_id: product.id,
        seller_id: product.seller_id,
        quantity,
        price,
        subtotal,
      })

      const newStock = stock - quantity
      const newStatus = newStock === 0
          ? 'habis'
          : 'tersedia'

      await client.query(
        ` UPDATE products
          SET
            stock = $1,
            status = $2,
            updated_at = NOW()
          WHERE id = $3
        `, [newStock, newStatus, product.id]
      )
    }

    const groupedBySeller = {}

    for (const item of preparedItems) {
      if (!groupedBySeller[item.seller_id]) {
        groupedBySeller[item.seller_id] = []
      }

      groupedBySeller[item.seller_id].push(item)
    }

    const transactions = []

    for (const sellerId of Object.keys(groupedBySeller)) {
      const sellerItems = groupedBySeller[sellerId]

      const totalPrice = sellerItems.reduce(
        (total, item) => total + Number(item.subtotal), 0
      )

      const transactionCode =
        `ORD-${Date.now()}-${sellerId}-${Math.floor(
          Math.random() * 10000
        )}`

      const transactionResult =
        await client.query(
          ` INSERT INTO transactions
              (buyer_id, total_price, status, created_at, updated_at, transaction_code)
            VALUES
              ($1, $2, 'pending', NOW(), NOW(), $3)
            RETURNING
              id,
              buyer_id,
              total_price,
              status,
              transaction_code,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          `, [buyerId, totalPrice, transactionCode]
        )

      const transaction = transactionResult.rows[0]

      const savedItems = []

      for (const item of sellerItems) {
        const itemResult =
          await client.query(
            ` INSERT INTO transaction_items
                (transaction_id, product_id, quantity, price, subtotal, created_at)
              VALUES($1, $2, $3, $4, $5, NOW())
              RETURNING *
            `, [transaction.id, item.product_id, item.quantity, item.price, item.subtotal]
          )

        savedItems.push({
          ...itemResult.rows[0],
          seller_id: item.seller_id,
        })
      }

      transactions.push({
        ...transaction,
        seller_id: Number(sellerId),
        items: savedItems,
      })
    }

    await client.query('COMMIT')

    return transactions
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const getBuyerTransactions = async (buyerId) => {
  const result = await pool.query(
    ` SELECT
        t.id,
        t.buyer_id,
        t.transaction_code,
        t.total_price,
        t.status,
        seller.id AS seller_id,
        seller.name AS seller_name,
        seller.address AS seller_address,
        TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM transactions t
      JOIN transaction_items ti
        ON ti.transaction_id = t.id
      JOIN products p
        ON p.id = ti.product_id
      JOIN users seller
        ON seller.id = p.seller_id
      WHERE t.buyer_id = $1
      GROUP BY
        t.id,
        seller.id,
        seller.name,
        seller.address
      ORDER BY t.created_at DESC
    `, [buyerId]
  )
  return result.rows
}

export const getSellerTransactions = async (sellerId) => {
  const result = await pool.query(
    ` SELECT
        t.id,
        t.transaction_code,
        t.status,
        buyer.name AS buyer_name,
        COUNT(ti.id)::int AS total_items,

        COALESCE(
          SUM(ti.subtotal),
          0
        ) AS total_price,

        TO_CHAR(
          t.created_at,
          'YYYY-MM-DD HH24:MI:SS'
        ) AS created_at,

        json_agg(
          json_build_object(
            'id', ti.id,
            'product_id', p.id,
            'product_name', p.product_name,
            'quantity', ti.quantity,
            'unit', p.unit,
            'price', ti.price,
            'subtotal', ti.subtotal
          )
          ORDER BY ti.id
        ) AS items

      FROM transactions t

      JOIN users buyer
        ON buyer.id = t.buyer_id

      JOIN transaction_items ti
        ON ti.transaction_id = t.id

      JOIN products p
        ON p.id = ti.product_id

      WHERE p.seller_id = $1

      GROUP BY
        t.id,
        buyer.name

      ORDER BY t.created_at DESC
    `, [sellerId]
  )
  return result.rows
}

export const getTransactionDetail = async (transactionId, userId) => {
  const transactionResult = await pool.query(
    ` SELECT
        t.*,
        buyer.name AS buyer_name,
        buyer.email AS buyer_email
      FROM transactions t
      JOIN users buyer
        ON buyer.id = t.buyer_id
      WHERE t.id = $1
        AND (
          t.buyer_id = $2
          OR EXISTS (
            SELECT 1 FROM transaction_items ti2
            JOIN products p2 ON p2.id = ti2.product_id
            WHERE ti2.transaction_id = t.id AND p2.seller_id = $2
          )
        )
    `, [transactionId, userId]
  )

  const transaction = transactionResult.rows[0]

  if (!transaction) {
    return null
  }

  const itemsResult = await pool.query(
    ` SELECT
        ti.*,
        p.product_name,
        p.seller_id,
        p.unit,
        seller.name AS seller_name,
        seller.address AS seller_address
      FROM transaction_items ti
      JOIN products p
        ON p.id = ti.product_id
      JOIN users seller
        ON seller.id = p.seller_id
      WHERE ti.transaction_id = $1
    `, [transactionId]
  )
  return {
    ...transaction,
    items: itemsResult.rows,
  }
}

export const updateTransactionStatus = async (transactionId, status) => {
  const result = await pool.query(
    ` UPDATE transactions t
      SET
        status = $1,
        updated_at = NOW()
      WHERE t.id = $2
      RETURNING
        t.id,
        t.buyer_id,
        t.transaction_code,
        t.total_price,
        t.status,
        TO_CHAR(
          t.updated_at,
          'YYYY-MM-DD HH24:MI:SS'
        ) AS updated_at
    `, [status, transactionId]
  )

  const transaction = result.rows[0]

  if (!transaction) {
    return null
  }

  const sellerResult = await pool.query(
    ` SELECT
        seller.id AS seller_id,
        seller.name AS seller_name,
        seller.address AS seller_address
      FROM transaction_items ti
      JOIN products p
        ON p.id = ti.product_id
      JOIN users seller
        ON seller.id = p.seller_id
      WHERE ti.transaction_id = $1
      LIMIT 1
    `, [transactionId]
  )

  return {
    ...transaction,
    seller_id: sellerResult.rows[0]?.seller_id || null,
    seller_name: sellerResult.rows[0]?.seller_name || null,
    seller_address: sellerResult.rows[0]?.seller_address || null,
  }
}