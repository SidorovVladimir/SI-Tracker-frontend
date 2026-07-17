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
  Tabs,
  Tab,
} from '@mui/material';
import {
  GetProductionAnalyticsDocument,
  GetVerificationRisksDocument, // 🌟 Добавлено для подтягивания светофоров рисков
} from '../graphql/types/__generated__/graphql';
import { RiskHeatMap } from '../components/RiskHeatMap';

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
  // 🌟 Состояние активного таба (0 - Выработка, 1 - Карта рисков)
  const [activeTab, setActiveTab] = useState<number>(0);

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Сетевой GraphQL-запрос количественного учета в штуках (Вкладка 1)
  const { data, loading, error } = useQuery(GetProductionAnalyticsDocument, {
    variables: {
      year: selectedYear,
      month: selectedMonth === 0 ? null : selectedMonth,
    },
    fetchPolicy: 'network-only',
    skip: activeTab !== 0, // Пропускаем запрос, если открыт таб рисков
  });

  const {
    data: risksData,
    loading: risksLoading,
    error: risksError,
  } = useQuery(GetVerificationRisksDocument, {
    fetchPolicy: 'network-only',
    skip: activeTab !== 1,
  });

  const response = data?.getProductionAnalytics;

  // Главные количественные счетчики
  const totalVerified = response?.totalVerified || 0;
  const totalRejected = response?.totalRejected || 0;
  const totalCalibrated = response?.totalCalibrated || 0;
  const totalInspected = response?.totalInspected || 0;

  // --- 📐 1. Маппинг и фильтрация Цехов ---
  const siteProgressData = useMemo(() => {
    return (response?.byProductionSites || [])
      .map((item, idx) => ({ id: idx, value: item.count, label: item.label }))
      .filter((item) => item.value > 0);
  }, [response]);

  // --- 📐 2. Маппинг и фильтрация ЮРЛИЦ ---
  const companyProgressData = useMemo(() => {
    return (response?.byCompanies || [])
      .map((item, idx) => ({ id: idx, value: item.count, label: item.label }))
      .filter((item) => item.value > 0);
  }, [response]);

  // --- 📐 3. Маппинг и фильтрация Географии ---
  const cityProgressData = useMemo(() => {
    return (response?.byCities || [])
      .map((item, idx) => ({ id: idx, value: item.count, label: item.label }))
      .filter((item) => item.value > 0);
  }, [response]);

  if (error || (activeTab === 1 && risksError)) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Ошибка сбора производственной аналитики:{' '}
          {error?.message || risksError?.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 3, height: 'calc(100dvh - 100px)', overflowY: 'auto' }}
    >
      {/* ================= ВЕРХНЯЯ ШАПКА НАЗВАНИЯ СТРАНИЦЫ ================= */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ width: isMobile ? '100%' : 'auto' }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              lineHeight: 1.3,
            }}
          >
            📋 Производственный мониторинг и объемы СИ
          </Typography>
        </Stack>

        {/* 🌟 СУЖЕНИЕ ФИЛЬТРОВ: Селекторы периодов горят только на первом табе! */}
        {activeTab === 0 && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
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
        )}
      </Box>

      {/* 🌟 ВНЕДРЕНИЕ СЕТКИ ВКЛАДОК (TABS) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
          }}
        >
          <Tab
            label="📊 Выработка и объемы работ"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            label="🚦 Светофор и карта рисков просрочек"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      {/* ========================================================================= */}
      {/* 📊 ВКЛАДКА 1: ВЫРАБОТКА И КОЛИЧЕСТВЕННЫЕ СЧЕТЧИКИ (ОБЪЕМЫ)              */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* ================= КАРТОЧКИ KPI (ШТУКИ СИ) ================= */}
              {/* 1. УСПЕШНО ПОВЕРЕНО */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderLeft: '6px solid',
                    borderColor: 'success.main',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      sx={{ fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      УСПЕШНО ПОВЕРЕНО
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mt: 1,
                        color: 'success.main',
                        fontSize: { xs: '1.4rem', sm: '2rem' },
                      }}
                    >
                      {totalVerified.toLocaleString('ru-RU')}{' '}
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'text.secondary',
                        }}
                      >
                        шт.
                      </Box>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 2. ПРОШЛИ КАЛИБРОВКУ */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderLeft: '6px solid',
                    borderColor: 'info.main',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      sx={{ fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      ПРОШЛИ КАЛИБРОВКУ
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mt: 1,
                        color: 'info.main',
                        fontSize: { xs: '1.4rem', sm: '2rem' },
                      }}
                    >
                      {totalCalibrated.toLocaleString('ru-RU')}{' '}
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'text.secondary',
                        }}
                      >
                        шт.
                      </Box>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 3. ПРОШЛИ ОСМОТР */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderLeft: '6px solid',
                    borderColor: 'warning.main',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      sx={{ fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      ВНУТРЕННИЙ ОСМОТР
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mt: 1,
                        color: 'warning.dark',
                        fontSize: { xs: '1.4rem', sm: '2rem' },
                      }}
                    >
                      {totalInspected.toLocaleString('ru-RU')}{' '}
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'text.secondary',
                        }}
                      >
                        шт.
                      </Box>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 4. ЗАБРАКОВАНО */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderLeft: '6px solid',
                    borderColor: 'error.main',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      sx={{ fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      ЗАБРАКОВАНО (БРАК)
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mt: 1,
                        color: 'error.main',
                        fontSize: { xs: '1.4rem', sm: '2rem' },
                      }}
                    >
                      {totalRejected.toLocaleString('ru-RU')}{' '}
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'text.secondary',
                        }}
                      >
                        шт.
                      </Box>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {/* ================= 🗺️ ГОРИЗОНТАЛЬНЫЕ РЕЙТИНГИ ОБЪЕМОВ В ШТУКАХ ================= */}
              {/* СРЕЗ 1: ГОРОДА */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    boxShadow: 3,
                    p: { xs: 2, md: 3 },
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: 'text.primary',
                      letterSpacing: '0.3px',
                    }}
                  >
                    🗺️ Метрологический объем по Географии (Городам)
                  </Typography>
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
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
                    p: { xs: 2, md: 3 },
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: 'text.primary',
                      letterSpacing: '0.3px',
                    }}
                  >
                    🏢 Метрологический объем по Организациям (ЮЛ)
                  </Typography>
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
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

              {/* СРЕЗ 3: ПОЛНЫЙ РЕЙТИНГ ЦЕХОВ ЗАВОДА */}
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{ boxShadow: 3, p: { xs: 2, md: 3 }, borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        letterSpacing: '0.3px',
                      }}
                    >
                      🏭 Производственная выработка цехов холдинга
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: 700,
                        bgcolor: 'grey.100',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                      }}
                    >
                      Активных участков: {siteProgressData.length} шт.
                    </Typography>
                  </Box>

                  {siteProgressData.length === 0 ? (
                    <Box
                      sx={{ py: 6, display: 'flex', justifyContent: 'center' }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        Нет данных о метрологических операциях за выбранный
                        период
                      </Typography>
                    </Box>
                  ) : (
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
        </>
      )}

      {/* ========================================================================= */}
      {/* 🚦 ВКЛАДКА 2: ОПЕРАТИВНАЯ КАРТА РИСКОВ И СВЕТОФОР ПРОСРОЧЕК               */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Box sx={{ width: '100%' }}>
          <Card
            sx={{
              boxShadow: 3,
              p: { xs: 2, md: 3 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  letterSpacing: '0.3px',
                }}
              >
                🚦 Оперативный мониторинг надежности и просрочек парка СИ
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}
              >
                Данные отображают текущий статус приборов на сегодняшний день.
                Красная зона — поверка просрочена, Желтая зона — до окончания
                поверки осталось менее 30 дней. Месячные фильтры выработки здесь
                не применяются.
              </Typography>
            </Box>

            {risksLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <RiskHeatMap data={risksData} />
              </Box>
            )}
          </Card>
        </Box>
      )}
    </Container>
  );
}

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
                  textTransform: 'uppercase',
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
            <LinearProgress
              variant="determinate"
              value={percentage}
              color="info"
              sx={{ height: 6, borderRadius: 2, bgcolor: 'grey.100' }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
