import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/userService";

const CreateUserPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [initialBalance, setInitialBalance] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createUser({
        email,
        full_name: fullName,
        currency,
        initial_balance: Number(initialBalance),
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create User & Wallet
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              type="text"
              required
              className="w-full border p-2 rounded"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Currency (3-letter ISO)
            </label>
            <input
              type="text"
              maxLength={3}
              required
              className="w-full border p-2 rounded uppercase"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Initial Balance
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border p-2 rounded"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2 bg-gray-300 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded-xl ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;
