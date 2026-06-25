// // src/modules/budget/pages/BudgetLayoutPage.tsx
import React from 'react';
import {
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from 'react-router';
import { Container, Typography, Box, Tabs, Tab, Paper } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ListAltIcon from '@mui/icons-material/ListAlt';

// Импортируем страницы
import { BudgetPlansPage } from './BudgetPlansPage';
import { PricelistListPage } from './PriceListPage';
import { PricelistExcelImporter } from '../components/PricelistExcelImporter';

export const BudgetLayoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Логика определения активной вкладки по текущему пути URL
  const getActiveTab = () => {
    if (location.pathname.startsWith('/budget/plans')) return 0;
    if (location.pathname === '/budget/pricelists') return 1;
    if (location.pathname === '/budget/pricelists/upload') return 2;
    return 0;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('/budget/plans');
    if (newValue === 1) navigate('/budget/pricelists');
    if (newValue === 2) navigate('/budget/pricelists/upload');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Главный заголовок модуля */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 'bold', mb: 0.5 }}
        >
          Финансовый учет и бюджетирование
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Централизованное управление прейскурантами ЦСМ и планирование затрат
          на поверку СИ.
        </Typography>
      </Box>

      {/* Панель вкладок верхнего уровня (теперь их 3) */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, mb: 4, bgcolor: 'background.paper' }}
      >
        <Tabs
          value={getActiveTab()}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          // variant="contained"
        >
          <Tab
            icon={<AccountBalanceWalletIcon fontSize="small" />}
            iconPosition="start"
            label="Годовые планы бюджетов"
            sx={{ fontWeight: 'bold', textTransform: 'none', minHeight: 48 }}
          />
          <Tab
            icon={<ListAltIcon fontSize="small" />}
            iconPosition="start"
            label="Архив прейскурантов ЦСМ"
            sx={{ fontWeight: 'bold', textTransform: 'none', minHeight: 48 }}
          />
          <Tab
            icon={<UploadFileIcon fontSize="small" />}
            iconPosition="start"
            label="Загрузка прейскурантов из Excel"
            sx={{ fontWeight: 'bold', textTransform: 'none', minHeight: 48 }}
          />
        </Tabs>
      </Paper>

      {/* Внутренний роутинг вкладок подмодуля */}
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<Navigate to="plans" replace />} />
          <Route path="plans" element={<BudgetPlansPage />} />
          <Route path="pricelists" element={<PricelistListPage />} />{' '}
          {/* Вкладка 2 */}
          <Route
            path="pricelists/upload"
            element={<PricelistExcelImporter />}
          />{' '}
          {/* Вкладка 3 */}
        </Routes>
      </Box>
    </Container>
  );
};
