import { useEffect, useState } from "react";
import { getUsers } from "../services/userService.js";
import UserListings from "../components/UserListings";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Users</h1>

        {loading && <p className="text-gray-500">Loading users...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && <UserListings users={users} meta={meta} />}
      </div>
    </div>
  );
};

export default UsersPage;
