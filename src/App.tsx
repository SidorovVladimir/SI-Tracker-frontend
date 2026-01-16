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
import EditUserPage from './pages/admin/EditUserPage';
import NotFoundPage from './pages/NotFoundPage';
import CitiesPage from './pages/admin/CitiesPage';
import EditCityPage from './pages/admin/EditCityPage';
import CreateUserPage from './pages/admin/CreateUserPage';
import CreateCityPage from './pages/admin/CreateCityPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import EditCompanyPage from './pages/admin/EditCompanyPage';
import CreateCompanyPage from './pages/admin/CreateCompanyPage';
import ProductionSites from './pages/admin/ProductionSites';
import CreateProductionSite from './pages/admin/CreateProductionSite';

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
              <Route
                path={routes.admin.editUser(':userId')}
                element={<EditUserPage />}
              />
              <Route path={routes.admin.cities()} element={<CitiesPage />} />
              <Route
                path={routes.admin.editCity(':cityId')}
                element={<EditCityPage />}
              />
              <Route
                path={routes.admin.createUser()}
                element={<CreateUserPage />}
              />
              <Route
                path={routes.admin.createCity()}
                element={<CreateCityPage />}
              />

              <Route
                path={routes.admin.companies()}
                element={<CompaniesPage />}
              />
              <Route
                path={routes.admin.editCompany(':companyId')}
                element={<EditCompanyPage />}
              />
              <Route
                path={routes.admin.createCompany()}
                element={<CreateCompanyPage />}
              />
              <Route
                path={routes.admin.productionSites()}
                element={<ProductionSites />}
              />
              <Route
                path={routes.admin.createProductionSite()}
                element={<CreateProductionSite />}
              />
            </Route>
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={routes.login()} element={<LoginPage />} />
          <Route path={routes.register()} element={<RegisterPage />} />
        </Route>
        <Route path={'*'} element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
