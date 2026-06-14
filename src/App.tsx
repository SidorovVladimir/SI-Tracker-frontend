import { Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import routes from './utils/routes';
import ProtectedRoute from './components/ProtectedRoute';
// import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NavBar from './components/NavBar';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/admin/UsersPage';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
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
import PrimaryStandartsPage from './pages/admin/PrimaryStandartsPage';
import CreatePrimaryStandartPage from './pages/admin/CreatePrimaryStandartPage';
import VerificationOrganizationsPage from './pages/admin/VerificationOrganizationsPage';
import CreateVerificationOrganizationPage from './pages/admin/CreateVerificationOrganizationPage';
import AuditLogPage from './pages/admin/AuditLogPage';

import { VerificationPageContainer } from './pages/VerificationPageContainer';
import AnalyticsPage from './pages/AnalyticsPage';
import ProductionAnalyticsPage from './pages/ProductionAnalyticsPage';
import { ExcelImporter } from './components/ExcelImporter';
import { SqlConsolePage } from './pages/admin/SqlConsolePage';
import { ChatPage } from './pages/ChatPage';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSocketApp } from './context/SocketContext';
import { useAuth } from './hooks/useAuth';
import { GlobalJobWatcher } from './components/GlobalJobWatcher';
// import { LicensesPage } from './pages/LicensesPage';

function App() {
  const { isMaintenance } = useSocketApp();
  const { user } = useAuth();

  // 🔥 Корневой перехват: гасит всё приложение, включая NavBar
  if (isMaintenance && user?.role !== 'superadmin') {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'grey.900',
          color: 'white',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          p: 4,
          textAlign: 'center',
        }}
      >
        <CircularProgress color="error" size={60} thickness={4} />
        <Typography variant="h4" fontWeight="bold">
          🛠️ Техническое обслуживание системы
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.400', maxWidth: 500 }}>
          Администратор запустил процесс восстановления базы данных из резервной
          копии. Все операции временно приостановлены. Система автоматически
          станет доступна сразу после завершения операции.
        </Typography>
      </Box>
    );
  }
  return (
    <>
      <NavBar />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={routes.home()} element={<HomePage />} />
          <Route path={routes.profile()} element={<ProfilePage />} />
          <Route path={routes.chat()} element={<ChatPage />} />
          {/* <Route path="/about/licenses" element={<LicensesPage />} /> */}

          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path={routes.import()} element={<ExcelImporter />} />
            <Route path={routes.sqlConsole()} element={<SqlConsolePage />} />
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}
          >
            <Route
              path={routes.planning()}
              element={<VerificationPageContainer />}
            />
            <Route path={routes.analytics()} element={<AnalyticsPage />} />
            <Route
              path={routes.productionAnalytics()}
              element={<ProductionAnalyticsPage />}
            />
            <Route element={<MainLayout />}>
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
                  path={routes.admin.primaryStandarts()}
                  element={<PrimaryStandartsPage />}
                />
                <Route
                  path={routes.admin.createPrimaryStandart()}
                  element={<CreatePrimaryStandartPage />}
                />
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
                <Route
                  path={routes.admin.verificationOrganizations()}
                  element={<VerificationOrganizationsPage />}
                />
                <Route
                  path={routes.admin.createVerificationOrganization()}
                  element={<CreateVerificationOrganizationPage />}
                />

                <Route
                  path={routes.admin.auditLogs()}
                  element={<AuditLogPage />}
                />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={routes.login()} element={<LoginPage />} />
          {/* <Route path={routes.register()} element={<RegisterPage />} /> */}
        </Route>
        <Route path={'*'} element={<NotFoundPage />} />
      </Routes>
      <GlobalJobWatcher />
    </>
  );
}

export default App;
