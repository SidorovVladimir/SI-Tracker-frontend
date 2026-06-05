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
import { LineChart } from '@mui/x-charts';
import { GetFinancialAnalyticsDocument } from '../graphql/types/__generated__/graphql';

// Константа текстовых меток месяцев для графика трендов
const MONTHS_LABELS = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
];

// Полный массив месяцев для нашего нового выпадающего списка фильтрации
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

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, loading, error } = useQuery(GetFinancialAnalyticsDocument, {
    variables: {
      year: selectedYear,
      // Если выбрано "Все месяцы" (0) — шлем null, чтобы сервер посчитал весь год целиком
      month: selectedMonth === 0 ? null : selectedMonth,
    },
    fetchPolicy: 'network-only',
  });

  const response = data?.getFinancialAnalytics;
  const totalSpent = response?.totalSpent || 0;

  // --- 📈 1. Маппинг месяцев для линейного тренда полного года ---
  const lineChartData = useMemo(() => {
    const timeline = response?.monthlyTimeline || [];
    const fullYearData = Array(12).fill(0);

    timeline.forEach((item) => {
      const monthNum = Number(item.month);
      if (monthNum >= 1 && monthNum <= 12) {
        fullYearData[monthNum - 1] = item.amount;
      }
    });

    return fullYearData;
  }, [response]);

  const cityPieData = useMemo(() => {
    return (response?.byCities || [])
      .map((item, idx) => ({
        id: idx,
        value: item.amount,
        label: item.cityName.toUpperCase(),
      }))
      .filter((item) => item.value > 0) // 🎯 КРИТИЧЕСКИЙ ФИКС: отсекаем нулевые города
      .sort((a, b) => b.value - a.value);
  }, [response]);

  const companyPieData = useMemo(() => {
    return (response?.byCompanies || [])
      .map((item, idx) => ({
        id: idx,
        value: item.amount,
        label: item.companyName.toUpperCase(),
      }))
      .filter((item) => item.value > 0) // 🎯 КРИТИЧЕСКИЙ ФИКС: отсекаем нулевые компании
      .sort((a, b) => b.value - a.value);
  }, [response]);

  const sitePieData = useMemo(() => {
    return (response?.byProductionSites || [])
      .map((item, idx) => ({
        id: idx,
        value: item.amount,
        label: item.fullSiteLabel,
      }))
      .filter((item) => item.value > 0) // 🎯 КРИТИЧЕСКИЙ ФИКС: отсекаем нулевые цеха
      .sort((a, b) => b.value - a.value);
  }, [response]);

  const topCompany = companyPieData?.[0]?.label || '—';
  const topSite = sitePieData?.[0]?.label || '—';

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Ошибка сбора финансовой аналитики: {error.message}
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
          📊 Финансовая аналитика затрат на СИ
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
            <InputLabel id="month-select-label">Период</InputLabel>
            <Select
              labelId="month-select-label"
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
            <InputLabel id="year-select-label">Год</InputLabel>
            <Select
              labelId="year-select-label"
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
          {/* ================= КАРТОЧКИ KPI (ФИЛЬТРУЮТСЯ ПО ГОДУ ИЛИ МЕСЯЦУ) ================= */}
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
                  ЗАТРАТЫ ЗА ВЫБРАННЫЙ ПЕРИОД
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}
                >
                  {totalSpent.toLocaleString('ru-RU')} ₽
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                boxShadow: 3,
                borderLeft: '6px solid',
                borderColor: 'primary.main',
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600 }}
                >
                  ЛИДЕР ПО РАСХОДАМ (ЮРЛИЦО)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {topCompany}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                boxShadow: 3,
                borderLeft: '6px solid',
                borderColor: 'secondary.main',
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600 }}
                >
                  САМЫЙ ДОРОГОЙ УЧАСТОК ЗАВОДА
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    mt: 1.5,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {topSite}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* ================= ЛИНЕЙНЫЙ ТРЕНД ЗА ПОЛНЫЙ ГОД (С ЗАЩИТОЙ ДЕКАБРЯ) ================= */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 3, p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1, pl: 1 }}
              >
                📈 Сезонность и динамика расходов по месяцам
              </Typography>
              <Box sx={{ width: '100%', height: isMobile ? 220 : 300 }}>
                <LineChart
                  xAxis={[{ data: MONTHS_LABELS, scaleType: 'point' }]}
                  series={[
                    {
                      data: lineChartData,
                      label: 'Затраты (₽)',
                      color: '#2e7d32',
                      area: !isMobile,
                    },
                  ]}
                  height={isMobile ? 220 : 300}
                  // Расширяем правый margin на мобилках до 40, чтобы сдвинуть график влево и спасти "Дек"
                />
              </Box>
            </Card>
          </Grid>
          {/* ================= АДАПТИВНЫЕ СРЕЗЫ СТРУКТУРЫ ЗАВОДА ================= */}

          {/* СРЕЗ 1: ГЕОГРАФИЯ (ГОРОДА) */}

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
                🗺️ Распределение расходов по Географии (Городам)
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <MobileProgressList data={cityPieData} total={totalSpent} />
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
                🏢 Распределение расходов по Организациям (Юридическим лицам)
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <MobileProgressList data={companyPieData} total={totalSpent} />
              </Box>
            </Card>
          </Grid>

          {/* СРЕЗ 3: ЦЕХА/УЧАСТКИ (С АВТОЗАЩИТОЙ ОТ ПЕРЕНАСЫЩЕНИЯ) */}

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
                  🏭 Финансовый рейтинг Цехов завода (по долям затрат на СИ)
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Всего участков с затратами за период: {sitePieData.length} шт.
                </Typography>
              </Box>

              {sitePieData.length === 0 ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic' }}
                  >
                    Нет финансовых данных по цехам за этот период
                  </Typography>
                </Box>
              ) : (
                // На десктопе для общего рейтинга цехов разрешаем развернуться в полную длину
                <MobileProgressList
                  data={sitePieData}
                  total={totalSpent}
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
// 🌟 ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ КРАСИВОГО МОБИЛЬНОГО ВЫВОДА (БЕЗ ГРАФИКОВ)
// =========================================================================
function MobileProgressList({
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
          Нет финансовых данных за этот период
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
                {item.value.toLocaleString('ru-RU')} ₽ ({percentage.toFixed(1)}
                %)
              </Typography>
            </Box>
            {/* Полоска прогресса доли затрат на СИ */}
            <LinearProgress
              variant="determinate"
              value={percentage}
              color="success"
              sx={{ height: 6, borderRadius: 2, bgcolor: 'grey.100' }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
