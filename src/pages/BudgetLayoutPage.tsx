// import React from 'react';
// import {
//   useLocation,
//   useNavigate,
//   Routes,
//   Route,
//   Navigate,
// } from 'react-router';
// import { Container, Typography, Box, Tabs, Tab, Paper } from '@mui/material';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
// import UploadFileIcon from '@mui/icons-material/UploadFile';
// import ListAltIcon from '@mui/icons-material/ListAlt';

// // Импортируем страницы
// import { BudgetPlansPage } from './BudgetPlansPage';
// import { PricelistListPage } from './PriceListPage';
// import { PricelistExcelImporter } from '../components/PricelistExcelImporter';

// export const BudgetLayoutPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Логика определения активной вкладки по текущему пути URL
//   const getActiveTab = () => {
//     if (location.pathname.startsWith('/budget/plans')) return 0;
//     if (location.pathname === '/budget/pricelists') return 1;
//     if (location.pathname === '/budget/pricelists/upload') return 2;
//     return 0;
//   };

//   const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
//     if (newValue === 0) navigate('/budget/plans');
//     if (newValue === 1) navigate('/budget/pricelists');
//     if (newValue === 2) navigate('/budget/pricelists/upload');
//   };

//   return (
//     // Уменьшаем отступы на мобильных (xs: 2, sm: 4), чтобы не тратить место экрана
//     <Container
//       maxWidth="xl"
//       sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 1, sm: 2 } }}
//     >
//       {/* Главный заголовок модуля */}
//       <Box sx={{ mb: 3 }}>
//         <Typography
//           variant="h4"
//           component="h1"
//           sx={{
//             fontWeight: 'bold',
//             mb: 0.5,
//             fontSize: { xs: '1.5rem', sm: '2.125rem' }, // Адаптивный размер шрифта
//           }}
//         >
//           Финансовый учет и бюджетирование
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Централизованное управление прейскурантами ЦСМ и планирование затрат
//           на поверку СИ.
//         </Typography>
//       </Box>

//       {/* Панель вкладок верхнего уровня */}
//       <Paper
//         variant="outlined"
//         sx={{
//           borderRadius: 2,
//           mb: 4,
//           bgcolor: 'background.paper',
//           overflow: 'hidden',
//         }}
//       >
//         <Tabs
//           value={getActiveTab()}
//           onChange={handleTabChange}
//           indicatorColor="primary"
//           textColor="primary"
//           // 📱 ВКЛЮЧАЕМ МОБИЛЬНЫЙ СКРОЛЛ ТАБОВ:
//           variant="scrollable" // Табы будут плавно скроллиться пальцем на мобилках
//           scrollButtons="auto" // Стрелочки появятся сами, если табы не влезут в экран
//           allowScrollButtonsMobile // Стрелочки будут кликабельными и видимыми на смартфонах
//           sx={{
//             // Стилизуем стрелочки прокрутки, чтобы они выглядели аккуратно
//             '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
//           }}
//         >
//           <Tab
//             icon={<AccountBalanceWalletIcon fontSize="small" />}
//             iconPosition="start"
//             label="Годовые планы бюджетов"
//             sx={{
//               fontWeight: 'bold',
//               textTransform: 'none',
//               minHeight: 48,
//               whiteSpace: 'nowrap',
//             }}
//           />
//           <Tab
//             icon={<ListAltIcon fontSize="small" />}
//             iconPosition="start"
//             label="Архив прейскурантов ЦСМ"
//             sx={{
//               fontWeight: 'bold',
//               textTransform: 'none',
//               minHeight: 48,
//               whiteSpace: 'nowrap',
//             }}
//           />
//           <Tab
//             icon={<UploadFileIcon fontSize="small" />}
//             iconPosition="start"
//             label="Загрузка прейскурантов из Excel"
//             sx={{
//               fontWeight: 'bold',
//               textTransform: 'none',
//               minHeight: 48,
//               whiteSpace: 'nowrap',
//             }}
//           />
//         </Tabs>
//       </Paper>

//       {/* Внутренний роутинг вкладок подмодуля */}
//       <Box sx={{ mt: 2 }}>
//         <Routes>
//           <Route path="/" element={<Navigate to="plans" replace />} />
//           <Route path="plans" element={<BudgetPlansPage />} />
//           <Route path="pricelists" element={<PricelistListPage />} />
//           <Route
//             path="pricelists/upload"
//             element={<PricelistExcelImporter />}
//           />
//         </Routes>
//       </Box>
//     </Container>
//   );
// };
import React from 'react';
import {
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from 'react-router';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ListAltIcon from '@mui/icons-material/ListAlt';

// Импортируем страницы
import { BudgetPlansPage } from './BudgetPlansPage';
import { PricelistListPage } from './PriceListPage';
import { PricelistExcelImporter } from '../components/PricelistExcelImporter';
import PageHelpButton from '../components/PageHelpButton'; // 🌟 Импортируем кнопку помощи

export const BudgetLayoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Определяем мобильный экран

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
    <Container
      maxWidth="xl"
      sx={{
        mt: { xs: 2, sm: 4 },
        mb: 4,
        px: { xs: 1, sm: 2 },
        position: 'relative',
      }}
    >
      {/* ================= ВЕРХНЯЯ ШАПКА С АДАПТИВНОЙ КНОПКОЙ ПОМОЩИ ================= */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          mb: 3,
          gap: 2,
        }}
      >
        {/* 🌟 ОБЪЕДИНЯЕМ ГЛАВНЫЙ ЗАГОЛОВОК, ПОДПИСЬ И КНОПКУ ПОМОЩИ В СТЭК */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
          sx={{
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 0.5,
                fontSize: { xs: '1.4rem', sm: '2.125rem' }, // Сжали шрифт на смартфонах
              }}
            >
              Финансовый учет и бюджетирование
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Централизованное управление прейскурантами ЦСМ и планирование
              затрат на поверку СИ.
            </Typography>
          </Box>

          {/* 💻 На десктопе кнопка помощи рендерится строго в шапке */}
          {!isMobile && <PageHelpButton />}
        </Stack>
      </Box>

      {/* Панель вкладок верхнего уровня */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          mb: 4,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={getActiveTab()}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
          }}
        >
          <Tab
            icon={<AccountBalanceWalletIcon fontSize="small" />}
            iconPosition="start"
            label="Годовые планы бюджетов"
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              minHeight: 48,
              whiteSpace: 'nowrap',
            }}
          />
          <Tab
            icon={<ListAltIcon fontSize="small" />}
            iconPosition="start"
            label="Архив прейскурантов ЦСМ"
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              minHeight: 48,
              whiteSpace: 'nowrap',
            }}
          />
          <Tab
            icon={<UploadFileIcon fontSize="small" />}
            iconPosition="start"
            label="Загрузка прейскурантов из Excel"
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              minHeight: 48,
              whiteSpace: 'nowrap',
            }}
          />
        </Tabs>
      </Paper>

      {/* Внутренний роутинг вкладок подмодуля */}
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<Navigate to="plans" replace />} />
          <Route path="plans" element={<BudgetPlansPage />} />
          <Route path="pricelists" element={<PricelistListPage />} />
          <Route
            path="pricelists/upload"
            element={<PricelistExcelImporter />}
          />
        </Routes>
      </Box>

      {/* 📱 МОБИЛЬНАЯ КНОПКА ПОМОЩИ: Парит в правом нижнем углу экрана поверх всех дочерних таблиц */}
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
          <PageHelpButton />
        </Box>
      )}
    </Container>
  );
};
