import pool from '../config/db.js';

export const createProduct = async (sellerId, data) => {
  const result = await pool.query(
    ` INSERT INTO products
      (seller_id, product_name, category, description, expiry_date, price, stock, unit, status, created_at, updated_at)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, 'tersedia', NOW(), NOW())

      RETURNING
        id,
        seller_id,
        product_name,
        category,
        description,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        price,
        stock,
        unit,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `,
    [
      sellerId,
      data.product_name,
      data.category,
      data.description || null,
      data.expiry_date,
      data.price,
      data.stock,
      data.unit,
    ]
  );
  return result.rows[0];
};

export const getMarketplaceProducts = async (viewerId, filters = {}) => {
  const values = [viewerId];

  const conditions = [
    "p.status = 'tersedia'",
    'p.stock > 0',
    'p.seller_id != $1',
  ];

  if (filters.search) {
    values.push(`%${filters.search.toLowerCase()}%`);
    conditions.push(`LOWER(p.product_name) LIKE $${values.length}`);
  }

  const result = await pool.query(
    ` SELECT
        p.id,
        p.seller_id,

        seller.name AS seller_name,
        seller.address AS seller_address,
        seller.latitude AS seller_latitude,
        seller.longitude AS seller_longitude,

        p.product_name,
        p.category,
        p.description,
        TO_CHAR(p.expiry_date, 'YYYY-MM-DD') AS expiry_date,
        p.price,
        p.stock,
        p.unit,
        p.status,
        TO_CHAR(p.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,

        CASE
          WHEN seller.latitude IS NULL
            OR seller.longitude IS NULL
            OR viewer.latitude IS NULL
            OR viewer.longitude IS NULL
          THEN NULL

          ELSE ROUND(
            (
              6371 * ACOS(
                LEAST(
                  1,
                  GREATEST(
                    -1,
                    COS(RADIANS(viewer.latitude)) *
                    COS(RADIANS(seller.latitude)) *
                    COS(
                      RADIANS(seller.longitude)
                      -
                      RADIANS(viewer.longitude)
                    )
                    +
                    SIN(RADIANS(viewer.latitude)) *
                    SIN(RADIANS(seller.latitude))
                  )
                )
              )
            )::numeric,
            2
          )
        END AS distance

      FROM products p

      JOIN users seller
        ON seller.id = p.seller_id

      JOIN users viewer
        ON viewer.id = $1

      WHERE ${conditions.join(' AND ')}

      ORDER BY
        distance ASC NULLS LAST,
        p.created_at DESC
    `,
    values
  );

  return result.rows;
};

export const getProductById = async (id) => {

  const result = await pool.query(
    ` SELECT
        p.id,
        p.seller_id,

        u.name AS seller_name,

        p.product_name,
        p.category,
        p.description,
        TO_CHAR(p.expiry_date, 'YYYY-MM-DD') AS expiry_date,
        p.price,
        p.stock,
        p.unit,
        p.status,

        TO_CHAR(p.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(p.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM products p
      JOIN users u
        ON u.id = p.seller_id
      WHERE p.id = $1
    `, [id]
  );
  return result.rows[0];
};

export const getProductsBySeller = async (sellerId, filters = {}) => {
  const values = [sellerId];

  const conditions = [
    'seller_id = $1',
  ];

  if (filters.search) {
    values.push(`%${filters.search.toLowerCase()}%`);
    conditions.push(`LOWER(product_name) LIKE $${values.length}`);
  }

  const result = await pool.query(
    ` SELECT
        id,
        seller_id,
        product_name,
        category,
        description,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        price,
        stock,
        unit,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM products
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `, values
  );
  return result.rows;
};

export const updateProduct = async (id, sellerId, data) => {
  const result = await pool.query(
    ` UPDATE products
      SET
        product_name = $1,
        category = $2,
        description = $3,
        expiry_date = $4,
        price = $5,
        stock = $6,
        unit = $7,
        status = $8,
        updated_at = NOW()
      WHERE id = $9
        AND seller_id = $10
      RETURNING
        id,
        seller_id,
        product_name,
        category,
        description,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        price,
        stock,
        unit,
        status,
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
    `,
    [
      data.product_name,
      data.category || null,
      data.description || null,
      data.expiry_date || null,
      data.price,
      data.stock,
      data.unit,
      data.status,
      id,
      sellerId,
    ]
  );
  return result.rows[0];
};

export const updateProductStatus = async (id, sellerId, status) => {
  const result = await pool.query(
    ` UPDATE products
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
        AND seller_id = $3
      RETURNING
        id,
        seller_id,
        status,
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
    `, [status, id, sellerId]
  );
  return result.rows[0];
};

export const deleteProduct = async (id, sellerId) => {
  const result = await pool.query(
    ` DELETE FROM products
      WHERE id = $1
        AND seller_id = $2
      RETURNING id
    `, [id, sellerId]
  );
  return result.rows[0];
};