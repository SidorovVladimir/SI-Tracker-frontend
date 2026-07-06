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
  Divider,
} from '@mui/material';
import { LineChart } from '@mui/x-charts';
import {
  GetFinancialAnalyticsDocument,
  GetVerificationRisksDocument,
} from '../graphql/types/__generated__/graphql';
import { RiskHeatMap } from '../components/RiskHeatMap';
import { PriceHistoryTrend } from '../components/PriceHistoryTrend';

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

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const { data, loading, error } = useQuery(GetFinancialAnalyticsDocument, {
    variables: {
      year: selectedYear,
      month: selectedMonth === 0 ? null : selectedMonth,
    },
    fetchPolicy: 'network-only',
  });

  const { data: riskData } = useQuery(GetVerificationRisksDocument, {
    fetchPolicy: 'network-only',
  });

  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);

  const response = data?.getFinancialAnalytics;
  const totalSpent = response?.totalSpent || 0;
  const topServicesList = useMemo(() => {
    // Извлекаем массив цехов из РЕАЛЬНОГО ответа вашего сервера
    const sites = response?.byProductionSites || [];

    // Автоматически выбираем первый цех, чтобы график не был пустым при загрузке
    if (sites.length > 0 && !activeSiteId) {
      setActiveSiteId(sites[0].siteId);
    }

    return sites;
  }, [response, activeSiteId]);

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
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [response]);

  const companyPieData = useMemo(() => {
    return (response?.byCompanies || [])
      .map((item, idx) => ({
        id: idx,
        value: item.amount,
        label: item.companyName.toUpperCase(),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [response]);

  const sitePieData = useMemo(() => {
    return (response?.byProductionSites || [])
      .map((item, idx) => ({
        id: idx,
        value: item.amount,
        label: item.fullSiteLabel,
      }))
      .filter((item) => item.value > 0)
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
      sx={{
        py: 3,
        px: { xs: 1.5, sm: 2, md: 3 },
        height: 'auto', // ✅ Исправление: убираем жесткий 100dvh, ликвидируя двойной скролл
        minHeight: '100vh',
      }}
    >
      {/* ================= ВЕРХНЯЯ ШАПКА И ДВА СЕЛЕКТОРОВ (ГОД + МЕСЯЦ) ================= */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          📊 Финансовая аналитика затрат на СИ
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {/* Селектор месяца */}
          <FormControl size="small" sx={{ minWidth: 140, flexGrow: 1 }}>
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
          <FormControl size="small" sx={{ minWidth: 110, flexGrow: 1 }}>
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
          <Grid size={{ xs: 12 }}>
            <RiskHeatMap data={riskData} />
          </Grid>
          {/* ================= КАРТОЧКИ KPI (ФИЛЬТРУЮТСЯ ПО ГОДУ ИЛИ МЕСЯЦУ) ================= */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                boxShadow: 2,
                borderLeft: '6px solid',
                borderColor: 'success.main',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600, letterSpacing: '0.5px' }}
                >
                  ЗАТРАТЫ ЗА ВЫБРАННЫЙ ПЕРИОД
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mt: 0.5,
                    color: 'success.main',
                    fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  }}
                >
                  {totalSpent.toLocaleString('ru-RU')} ₽
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                boxShadow: 2,
                borderLeft: '6px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600, letterSpacing: '0.5px' }}
                >
                  ЛИДЕР ПО РАСХОДАМ (ЮРЛИЦО)
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mt: 0.5,
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
                boxShadow: 2,
                borderLeft: '6px solid',
                borderColor: 'secondary.main',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 600, letterSpacing: '0.5px' }}
                >
                  САМЫЙ ДОРОГОЙ УЧАСТОК ЗАВОДА
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {topSite}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* ================= ЛИНЕЙНЫЙ ТРЕНД ЗА ПОЛНЫЙ ГОД ================= */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 2, p: 2, borderRadius: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1, pl: 0.5 }}
              >
                📈 Сезонность и динамика расходов по месяцам
              </Typography>
              <Box
                sx={{ width: '100%', height: { xs: 200, sm: 280, md: 320 } }}
              >
                <LineChart
                  xAxis={[{ data: MONTHS_LABELS, scaleType: 'point' }]}
                  series={[
                    {
                      data: lineChartData,
                      label: 'Затраты (₽)',
                      color: '#2e7d32',
                      area: true,
                    },
                  ]}
                  // ✅ Безопасные отступы: расширяем margin слева/справа, чтобы "Янв" и "Дек" не обрезались на смартфонах
                  margin={{ top: 20, bottom: 30, left: 55, right: 25 }}
                />
              </Box>
            </Card>
          </Grid>
          {/* ================= АДАПТИВНЫЕ СРЕЗЫ СТРУКТУРЫ ЗАВОДА ================= */}

          {/* СРЕЗ 1: ГЕОГРАФИЯ (ГОРОДА) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                boxShadow: 2,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
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
                boxShadow: 2,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
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
            <Card sx={{ boxShadow: 2, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
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
                <MobileProgressList
                  data={sitePieData}
                  total={totalSpent}
                  isFullWidth={true}
                />
              )}
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                boxShadow: 2,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    📈 Анализ изменения стоимости обслуживания объектов
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Выберите цех холдинга для просмотра тренда затрат по годам и
                    ЦСМ
                  </Typography>
                </Box>

                {/* Селектор выбора площадки — работает строго на ваших типах */}
                <FormControl
                  size="small"
                  sx={{ minWidth: { xs: '100%', sm: 320 } }}
                >
                  <InputLabel id="inflation-site-label">
                    Цех / Участок завода
                  </InputLabel>
                  <Select
                    labelId="inflation-site-label"
                    value={activeSiteId || ''}
                    label="Цех / Участок завода"
                    onChange={(e) => setActiveSiteId(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 280, // Фиксированная высота окна в пикселях
                          borderRadius: 2, // Скругления под дизайн-код
                          boxShadow: 3,
                          '& .MuiMenuItem-root': {
                            fontSize: '0.85rem', // Чуть компактнее шрифт на мобилках
                            py: 1.2,
                          },
                        },
                      },
                    }}
                  >
                    {topServicesList.map((site: any) => (
                      <MenuItem key={site.siteId} value={site.siteId}>
                        {site.fullSiteLabel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

              {/* Рендерим график инфляции по выбранной площадке */}
              {activeSiteId ? (
                // ✅ Исправление: передаем siteId вместо старого matchHistorySku
                <PriceHistoryTrend siteId={activeSiteId} />
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic', textAlign: 'center', py: 4 }}
                >
                  Нет доступных объектов для анализа затрат за этот период
                </Typography>
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
                gap: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  wordBreak: 'break-word',
                  maxWidth: '70%',
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
