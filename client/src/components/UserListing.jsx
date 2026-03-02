import { useNavigate } from "react-router-dom";

const UserListing = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{user.full_name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {new Date(user.created_at).toLocaleDateString()}
          </span>

          <button
            onClick={() => navigate(`/users/${user.id}/wallets`)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            View Wallets
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserListing;
