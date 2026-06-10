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
import { MonthlySummary } from '../graphql/types/__generated__/graphql';

interface YearlyCalendarSummaryProps {
  currentYear: number;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  summaryData?: MonthlySummary[];
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

export const YearlyCalendarSummary: React.FC<YearlyCalendarSummaryProps> = ({
  currentYear,
  selectedMonth,
  onSelectMonth,
  summaryData,
  loading,
}) => {
  return (
    <Box
      sx={{
        // На ПК (md) фиксированная удобная ширина, на мобилках (xs) — на всю ширину экрана!
        // width: { xs: '100%', md: '280px' },
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        // На мобилках запрещаем вертикальный скролл панели, оставляем только на ПК
        overflowY: { xs: 'visible', md: 'auto' },
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="h6"
        // sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}
        sx={{
          fontWeight: 'bold',
          mb: { xs: 1, md: 2 },
          color: 'text.primary',
          fontSize: { xs: '1.1rem', md: '1.25rem' },
        }}
      >
        📍 Календарь {currentYear}
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
            // На мобилках выстраиваем карточки месяцев горизонтально в линию со скроллом!
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            overflowX: { xs: 'auto', md: 'visible' },
            gap: { xs: 1.5, md: 0 },
            pb: { xs: 1, md: 0 },
            // Скрываем некрасивый системный скроллбар на телефонах
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
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
                  mb: { xs: 0, md: 1 }, // Убираем нижний отступ на мобилках
                  // На мобилках плашки месяцев имеют фиксированную ширину для свайпа
                  minWidth: { xs: '155px', md: 'auto' },
                  flexShrink: 0,
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  p: { xs: 1, sm: 1.5 }, // Компактные отступы внутри плашки
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
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
                    secondary: {
                      variant: 'caption',
                    },
                  }}
                  sx={{ m: 0, mr: 1 }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    alignItems: 'end',
                  }}
                >
                  <Chip
                    label={`⚙️ ${item.autoCount}`}
                    size="small"
                    color="success"
                    // sx={{ fontSize: '0.7rem', height: 20 }}
                    sx={{
                      fontSize: '0.65rem',
                      height: 16,
                      '& .MuiChip-label': { px: 0.5 },
                    }}
                    title="Автоматический пул"
                  />
                  <Chip
                    label={`👤 ${item.manualCount}`}
                    size="small"
                    color="secondary"
                    // sx={{ fontSize: '0.7rem', height: 20 }}
                    sx={{
                      fontSize: '0.65rem',
                      height: 16,
                      '& .MuiChip-label': { px: 0.5 },
                    }}
                    title="Закреплено вручную"
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
