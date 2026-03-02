import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import NotFoundPage from "./pages/NotFoundPage";
import UsersPage from "./pages/UsersPage";
import UserWalletsPage from "./pages/UserWalletsPage";
import CreateUserPage from "./pages/CreateUserPage";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<UsersPage />} />
        <Route path="/users/:id/wallets" element={<UserWalletsPage />} />
        <Route path="/add-user" element={<CreateUserPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>,
    ),
  );
  return <RouterProvider router={router} />;
};

export default App;
