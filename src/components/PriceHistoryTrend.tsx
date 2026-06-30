import React, { useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useQuery } from '@apollo/client/react';
import { GetCsmTariffTrendDocument } from '../graphql/types/__generated__/graphql';

interface PriceHistoryTrendProps {
  siteId: string;
}

export const PriceHistoryTrend: React.FC<PriceHistoryTrendProps> = ({
  siteId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Выполняем наш новый GraphQL-запрос к бэкенду
  const { data, loading, error } = useQuery(GetCsmTariffTrendDocument, {
    variables: { siteId },
    skip: !siteId,
    fetchPolicy: 'network-only',
  });

  const response = data?.getCsmTariffTrend;
  const serviceName = response?.serviceName || 'Услуга поверки СИ';
  const timeline = response?.timeline || [];

  // 1. Формируем уникальный отсортированный массив годов для оси X
  const yearsLabels = useMemo(() => {
    const allYears = timeline.map((t: any) => Number(t.year));
    return Array.from(new Set(allYears)).sort((a, b) => a - b);
  }, [timeline]);

  // 2. Группируем данные по линиям (каждый ЦСМ — отдельная ветка графика)
  const chartSeries = useMemo(() => {
    if (timeline.length === 0 || yearsLabels.length === 0) return [];

    // Находим уникальные названия ЦСМ
    const csmNames = Array.from(new Set(timeline.map((t: any) => t.csmName)));

    return csmNames.map((csm, idx) => {
      // Для каждого года вытаскиваем цену этого ЦСМ (или null, если данных нет)
      const dataPoints = yearsLabels.map((year) => {
        const found = timeline.find(
          (t: any) => t.csmName === csm && Number(t.year) === year
        );
        return found ? found.price : null;
      });

      return {
        data: dataPoints,
        label: String(csm),
        // Синий для первой линии (Ростест), Зеленый для второй (Новосибирск) и т.д.
        color:
          idx === 0 ? theme.palette.primary.main : theme.palette.success.main,
        connectNulls: true, // Плавно соединяем точки, если за какой-то год данных нет
      };
    });
  }, [timeline, yearsLabels, theme]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Не удалось загрузить тренд инфляции тарифа: {error.message}
      </Alert>
    );
  }

  if (timeline.length === 0) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'grey.50',
          borderStyle: 'dashed',
          textAlign: 'center',
          my: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.5rem', mb: 1 }}>
          📊
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          История тарифов отсутствует
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          По данному объекту холдинга или прибору нет истории поверок в
          загруженных прайс-листах ЦСМ за прошлые периоды.
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        mb: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 'bold',
          mb: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          color: 'text.secondary',
        }}
      >
        📈 ТЕНДЕНЦИЯ ИЗМЕНЕНИЯ СТОИМОСТИ ПОВЕРКИ
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 'bold',
          color: 'text.primary',
          mb: 2,
          lineHeight: 1.3,
        }}
      >
        {serviceName}
      </Typography>

      <Box sx={{ width: '100%', height: { xs: 220, sm: 280 } }}>
        <LineChart
          xAxis={[
            {
              data: yearsLabels,
              scaleType: 'point',
              valueFormatter: (value) => `${value} г.`,
            },
          ]}
          yAxis={[
            {
              label: isMobile ? '' : 'Цена без НДС (₽)',
            },
          ]}
          series={chartSeries}
          // ✅ Ваши проверенные безопасные отступы, которые не обрезают края графиков
          margin={{ top: 20, bottom: 40, left: 60, right: 25 }}
          // Включаем легенду в безопасном режиме: только направление и позиция
          slotProps={{
            legend: {
              direction: 'horizontal' as const,
              position: { vertical: 'bottom', horizontal: 'center' },
            },
          }}
        />
      </Box>
    </Card>
  );
};
