import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { GetProductionAnalyticsDocument } from '../graphql/types/__generated__/graphql';

// Полный массив месяцев для выпадающего списка фильтрации
const MONTHS_SELECT_OPTIONS = [
  { value: 0, label: 'Все месяцы года' },
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' },
];

export default function ProductionAnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  // Адаптивный хук определения размеров экрана
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Сетевой GraphQL-запрос количественного учета в штуках
  const { data, loading, error } = useQuery(GetProductionAnalyticsDocument, {
    variables: {
      year: selectedYear,
      month: selectedMonth === 0 ? null : selectedMonth,
    },
    fetchPolicy: 'network-only',
  });

  const response = data?.getProductionAnalytics;

  // Главные количественные счетчики
  const totalVerified = response?.totalVerified || 0;
  const totalRejected = response?.totalRejected || 0;
  const totalCalibrated = response?.totalCalibrated || 0;

  // --- 📐 1. Маппинг и фильтрация Цехов (Сразу отсекаем нули) ---
  const siteProgressData = useMemo(() => {
    return (response?.byProductionSites || [])
      .map((item, idx) => ({ id: idx, value: item.count, label: item.label }))
      .filter((item) => item.value > 0);
  }, [response]);

  // --- 📐 2. Маппинг и фильтрация ЮРЛИЦ (Организаций) ---
  const companyProgressData = useMemo(() => {
    return (response?.byCompanies || [])
      .map((item, idx) => ({ id: idx, value: item.count, label: item.label }))
      .filter((item) => item.value > 0);
  }, [response]);

  // --- 📐 3. Маппинг и фильтрация Географии (Городов) ---
  const cityProgressData = useMemo(() => {
    return (response?.byCities || [])
      .map((item, idx) => ({ id: idx, value: item.count, label: item.label }))
      .filter((item) => item.value > 0);
  }, [response]);

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Ошибка сбора производственной аналитики: {error.message}
        </Alert>
      </Container>
    );
  }
  return (
    <Container
      maxWidth="xl"
      sx={{ py: 3, height: 'calc(100dvh - 100px)', overflowY: 'auto' }}
    >
      {/* ================= ВЕРХНЯЯ ШАПКА И ДВА СЕЛЕКТОРОВ (ГОД + МЕСЯЦ) ================= */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          📋 Производственный мониторинг и объемы СИ
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ width: isMobile ? '100%' : 'auto' }}
        >
          {/* Селектор месяца */}
          <FormControl
            size="small"
            sx={{ minWidth: 160, flexGrow: isMobile ? 1 : 0 }}
          >
            <InputLabel id="prod-month-select-label">Период</InputLabel>
            <Select
              labelId="prod-month-select-label"
              value={selectedMonth}
              label="Период"
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS_SELECT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Селектор календарного года */}
          <FormControl
            size="small"
            sx={{ minWidth: 120, flexGrow: isMobile ? 1 : 0 }}
          >
            <InputLabel id="prod-year-select-label">Год</InputLabel>
            <Select
              labelId="prod-year-select-label"
              value={selectedYear}
              label="Год"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[0, 1, 2, 3].map((offset) => {
                const y = new Date().getFullYear() - offset;
                return (
                  <MenuItem key={y} value={y}>
                    {y} год
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* ================= КОЛИЧЕСТВЕННЫЕ КАРТОЧКИ KPI (ШТУКИ СИ) ================= */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                boxShadow: 3,
                borderLeft: '6px solid',
                borderColor: 'success.main',
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600 }}
                >
                  УСПЕШНО ПОВЕРЕНО (ГОДЕН)
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}
                >
                  {totalVerified.toLocaleString('ru-RU')} шт.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                boxShadow: 3,
                borderLeft: '6px solid',
                borderColor: 'error.main',
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600 }}
                >
                  ЗАБРАКОВАНО (НЕ ГОДЕН)
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mt: 1, color: 'error.main' }}
                >
                  {totalRejected.toLocaleString('ru-RU')} шт.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                boxShadow: 3,
                borderLeft: '6px solid',
                borderColor: 'info.main',
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600 }}
                >
                  ПРОШЛИ КАЛИБРОВКУ
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mt: 1, color: 'info.main' }}
                >
                  {totalCalibrated.toLocaleString('ru-RU')} шт.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* ================= ГОРИЗОНТАЛЬНЫЕ РЕЙТИНГИ ОБЪЕМОВ В ШТУКАХ ================= */}

          {/* СРЕЗ 1: ГОРОДА */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                boxShadow: 3,
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                🗺️ Объемы выполненных поверок по Географии (Городам)
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                {/* 🎯 ИСПРАВЛЕНО: Считаем сумму штук СТРОГО внутри этого массива. Математика сойдется в 100%! */}
                <QuantitiveProgressList
                  data={cityProgressData}
                  total={cityProgressData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  )}
                />
              </Box>
            </Card>
          </Grid>

          {/* СРЕЗ 2: ОРГАНИЗАЦИИ (ЮРЛИЦА) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                boxShadow: 3,
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                🏢 Объемы выполненных поверок по Организациям (ЮЛ)
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                {/* 🎯 ИСПРАВЛЕНО: То же самое для организаций */}
                <QuantitiveProgressList
                  data={companyProgressData}
                  total={companyProgressData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  )}
                />
              </Box>
            </Card>
          </Grid>

          {/* СРЕЗ 3: ПОЛНЫЙ РЕЙТИНГ ЦЕХОВ */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 3, p: 3 }}>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  🏭 Производственный рейтинг Цехов завода (по количеству
                  поверенных приборов)
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Всего участков с активностью: {siteProgressData.length} шт.
                </Typography>
              </Box>

              {siteProgressData.length === 0 ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic' }}
                  >
                    Нет данных о поверках за выбранный период
                  </Typography>
                </Box>
              ) : (
                // 🎯 ИСПРАВЛЕНО: И для цехов считаем сумму по их массиву
                <QuantitiveProgressList
                  data={siteProgressData}
                  total={siteProgressData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  )}
                  isFullWidth={true}
                />
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

// =========================================================================
// 🌟 КОМПОНЕНТ РЕНДЕРИНГА ПОЛОСОК PROGRESS BAR ДЛЯ КОЛИЧЕСТВЕННОГО УЧЕТА СИ
// =========================================================================
function QuantitiveProgressList({
  data = [],
  total = 0,
  isFullWidth = false,
}: {
  data: any[];
  total: number;
  isFullWidth?: boolean;
}) {
  if (data.length === 0) {
    return (
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontStyle: 'italic' }}
        >
          Нет данных за выбранный период
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{
        py: 1,
        maxHeight: isFullWidth ? 'none' : 280,
        overflowY: isFullWidth ? 'none' : 'auto',
      }}
    >
      {data.map((item) => {
        // Процентная доля штук СИ этого цеха от общего объема работы лаборатории
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <Box key={item.id} sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 0.5,
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  wordBreak: 'break-word',
                  maxWidth: '75%',
                  fontSize: '0.76rem',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  fontSize: '0.76rem',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {item.value} шт. ({percentage.toFixed(1)}%)
              </Typography>
            </Box>
            {/* Полоска прогресса штук СИ */}
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={item.label.includes('ЗАБРАКОВАН') ? 'error' : 'success'}
              sx={{ height: 6, borderRadius: 2, bgcolor: 'grey.100' }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
