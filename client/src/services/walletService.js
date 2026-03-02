const API_URL = "/api/wallets";

export const transferFunds = async ({
  from_wallet_id,
  to_wallet_id,
  amount,
  reference_id,
}) => {
  const response = await fetch(`${API_URL}/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_wallet_id,
      to_wallet_id,
      amount: Number(amount),
      reference_id,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Transfer failed");
  }

  return data;
};

export const getAllWallets = async () => {
  const response = await fetch(`${API_URL}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch wallets");
  }

  return data;
};
