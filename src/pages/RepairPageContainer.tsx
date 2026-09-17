import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { RepairPlanningPage } from './RepairPlanningPage';
import { RepairBatchesJournalPage } from './RepairBatchesJournalPage';

export const RepairPageContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

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
        position: 'relative',
      }}
    >
      {/* Навигационная панель */}
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
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Навигация службы КИПиА"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              icon={<BuildIcon fontSize="small" />}
              iconPosition="start"
              label="Очередь на ремонт"
              sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
            />
            <Tab
              icon={<ReceiptLongIcon fontSize="small" />}
              iconPosition="start"
              label="Ремонтные ведомости"
              sx={{ textTransform: 'none', fontWeight: 'bold', minHeight: 48 }}
            />
          </Tabs>
        </Box>
      </Box>

      {/* Контент активного таба */}
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
        {activeTab === 0 && <RepairPlanningPage />}
        {activeTab === 1 && <RepairBatchesJournalPage />}
      </Box>
    </Box>
  );
};
