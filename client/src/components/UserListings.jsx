import UserListing from "./UserListing";

const UserListings = ({ users, meta }) => {
  if (!users.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-500">No users found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow flex justify-between text-sm text-gray-500">
        <span>Total Users: {meta?.total}</span>
        <span>Page: {meta?.page}</span>
      </div>

      {users.map((user) => (
        <UserListing key={user.id} user={user} />
      ))}
    </div>
  );
};

export default UserListings;
