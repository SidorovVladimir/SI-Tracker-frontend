import { Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import routes from './utils/routes';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NavBar from './components/NavBar';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/admin/UsersPage';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <NavBar />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={routes.home()} element={<HomePage />} />
            <Route path={routes.profile()} element={<ProfilePage />} />

            <Route path={routes.admin.root()} element={<AdminPage />}>
              <Route path={routes.admin.users()} element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={routes.login()} element={<LoginPage />} />
          <Route path={routes.register()} element={<RegisterPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
