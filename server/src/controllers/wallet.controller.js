import pool from "../config/db.js";
import { sendResponse, asyncHandler } from "../utils/response.js";

/**
 * Transfer Funds
 */
export const transferFunds = asyncHandler(async (req, res) => {
  const { from_wallet_id, to_wallet_id, amount, reference_id } = req.body;

  if (!from_wallet_id || !to_wallet_id || !amount) {
    const error = new Error("Missing required fields");
    error.statusCode = 400;
    throw error;
  }

  await pool.query("SELECT transfer_funds($1, $2, $3, $4)", [
    from_wallet_id,
    to_wallet_id,
    amount,
    reference_id || null,
  ]);

  return sendResponse(res, 200, {
    message: "Transfer processed successfully",
  });
});

/**
 * List Transfers
 */
export const listTransfers = asyncHandler(async (req, res) => {
  const { status, wallet_id } = req.query;

  let query = `
    SELECT t.id,
           t.currency,
           t.amount,
           t.status,
           t.created_at,
           u1.full_name AS sender,
           u2.full_name AS receiver
    FROM transfers t
    JOIN wallets w1 ON w1.id = t.from_wallet_id
    JOIN wallets w2 ON w2.id = t.to_wallet_id
    JOIN users u1 ON u1.id = w1.user_id
    JOIN users u2 ON u2.id = w2.user_id
    WHERE 1=1
  `;

  const values = [];
  let index = 1;

  if (status) {
    query += ` AND t.status = $${index++}`;
    values.push(status.toUpperCase());
  }

  if (wallet_id) {
    query += ` AND (t.from_wallet_id = $${index} OR t.to_wallet_id = $${index})`;
    values.push(wallet_id);
  }

  query += " ORDER BY t.created_at DESC";

  const result = await pool.query(query, values);

  return sendResponse(res, 200, {
    data: result.rows,
    meta: { count: result.rowCount },
  });
});

/**
 * Get All Wallets
 */
export const getAllWallets = asyncHandler(async (req, res) => {
  const { currency, status, user_id, page = 1, limit = 20 } = req.query;

  const offset = (page - 1) * limit;

  let query = `
    SELECT w.id,
           w.balance,
           w.currency,
           w.created_at,
           u.id AS user_id,
           u.full_name,
           u.email
    FROM wallets w
    JOIN users u ON u.id = w.user_id
    WHERE 1=1
  `;

  const values = [];
  let index = 1;

  if (currency) {
    query += ` AND w.currency = $${index++}`;
    values.push(currency.toUpperCase());
  }

  if (status) {
    query += ` AND w.status = $${index++}`;
    values.push(status.toUpperCase());
  }

  if (user_id) {
    query += ` AND w.user_id = $${index++}`;
    values.push(user_id);
  }

  query += `
    ORDER BY w.created_at DESC
    LIMIT $${index++}
    OFFSET $${index}
  `;

  values.push(limit, offset);

  const result = await pool.query(query, values);

  return sendResponse(res, 200, {
    data: result.rows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      count: result.rowCount,
    },
  });
});
