import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Stack,
  useMediaQuery,
  useTheme,
  Divider,
  Dialog,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation, useQuery } from '@apollo/client/react';

import { MatchMethodChip } from '../components/MatchMethodChip';
import { InlinePriceEdit } from '../components/InlinePriceEdit';
import {
  ApproveBudgetPlanDocument,
  UpdateBudgetPlanItemPriceDocument,
  GetCompaniesDocument,
  GetSitiesDocument,
  GetProductionSitesDocument,
  GetBudgetPlanDetailsDocument,
} from '../graphql/types/__generated__/graphql';
import { ConfirmationDialog } from '../components/modals/ConfirmationDialog';
import { PriceHistoryTrend } from '../components/PriceHistoryTrend';
import PageHelpButton from '../components/PageHelpButton';

// 🎯 Переводим стейт фильтров на ID
interface BudgetFilterState {
  cityId: string;
  companyId: string;
  productionSiteId: string;
  matchMethod: string;
}

const initialFilters: BudgetFilterState = {
  cityId: '',
  companyId: '',
  productionSiteId: '',
  matchMethod: '',
};

export const BudgetPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const [filters, setFilters] = useState<BudgetFilterState>(initialFilters);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [trendSku, setTrendSku] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Загрузка глобальных UUID справочников локаций
  const { data: citiesData } = useQuery(GetSitiesDocument);
  const { data: companiesData } = useQuery(GetCompaniesDocument);
  const { data: productionSiteData } = useQuery(GetProductionSitesDocument);

  // 1. Мемоизация базовых справочников
  const cities = useMemo(() => {
    const raw = citiesData?.cities || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [citiesData]);

  const companies = useMemo(() => {
    const raw = companiesData?.companies || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [companiesData]);

  // 2. СТРОГИЙ КАСКАД ПО ID: Фильтруем участки по выбранным cityId и companyId
  const filteredProductionSites = useMemo(() => {
    const rawSites = productionSiteData?.productionSites || [];
    let filtered = rawSites;
    if (filters.cityId) {
      filtered = filtered.filter((site) => site.cityId === filters.cityId);
    }
    if (filters.companyId) {
      filtered = filtered.filter(
        (site) => site.companyId === filters.companyId
      );
    }
    return [...filtered].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  }, [productionSiteData, filters.cityId, filters.companyId]);

  // 3. Хэндлер изменения фильтров с автоматическим сбросом дочерних ID
  const handleFilterChange = (
    field: keyof BudgetFilterState,
    value: string
  ) => {
    setFilters((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'cityId' || field === 'companyId') {
        updated.productionSiteId = '';
      }
      return updated;
    });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // 4. Основной запрос строк бюджета на основе UUID-инпутов
  const { data, loading, error, refetch } = useQuery(
    GetBudgetPlanDetailsDocument,
    {
      variables: {
        budgetId: id || '',
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
        filter: {
          searchQuery: searchQuery || undefined,
          matchMethod: filters.matchMethod || undefined,
          city: filters.cityId || undefined,
          company: filters.companyId || undefined,
          productionSite: filters.productionSiteId || undefined,
        },
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    }
  );

  const [updatePrice] = useMutation(UpdateBudgetPlanItemPriceDocument);
  const [approveBudget] = useMutation(ApproveBudgetPlanDocument);

  const planItems = useMemo(() => data?.budgetPlanItems.items || [], [data]);
  const totalCount = useMemo(
    () => data?.budgetPlanItems.totalCount || 0,
    [data]
  );
  const totalCostFiltered = useMemo(
    () => data?.budgetPlanItems.totalCostAll || 0,
    [data]
  );

  const budgetStatus = useMemo(() => data?.budgetPlan?.status || '', [data]);
  const isApproved = budgetStatus === 'approved';

  const handleUpdatePrice = async (itemId: string, newPrice: number) => {
    await updatePrice({
      variables: { input: { itemId, manualPrice: newPrice } },
    });
    refetch();
  };

  const handleConfirmApprove = async () => {
    try {
      await approveBudget({ variables: { id: id || '' } });
      setApproveDialogOpen(false);
      navigate('/budget/plans');
    } catch (err: any) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <Alert severity="error">
        Ошибка загрузки строк бюджета: {error.message}
      </Alert>
    );
  }
  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: { xs: 2, md: 4 },
        mb: 4,
        px: { xs: 1, sm: 2 },
        position: 'relative',
      }}
    >
      {/* Шапка с живым динамическим расчетом бюджета от Postgres */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          bgcolor: 'background.paper',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={() => navigate('/budget/plans')}
              color="inherit"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 0.8,
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                🎯 Планирование бюджета
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Выбрано позиций: <strong>{totalCount} шт.</strong>
              </Typography>
            </Box>
          </Box>

          {/* 💻 ДЕСКТОПНАЯ КНОПКА ПОМОЩИ: Будет видна только на ПК */}
          {!isMobile && <PageHelpButton />}
        </Stack>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontWeight: 'medium' }}
            >
              ПЛАНОВАЯ СУММА С НДС:
            </Typography>
            <Typography
              variant={isMobile ? 'subtitle1' : 'h5'}
              sx={{
                fontWeight: 'black',
                color: 'primary.main',
                whiteSpace: 'nowrap',
              }}
            >
              {totalCostFiltered.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
              })}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color={isApproved ? 'success' : 'primary'}
            size={isMobile ? 'medium' : 'large'}
            startIcon={<LockIcon />}
            // Кнопка блокируется, если бюджет уже утвержден или идет загрузка
            disabled={isApproved || loading}
            onClick={() => setApproveDialogOpen(true)}
            sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
          >
            {isApproved ? 'Утвержден' : 'Утвердить'}
          </Button>
        </Box>
      </Paper>

      {/* Компактная панель фильтров ЦФО строго на UUID */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
        >
          {/* 🏙️ ФИЛЬТР ГОРОДА */}
          <TextField
            label="Город"
            size="small"
            select
            value={filters.cityId}
            onChange={(e) => handleFilterChange('cityId', e.target.value)}
            sx={{ minWidth: { xs: '100%', md: 140 }, flex: 1 }}
          >
            <MenuItem value="">
              <em>Все города</em>
            </MenuItem>
            {cities.map((city: any) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 🏢 ФИЛЬТР ОРГАНИЗАЦИИ */}
          <TextField
            label="Организация"
            size="small"
            select
            value={filters.companyId}
            onChange={(e) => handleFilterChange('companyId', e.target.value)}
            sx={{ minWidth: { xs: '100%', md: 160 }, flex: 1 }}
          >
            <MenuItem value="">
              <em>Все организации</em>
            </MenuItem>
            {companies.map((co: any) => (
              <MenuItem key={co.id} value={co.id}>
                {co.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 🏭 КАСКАДНЫЙ ФИЛЬТР УЧАСТКА */}
          <TextField
            label="Участок / Цех"
            size="small"
            select
            value={filters.productionSiteId}
            onChange={(e) =>
              handleFilterChange('productionSiteId', e.target.value)
            }
            disabled={filteredProductionSites.length === 0}
            sx={{ minWidth: { xs: '100%', md: 180 }, flex: 1 }}
          >
            <MenuItem value="">
              <em>Все участки</em>
            </MenuItem>
            {filteredProductionSites.map((site: any) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 🔍 ТЕКСТОВЫЙ ПОИСК */}
          <TextField
            label="Поиск по оборудованию"
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ minWidth: { xs: '100%', md: 220 }, flex: 1.5 }}
          />

          {/* 📊 ФИЛЬТР МЕТОДА МЭТЧИНГА */}
          <TextField
            select
            label="Статус цены"
            size="small"
            value={filters.matchMethod}
            onChange={(e) => handleFilterChange('matchMethod', e.target.value)}
            sx={{ minWidth: { xs: '100%', md: 150 }, flex: 1 }}
          >
            <MenuItem key="all" value="">
              Все статусы
            </MenuItem>
            <MenuItem key="grsi" value="grsi">
              По ГРСИ
            </MenuItem>
            <MenuItem key="csm_code" value="csm_code">
              По коду СИ
            </MenuItem>
            <MenuItem key="historical" value="historical">
              По истории
            </MenuItem>
            <MenuItem key="manual" value="manual">
              Ручной ввод
            </MenuItem>
            <MenuItem key="not_found" value="not_found">
              Не найдено
            </MenuItem>
          </TextField>

          {(filters.cityId ||
            filters.companyId ||
            filters.productionSiteId ||
            filters.matchMethod ||
            inputValue) && (
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={() => {
                setFilters(initialFilters);
                setInputValue('');
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                minWidth: { xs: '100%', md: 'auto' },
              }}
            >
              ❌ Сбросить
            </Button>
          )}
        </Stack>
      </Paper>
      {/* Рабочая область с изолированным скроллом и фиксированной пагинацией */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          // На десктопе задаем фиксированную высоту контейнера для изоляции скролла
          height: { xs: 'auto', md: 'calc(100vh - 320px)' },
          minHeight: { md: 450 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Матовый мягкий оверлей во время дозагрузки данных пагинации */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backdropFilter: 'blur(1px)',
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        {/* 1. КОНТЕНТНАЯ ЗОНА С СОБСТВЕННЫМ СКРОЛЛОМ */}
        <Box
          sx={{
            flexGrow: 1,
            // На десктопе контент скроллится внутри своего окна. На мобильных — обычный ленточный скролл страницы.
            overflowY: { xs: 'visible', md: 'auto' },
            p: { xs: 1.5, md: 0 },
          }}
        >
          {/* 🖥️ ДЕСКТОПНАЯ ВЕРСИЯ ТАБЛИЦЫ: Показывается только на md+ */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Box} sx={{ maxHeight: '100%' }}>
              <Table
                size="small"
                stickyHeader
                aria-label="budget details table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Наименование оборудования
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Модель / Тип
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Заводской № / ГРСИ
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                    >
                      Статус мэтчинга
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                    >
                      Цена без НДС
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}
                    >
                      Итого с НДС (20%)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{
                          py: 6,
                          color: 'text.secondary',
                          fontStyle: 'italic',
                        }}
                      >
                        Приборы по выбранным фильтрам не найдены.
                      </TableCell>
                    </TableRow>
                  ) : (
                    planItems.map((item: any) => (
                      <TableRow key={item.id} hover>
                        <TableCell
                          sx={{
                            fontWeight: 'medium',
                            // Делаем ячейку кликабельной
                            // cursor: 'pointer',
                            // '&:hover': {
                            //   color: 'primary.main',
                            //   textDecoration: 'underline',
                            // },
                          }}
                          // 🎯 При тапе передаем сгенерированный ключ в модальное окно
                          // onClick={() => {
                          //   setTrendSku(
                          //     item.matchHistorySku ||
                          //       `TEXT-${item.deviceName.replace(/\s+/g, '-')}`
                          //   );
                          // }}
                        >
                          {item.deviceName}
                        </TableCell>
                        <TableCell>{item.deviceModel}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            С/Н: {item.device?.serialNumber || '—'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            ГРСИ: {item.device?.grsiNumber || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <MatchMethodChip method={item.matchMethod} />
                        </TableCell>
                        <TableCell align="right">
                          <InlinePriceEdit
                            itemId={item.id}
                            initialPrice={Number(item.basePrice)}
                            // ✅ Теперь инпут заблокируется автоматически, если бюджет утвержден
                            disabled={isApproved}
                            onSave={(newPrice) =>
                              handleUpdatePrice(item.id, newPrice)
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 'bold', color: 'primary.main' }}
                        >
                          {Number(item.totalCost).toLocaleString('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ: Список карточек приборов вместо таблицы */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              gap: 1.5,
              pb: 7,
            }}
          >
            {planItems.length === 0 ? (
              <Paper
                variant="elevation"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  bgcolor: 'transparent',
                }}
              >
                Приборы по выбранным фильтрам не найдены.
              </Paper>
            ) : (
              planItems.map((item: any) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    {/* Превращаем текст в интерактивную кнопку-ссылку для вызова графика */}
                    <Typography
                      variant="subtitle2"
                      // onClick={() => {
                      //   setTrendSku(
                      //     item.matchHistorySku ||
                      //       `TEXT-${item.deviceName.replace(/\s+/g, '-')}`
                      //   );
                      // }}
                      sx={{
                        fontWeight: 'bold',
                        lineHeight: 1.3,
                        flexGrow: 1,
                        // cursor: 'pointer',
                        color: 'text.primary',
                        // '&:hover': {
                        //   color: 'primary.main',
                        //   textDecoration: 'underline',
                        // },
                      }}
                    >
                      {item.deviceName}
                    </Typography>
                    <MatchMethodChip method={item.matchMethod} />
                  </Box>

                  <Box
                    sx={{
                      mb: 1.5,
                      bgcolor: 'grey.50',
                      p: 1,
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Модель: <strong>{item.deviceModel || '—'}</strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Заводской №:{' '}
                      <strong>{item.device?.serialNumber || '—'}</strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Номер ГРСИ:{' '}
                      <strong>{item.device?.grsiNumber || '—'}</strong>
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 'bold' }}
                      >
                        ЦЕНА БЕЗ НДС:
                      </Typography>
                      <InlinePriceEdit
                        itemId={item.id}
                        initialPrice={Number(item.basePrice)}
                        // ✅ Точно так же блокируем и в мобильной версии карточки
                        disabled={isApproved}
                        onSave={(newPrice) =>
                          handleUpdatePrice(item.id, newPrice)
                        }
                      />
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 'bold', display: 'block' }}
                      >
                        ИТОГО С НДС (20%):
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {Number(item.totalCost).toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </Box>

        {/* 2. ПАНЕЛЬ ПАГИНАЦИИ (Статичная под окном на десктопе, липкая снизу на мобильном) */}
        <Box
          sx={{
            width: '100%',
            position: { xs: 'fixed', md: 'static' },
            bottom: { xs: 0, md: 'auto' },
            left: { xs: 0, md: 'auto' },
            right: { xs: 0, md: 'auto' },
            zIndex: 1000,
            bgcolor: 'background.paper',
            boxShadow: { xs: '0px -4px 16px rgba(0,0,0,0.08)', md: 'none' },
            borderTop: '1px solid',
            borderColor: 'divider',
            pb: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', md: 0 },
            pt: { xs: 0.5, md: 0 },
          }}
        >
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={paginationModel.pageSize}
            page={paginationModel.page}
            onPageChange={(_, newPage) =>
              setPaginationModel((prev) => ({ ...prev, page: newPage }))
            }
            onRowsPerPageChange={(e) =>
              setPaginationModel({
                page: 0,
                pageSize: parseInt(e.target.value, 10),
              })
            }
            labelRowsPerPage={isMobile ? 'Рядов:' : 'Строк на странице:'}
            labelDisplayedRows={({ from, to, count }) =>
              isMobile ? `${from}-${to}/${count}` : `${from}–${to} из ${count}`
            }
            sx={{
              bgcolor: 'transparent',
              borderTop: 'none',
              width: '100%',
              '& .MuiTablePagination-toolbar': {
                px: { xs: 1.5, md: 2 },
                flexWrap: 'nowrap',
                justifyContent: { xs: 'center', md: 'flex-end' },
                minHeight: 52,
                width: '100%',
              },
              // Скрываем распорщик на мобилках для центрирования
              '& .MuiTablePagination-spacer': {
                display: { xs: 'none', md: 'block' },
              },
              '& .MuiTablePagination-selectLabel': {
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.875rem',
                color: 'text.secondary',
              },
              '& .MuiTablePagination-select': { fontSize: '0.875rem' },
              '& .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
                mx: { xs: 0.5, md: 2 },
              },
              '& .MuiTablePagination-actions': {
                ml: { xs: 0.5, md: 2 },
                // 🎯 ВАЖНО: Сдвигаем стрелочки влево на мобилках, освобождая угол под парящую кнопку справки
                mr: { xs: '64px', sm: 0 },
                '& button': { p: { xs: 0.8, md: 1.2 }, color: 'primary.main' },
              },
            }}
          />
        </Box>
      </Box>
      <ConfirmationDialog
        open={approveDialogOpen}
        title="Утверждение годового бюджета"
        description="Вы уверены, что хотите утвердить бюджет? Это действие окончательно заморозит плановые цены, и их нельзя будет случайно изменить."
        confirmLabel="Утвердить"
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleConfirmApprove}
      />
      <Dialog
        open={Boolean(trendSku)}
        onClose={() => setTrendSku(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 }, // Скругления под общий дизайн-код
          },
        }}
      >
        <Box sx={{ bgcolor: 'background.paper' }}>
          {/* ✅ Исправление: передаем trendSku в проп siteId */}
          {trendSku && <PriceHistoryTrend siteId={trendSku} />}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
              pr: 2,
              pb: 1.5,
            }}
          >
            <Button
              onClick={() => setTrendSku(null)}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 1.5,
              }}
            >
              Закрыть
            </Button>
          </Box>
        </Box>
      </Dialog>
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
          <PageHelpButton />
        </Box>
      )}
    </Container>
  );
};
