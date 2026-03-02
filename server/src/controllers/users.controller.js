import pool from "../config/db.js";
import { sendResponse, asyncHandler } from "../utils/response.js";

/**
 * Get all users with pagination
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;

  const usersQuery = `
    SELECT id, email, full_name, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) FROM users`;

  const [usersResult, countResult] = await Promise.all([
    pool.query(usersQuery, [limit, offset]),
    pool.query(countQuery),
  ]);

  return sendResponse(res, 200, {
    data: usersResult.rows,
    meta: {
      total: parseInt(countResult.rows[0].count, 10),
      page: Number(page),
      limit: Number(limit),
    },
  });
});

/**
 * Create user + wallet (with currency)
 */
export const createUser = asyncHandler(async (req, res) => {
  const { email, full_name, currency, initial_balance = 0 } = req.body;

  if (!email || !full_name) {
    const error = new Error("Email and full name are required");
    error.statusCode = 400;
    throw error;
  }

  if (!currency || currency.length !== 3) {
    const error = new Error("Currency must be a 3-letter ISO code");
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      "INSERT INTO users (email, full_name) VALUES ($1, $2) RETURNING id",
      [email, full_name],
    );

    const userId = userResult.rows[0].id;

    await client.query(
      "INSERT INTO wallets (user_id, currency, balance) VALUES ($1, $2, $3)",
      [userId, currency.toUpperCase(), initial_balance],
    );

    await client.query("COMMIT");

    return sendResponse(res, 201, {
      message: "User and wallet created successfully",
      data: { userId, currency: currency.toUpperCase() },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err; // asyncHandler catches it
  } finally {
    client.release();
  }
});

/**
 * Get Wallet(s) by User
 */
export const getWalletByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { currency } = req.query;

  let query = `
    SELECT id, currency, balance
    FROM wallets
    WHERE user_id = $1
  `;

  const values = [userId];

  if (currency) {
    query += " AND currency = $2";
    values.push(currency.toUpperCase());
  }

  const result = await pool.query(query, values);

  if (!result.rows.length) {
    const error = new Error("Wallet not found");
    error.statusCode = 404;
    throw error;
  }

  return sendResponse(res, 200, {
    data: result.rows,
  });
});
