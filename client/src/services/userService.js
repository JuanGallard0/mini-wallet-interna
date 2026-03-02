const API_URL = "/api/users";

export const getUsers = async (page = 1, limit = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

export const getWalletsByUser = async (userId) => {
  const response = await fetch(`${API_URL}/${userId}/wallets`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch wallets");
  }

  return response.json();
};

export const createUser = async (payload) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create user");
  }

  return data;
};
