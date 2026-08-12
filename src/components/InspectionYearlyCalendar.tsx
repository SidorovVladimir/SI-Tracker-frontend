import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';

interface InspectionYearlyCalendarProps {
  currentYear: number;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  summaryData?: any[];
  loading: boolean;
}

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export const InspectionYearlyCalendar: React.FC<
  InspectionYearlyCalendarProps
> = ({ currentYear, selectedMonth, onSelectMonth, summaryData, loading }) => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        overflowY: { xs: 'visible', md: 'auto' },
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          mb: { xs: 1, md: 2 },
          color: 'text.primary',
          fontSize: { xs: '1.1rem', md: '1.25rem' },
        }}
      >
        🛠️ Осмотры {currentYear}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List
          component="nav"
          disablePadding
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            overflowX: { xs: 'auto', md: 'visible' },
            gap: { xs: 1.5, md: 0 },
            pb: { xs: 1, md: 0 },
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {summaryData?.map((item) => {
            const monthIndex = parseInt(item.month.split('-')[1]!, 10) - 1;
            const isSelected = item.month === selectedMonth;
            return (
              <ListItemButton
                key={item.month}
                selected={isSelected}
                onClick={() => onSelectMonth(item.month)}
                sx={{
                  borderRadius: 1,
                  mb: { xs: 0, md: 1 },
                  minWidth: { xs: '155px', md: 'auto' },
                  flexShrink: 0,
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  p: { xs: 1, sm: 1.5 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <ListItemText
                  primary={MONTH_NAMES[monthIndex]}
                  secondary={item.month}
                  slotProps={{
                    primary: {
                      variant: 'body2',
                      fontWeight: isSelected ? 'bold' : 'regular',
                    },
                    secondary: { variant: 'caption' },
                  }}
                  sx={{ m: 0, mr: 1 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={`🛠️ ${item.autoCount}`}
                    size="small"
                    color={item.autoCount > 0 ? 'primary' : 'default'}
                    sx={{
                      fontSize: '0.65rem',
                      height: 18,
                      fontWeight: 'bold',
                      '& .MuiChip-label': { px: 0.8 },
                    }}
                    title="Приборов на осмотр"
                  />
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      )}
    </Box>
  );
};
