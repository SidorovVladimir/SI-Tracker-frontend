import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useQuery } from '@apollo/client/react';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import {
  GetBudgetMatrixDocument,
  GetCompaniesDocument,
  GetProductionSitesDocument,
  GetSitiesDocument,
} from '../graphql/types/__generated__/graphql';
import PageHelpButton from '../components/PageHelpButton';

const MONTH_NAMES = [
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

export const BudgetPlanningPage: React.FC = () => {
  // Базовые стейты параметров отчета
  const [targetYear, setTargetYear] = useState<number>(
    new Date().getFullYear() + 1
  );
  const [groupBy, setGroupBy] = useState<'COMPANY' | 'CITY' | 'SITE'>('SITE');

  // Стейты многоуровневых каскадных фильтров
  const [companyId, setCompanyId] = useState<string>('ALL');
  const [cityId, setCityId] = useState<string>('ALL');
  const [siteId, setSiteId] = useState<string>('ALL');

  // 🔥 АВТОМАТИЧЕСКИЙ КАСКАДНЫЙ СБРОС СТЕЙТОВ ФИЛЬТРОВ
  useEffect(() => {
    setCityId('ALL');
    setSiteId('ALL');
  }, [companyId]);

  useEffect(() => {
    setSiteId('ALL');
  }, [cityId]);

  // Загрузка справочников для выпадающих списков панели фильтров
  const { data: cosData } = useQuery(GetCompaniesDocument);
  const { data: citsData } = useQuery(GetSitiesDocument);
  const { data: sitesData } = useQuery(GetProductionSitesDocument);

  const companiesList = cosData?.companies ?? [];
  const citiesList = citsData?.cities ?? [];
  const sitesList = sitesData?.productionSites ?? [];

  const { data: budgetData, loading: budgetLoading } = useQuery(
    GetBudgetMatrixDocument,
    {
      variables: {
        targetYear,
        groupBy,
        companyId: companyId === 'ALL' ? null : companyId,
        cityId: cityId === 'ALL' ? null : cityId,
        siteId: siteId === 'ALL' ? null : siteId,
      },
      fetchPolicy: 'network-only',
    }
  );

  const matrixResponse = budgetData?.getBudgetMatrix;
  const budgetRows = matrixResponse?.rows ?? [];
  const grandTotal = matrixResponse?.grandTotal ?? 0;

  const getMonthCost = (months: any[], monthNum: number) => {
    return months.find((m: any) => m.month === monthNum)?.totalCost ?? 0;
  };

  const calculateTotalByMonth = (monthNum: number) => {
    return budgetRows.reduce(
      (sum, row) => sum + getMonthCost(row.months, monthNum),
      0
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 4 },
        bgcolor: 'grey.50',
        minHeight: 'auto',
      }}
    >
      {/* ПАНЕЛЬ ЗАГОЛОВКА */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 2,
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
            }}
          >
            <AccountBalanceWalletIcon color="primary" /> Матрица годовых затрат
            СИ
          </Typography>
          <PageHelpButton />
        </Stack>

        <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
          <InputLabel>Год планирования</InputLabel>
          <Select
            value={targetYear}
            label="Год планирования"
            onChange={(e) => setTargetYear(Number(e.target.value))}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              fontWeight: 'bold',
            }}
          >
            {[0, 1, 2, 3].map((offset) => {
              const y = new Date().getFullYear() + offset;
              return (
                <MenuItem key={y} value={y}>
                  📅 {y} год
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      {/* БЛОК КАСКАДНЫХ ФИЛЬТРОВ АНАЛИТИКИ */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 3,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.01)',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BusinessIcon fontSize="small" /> Фильтры и уровни группировки ЦФО
          </Typography>

          <Grid container spacing={1.5}>
            {/* Выбор группировки отчета */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Группировать отчет по</InputLabel>
                <Select
                  value={groupBy}
                  label="Группировать отчет по"
                  onChange={(e: any) => setGroupBy(e.target.value)}
                >
                  <MenuItem value="COMPANY">🏢 По Компаниям</MenuItem>
                  <MenuItem value="CITY">📍 По Городам</MenuItem>
                  <MenuItem value="SITE">🏭 По Площадкам</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Фильтр: Компания */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Компания</InputLabel>
                <Select
                  value={companyId}
                  label="Компания"
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <MenuItem value="ALL">Все компании</MenuItem>
                  {companiesList.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Фильтр: Город (зависит от компании) */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl
                fullWidth
                size="small"
                disabled={companyId === 'ALL'}
              >
                <InputLabel>Город</InputLabel>
                <Select
                  value={cityId}
                  label="Город"
                  onChange={(e) => setCityId(e.target.value)}
                >
                  <MenuItem value="ALL">Все города</MenuItem>
                  {citiesList.map((cit) => (
                    <MenuItem key={cit.id} value={cit.id}>
                      {cit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Фильтр: Производственная площадка (зависит от компании и города) */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={cityId === 'ALL'}>
                <InputLabel>Произв. площадка</InputLabel>
                <Select
                  value={siteId}
                  label="Произв. площадка"
                  onChange={(e) => setSiteId(e.target.value)}
                >
                  <MenuItem value="ALL">Все площадки</MenuItem>
                  {sitesList
                    .filter(
                      (s) => s.companyId === companyId && s.cityId === cityId
                    )
                    .map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* РАБОЧАЯ ОБЛАСТЬ МАТРИЦЫ С АДАПТИВНЫМ ОТОБРАЖЕНИЕМ */}
      <Box sx={{ position: 'relative' }}>
        {budgetLoading && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              bgcolor: 'rgba(255,255,255,0.7)',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 3,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {/* 🖥️ ДЕСКТОПНАЯ ВЕРСИЯ: Таблица с замороженной первой колонкой ЦФО */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: '0px 2px 8px rgba(0,0,0,0.02)',
              overflowX: 'auto',
              maxHeight: { xs: 'auto', md: 'calc(100vh - 260px)' },
              overflowY: 'auto',
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      py: 1.5,
                      minWidth: 260,
                      position: 'sticky',
                      left: 0,
                      bgcolor: 'grey.100',
                      zIndex: 3,
                    }}
                  >
                    {groupBy === 'COMPANY' && 'Наименование юридического лица'}
                    {groupBy === 'CITY' && 'Географический регион (Город)'}
                    {groupBy === 'SITE' &&
                      'Производственная площадка / Участок'}
                  </TableCell>
                  {MONTH_NAMES.map((name) => (
                    <TableCell
                      key={name}
                      align="right"
                      sx={{ fontWeight: 800, bgcolor: 'grey.100', zIndex: 1 }}
                    >
                      {name}
                    </TableCell>
                  ))}
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 120,
                      position: 'sticky',
                      right: 0,
                      zIndex: 3,
                    }}
                  >
                    Итого, ₽
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {budgetRows.length === 0 && !budgetLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      align="center"
                      sx={{ p: 4, color: 'text.disabled', fontStyle: 'italic' }}
                    >
                      Ни один прибор не требует поверки в {targetYear} году по
                      выбранным критериям.
                    </TableCell>
                  </TableRow>
                ) : (
                  budgetRows.map((row) => (
                    <TableRow key={row.rowId} hover>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          py: 1.2,
                          position: 'sticky',
                          left: 0,
                          bgcolor: 'background.paper',
                          zIndex: 2,
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                        }}
                      >
                        {row.rowName || '—'}
                      </TableCell>

                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (monthNum) => {
                          const cost = getMonthCost(row.months, monthNum);
                          return (
                            <TableCell
                              key={monthNum}
                              align="right"
                              sx={{
                                color:
                                  cost > 0 ? 'text.primary' : 'text.disabled',
                                fontWeight: cost > 0 ? 600 : 400,
                              }}
                            >
                              {cost > 0 ? cost.toLocaleString('ru-RU') : '—'}
                            </TableCell>
                          );
                        }
                      )}

                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          bgcolor: 'rgba(25, 118, 210, 0.04)',
                          color: 'primary.main',
                          position: 'sticky',
                          right: 0,
                          zIndex: 2,
                          borderLeft: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {row.totalYearCost?.toLocaleString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))
                )}

                {budgetRows.length > 0 && (
                  <TableRow
                    sx={{
                      bgcolor: 'grey.100',
                      '& .MuiTableCell-root': { borderBottom: 'none' },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        py: 1.5,
                        position: 'sticky',
                        left: 0,
                        bgcolor: 'grey.100',
                        zIndex: 2,
                      }}
                    >
                      ИТОГО ПО КРИТЕРИЯМ:
                    </TableCell>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (monthNum) => {
                        const monthTotal = calculateTotalByMonth(monthNum);
                        return (
                          <TableCell
                            key={monthNum}
                            align="right"
                            sx={{
                              fontWeight: 800,
                              color:
                                monthTotal > 0
                                  ? 'success.main'
                                  : 'text.disabled',
                            }}
                          >
                            {monthTotal > 0
                              ? monthTotal.toLocaleString('ru-RU')
                              : '—'}
                          </TableCell>
                        );
                      }
                    )}
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 900,
                        bgcolor: 'primary.dark',
                        color: 'white',
                        fontSize: '0.85rem',
                        position: 'sticky',
                        right: 0,
                        zIndex: 2,
                      }}
                    >
                      {grandTotal?.toLocaleString('ru-RU')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ: Компактный список карточек ЦФО с фильтрацией пустых месяцев */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {budgetRows.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                color: 'text.secondary',
                fontStyle: 'italic',
                borderRadius: 3,
              }}
            >
              Ни один прибор не требует поверки в {targetYear} году.
            </Paper>
          ) : (
            budgetRows.map((row) => (
              <Paper
                key={row.rowId}
                variant="outlined"
                sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper' }}
              >
                {/* Шапка карточки ЦФО */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      textTransform: 'uppercase',
                      lineHeight: 1.3,
                    }}
                  >
                    {row.rowName || '—'}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', fontWeight: 'bold' }}
                    >
                      ИТОГО ЗА ГОД:
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'black',
                        color: 'primary.main',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.totalYearCost?.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                {/* Выводим ТОЛЬКО те месяцы, в которых есть реальные плановые затраты */}
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1)
                    .filter(
                      (monthNum) => getMonthCost(row.months, monthNum) > 0
                    )
                    .map((monthNum) => {
                      const cost = getMonthCost(row.months, monthNum);
                      return (
                        <Grid key={monthNum} size={{ xs: 6, sm: 4 }}>
                          <Box
                            sx={{
                              bgcolor: 'grey.50',
                              p: 1,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'grey.200',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ fontWeight: 'bold' }}
                            >
                              {MONTH_NAMES[monthNum - 1].toUpperCase()}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 'bold',
                                color: 'text.primary',
                                fontFamily: 'monospace',
                              }}
                            >
                              {cost.toLocaleString('ru-RU')} ₽
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}

                  {row.months.every((m: any) => m.totalCost === 0) && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic', pl: 1 }}
                    >
                      Распределение по месяцам отсутствует
                    </Typography>
                  )}
                </Grid>
              </Paper>
            ))
          )}

          {/* Плавающий виджет глобального итога для мобильной версии */}
          {budgetRows.length > 0 && (
            <Paper
              variant="elevation"
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'primary.dark',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 3,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                ОБЩИЙ СВОДНЫЙ ИТОГ:
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'black', fontFamily: 'monospace' }}
              >
                {grandTotal?.toLocaleString('ru-RU')} ₽
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};
