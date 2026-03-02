import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllWallets, transferFunds } from "../services/walletService";
import { getWalletsByUser } from "../services/userService";

const UserWalletsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [wallets, setWallets] = useState([]);
  const [allWallets, setAllWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [destinationWalletId, setDestinationWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch user wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const data = await getWalletsByUser(id);
        setWallets(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [id]);

  // Fetch all wallets (for transfer options)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getAllWallets();
        setAllWallets(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  // Only wallets with same currency and not same wallet
  const eligibleWallets = selectedWallet
    ? allWallets.filter(
        (w) =>
          w.currency === selectedWallet.currency && w.id !== selectedWallet.id,
      )
    : [];

  const handleTransfer = async () => {
    try {
      setTransferLoading(true);
      setError("");

      await transferFunds({
        from_wallet_id: selectedWallet.id,
        to_wallet_id: Number(destinationWalletId),
        amount: Number(amount),
      });

      // Refresh wallets
      const updated = await getWalletsByUser(id);
      setWallets(updated.data);

      // Reset modal
      setSelectedWallet(null);
      setAmount("");
      setDestinationWalletId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setTransferLoading(false);
    }
  };

  const isTransferDisabled =
    !destinationWalletId ||
    !amount ||
    Number(amount) <= 0 ||
    Number(amount) > Number(selectedWallet?.balance);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-6">Wallets for User #{id}</h1>

        {loading && <p>Loading wallets...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {!loading && wallets.length === 0 && (
          <p className="text-gray-500">No wallets found.</p>
        )}

        {!loading &&
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-white p-6 rounded-2xl shadow mb-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{wallet.currency}</p>
                  <p className="text-gray-500">
                    Balance: {Number(wallet.balance).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedWallet(wallet)}
                  disabled={Number(wallet.balance) <= 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400"
                >
                  Transfer
                </button>
              </div>
            </div>
          ))}

        {/* Transfer Modal */}
        {selectedWallet && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
              <h2 className="text-lg font-bold mb-4">
                Transfer ({selectedWallet.currency})
              </h2>

              {eligibleWallets.length === 0 && (
                <p className="text-sm text-gray-500 mb-3">
                  No eligible wallets with same currency.
                </p>
              )}

              <select
                className="w-full border p-2 rounded mb-3"
                value={destinationWalletId}
                onChange={(e) => setDestinationWalletId(e.target.value)}
              >
                <option value="">Select destination</option>
                {eligibleWallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    Wallet #{wallet.id} ({wallet.currency}) - Wallet of User
                    {wallet.full_name} ({wallet.email})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Amount"
                className="w-full border p-2 rounded mb-4"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="px-4 py-2 bg-gray-300 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleTransfer}
                  disabled={isTransferDisabled || transferLoading}
                  className={`px-4 py-2 rounded-xl text-white ${
                    isTransferDisabled
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {transferLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWalletsPage;
