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

function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            path={routes.home()}
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          ></Route>
          <Route
            path={routes.profile()}
            element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            }
          ></Route>
          <Route path={routes.admin.root()} element={<AdminPage />}>
            <Route path={routes.admin.users()} element={<UsersPage />}></Route>
          </Route>
        </Route>
        <Route
          path={routes.login()}
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        ></Route>
        <Route
          path={routes.register()}
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
