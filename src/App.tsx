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
import ProductionSitesPage from './pages/admin/ProductionSitesPage';
import CreateProductionSitePage from './pages/admin/CreateProductionSitePage';
import EditProductionSitePage from './pages/admin/EditProductionSitePage';
import EquipmentTypesPage from './pages/admin/EquipmentTypesPage';
import CreateEquipmentTypePage from './pages/admin/CreateEquipmentTypePage';
import MeasurementTypesPage from './pages/admin/MeasurementTypesPage';
import CreateMeasurementTypePage from './pages/admin/CreateMeasurementTypePage';
import MetrologyControlTypePage from './pages/admin/MetrologyControlTypePage';
import CreateMetrologyControlTypePage from './pages/admin/CreateMetrologyControlTypePage';
import ScopesPage from './pages/admin/ScopesPage';
import CreateScopePage from './pages/admin/CreateScopePage';
import CreateStatusPage from './pages/admin/CreateStatusPage';
import StatusesPage from './pages/admin/StatusesPage';

function App() {
  return (
    <>
      <CssBaseline />
      <NavBar />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={routes.home()} element={<HomePage />} />
          <Route element={<MainLayout />}>
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
                element={<ProductionSitesPage />}
              />
              <Route
                path={routes.admin.createProductionSite()}
                element={<CreateProductionSitePage />}
              />
              <Route
                path={routes.admin.editProductionSite(':productionSiteId')}
                element={<EditProductionSitePage />}
              />
              <Route
                path={routes.admin.equipmentTypes()}
                element={<EquipmentTypesPage />}
              />
              <Route
                path={routes.admin.createEquipmentType()}
                element={<CreateEquipmentTypePage />}
              />
              <Route
                path={routes.admin.measurementTypes()}
                element={<MeasurementTypesPage />}
              />
              <Route
                path={routes.admin.createMeasurementType()}
                element={<CreateMeasurementTypePage />}
              />
              <Route
                path={routes.admin.metrologyControlTypes()}
                element={<MetrologyControlTypePage />}
              />
              <Route
                path={routes.admin.createMetrologyControlType()}
                element={<CreateMetrologyControlTypePage />}
              />
              <Route path={routes.admin.scopes()} element={<ScopesPage />} />
              <Route
                path={routes.admin.createScope()}
                element={<CreateScopePage />}
              />
              <Route
                path={routes.admin.createStatus()}
                element={<CreateStatusPage />}
              />
              <Route
                path={routes.admin.statuses()}
                element={<StatusesPage />}
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
