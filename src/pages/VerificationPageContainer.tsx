// import React, { useState } from 'react';
// import { Box, Tabs, Tab } from '@mui/material';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// import { VerificationPlanningPage } from './VerificationPlanningPage';
// import { BatchesJournalPage } from './BatchesJournalPage';

// export const VerificationPageContainer: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<number>(0);
//   const [locallyVerifiedIds, setLocallyVerifiedIds] = useState<string[]>([]);

//   const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
//     setActiveTab(newValue);
//   };

//   return (
//     // <Box sx={{ width: '100%', height: '90dvh', bgcolor: 'grey.50' }}>
//     <Box
//       sx={{
//         width: '100%',
//         height: { xs: 'auto', md: '90dvh' },
//         maxHeight: { xs: 'none', md: '90dvh' },
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: { xs: 'visible', md: 'hidden' },
//         bgcolor: 'grey.50',
//         boxSizing: 'border-box',
//       }}
//     >
//       {/* Шапка с вкладками навигации */}
//       <Box
//         sx={{
//           borderBottom: 1,
//           borderColor: 'divider',
//           bgcolor: 'background.paper',
//           px: { xs: 2, md: 4 },
//         }}
//       >
//         <Tabs
//           value={activeTab}
//           onChange={handleTabChange}
//           aria-label="Навигация метрологии"
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab
//             icon={<CalendarMonthIcon fontSize="small" />}
//             iconPosition="start"
//             label="Календарь планирования"
//             sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
//           />
//           <Tab
//             icon={<LocalShippingIcon fontSize="small" />}
//             iconPosition="start"
//             label="Журнал партий"
//             sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
//           />
//         </Tabs>
//       </Box>

//       <Box
//         sx={{
//           height: { xs: 'auto', md: 'calc(100% - 49px)' },
//           maxHeight: { xs: 'none', md: 'calc(100% - 49px)' },
//           display: 'flex',
//           flexDirection: 'column',
//           overflow: { xs: 'visible', md: 'hidden' }, // 🎯 Распускаем замок на мобилках
//           boxSizing: 'border-box',
//         }}
//       >
//         {activeTab === 0 && <VerificationPlanningPage />}
//         {activeTab === 1 && (
//           <BatchesJournalPage
//             locallyVerifiedIds={locallyVerifiedIds}
//             setLocallyVerifiedIds={setLocallyVerifiedIds}
//           />
//         )}
//       </Box>
//     </Box>
//   );
// };
import React, { useState } from 'react';
import { Box, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { VerificationPlanningPage } from './VerificationPlanningPage';
import { BatchesJournalPage } from './BatchesJournalPage';
import PageHelpButton from '../components/PageHelpButton';

export const VerificationPageContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [locallyVerifiedIds, setLocallyVerifiedIds] = useState<string[]>([]);

  // Адаптивные хуки для определения мобильной версии
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 'auto', md: '90dvh' },
        maxHeight: { xs: 'none', md: '90dvh' },
        display: 'flex',
        flexDirection: 'column',
        overflow: { xs: 'visible', md: 'hidden' },
        bgcolor: 'grey.50',
        boxSizing: 'border-box',
        position: 'relative', // Необходо для абсолютного позиционирования мобильной кнопки
      }}
    >
      {/* Шапка с вкладками навигации */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Вкладки теперь свободно занимают 100% ширины на мобилке, скролл работает идеально */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Навигация метрологии"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<CalendarMonthIcon fontSize="small" />}
              iconPosition="start"
              label="Календарь планирования"
              sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
            />
            <Tab
              icon={<LocalShippingIcon fontSize="small" />}
              iconPosition="start"
              label="Журнал партий"
              sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
            />
          </Tabs>
        </Box>

        {/* 💻 ДЕСКТОПНАЯ КНОПКА ПОМОЩИ: Рендерится в шапке только на ПК (md и выше) */}
        {!isMobile && (
          <Box sx={{ py: 0.5 }}>
            <PageHelpButton />
          </Box>
        )}
      </Box>

      {/* Рабочая область табов */}
      <Box
        sx={{
          height: { xs: 'auto', md: 'calc(100% - 49px)' },
          maxHeight: { xs: 'none', md: 'calc(100% - 49px)' },
          display: 'flex',
          flexDirection: 'column',
          overflow: { xs: 'visible', md: 'hidden' },
          boxSizing: 'border-box',
        }}
      >
        {activeTab === 0 && <VerificationPlanningPage />}
        {activeTab === 1 && (
          <BatchesJournalPage
            locallyVerifiedIds={locallyVerifiedIds}
            setLocallyVerifiedIds={setLocallyVerifiedIds}
          />
        )}
      </Box>

      {/* 📱 МОБИЛЬНАЯ КНОПКА ПОМОЩИ: Парит в правом нижнем углу экрана */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed', // Фиксируем поверх всего контента приложения
            bottom: 24, // Отступ снизу
            right: 24, // Отступ справа
            zIndex: 1100, // Накладываем поверх таблиц и аккордеонов
          }}
        >
          <PageHelpButton />
        </Box>
      )}
    </Box>
  );
};
