import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { InspectionPlanningPage } from './InspectionPlanningPage';
import { InspectionJournalPage } from './InspectionJornalPage';
import { useLocation } from 'react-router';

export const InspectionPageContainer: React.FC = () => {
  const location = useLocation();
  const initialTab = location.state?.activeTab ?? 0;
  const [activeTab, setActiveTab] = useState<number>(initialTab);

  const [targetBatchNumber, setTargetBatchNumber] = useState<string | null>(
    location.state?.openAccordionId ?? null
  );

  useEffect(() => {
    if (location.state) {
      if (location.state.activeTab !== undefined) {
        setActiveTab(location.state.activeTab);
      }

      if (location.state.openAccordionId !== undefined) {
        setTargetBatchNumber(location.state.openAccordionId);
      }
    }
  }, [location.state]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue !== 1) {
      setTargetBatchNumber(null);
    }
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
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
            }}
          >
            <Tab
              // icon={<CalendarMonthIcon fontSize="small" />}
              // iconPosition="start"
              label="📋 Текущие задачи на осмотр"
              sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
            />
            <Tab
              // icon={<LocalShippingIcon fontSize="small" />}
              iconPosition="start"
              label="📦 Архив актов ТО"
              sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
            />
          </Tabs>
        </Box>
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
        {activeTab === 0 && <InspectionPlanningPage />}
        {activeTab === 1 && (
          <InspectionJournalPage initialOpenBatchNumber={targetBatchNumber} />
        )}
      </Box>
    </Box>
  );
};
