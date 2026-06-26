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
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation, useQuery } from '@apollo/client/react';

import { MatchMethodChip } from '../components/MatchMethodChip';
import { InlinePriceEdit } from '../components/InlinePriceEdit';
import {
  ApproveBudgetPlanDocument,
  GetBudgetPlanItemsDocument,
  UpdateBudgetPlanItemPriceDocument,
  GetCompaniesDocument,
  GetSitiesDocument,
  GetProductionSitesDocument,
} from '../graphql/types/__generated__/graphql';

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

  const [filters, setFilters] = useState<BudgetFilterState>(initialFilters);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

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

      // Сбрасываем зависимые участки, если поменялся город или компания холдинга
      if (field === 'cityId' || field === 'companyId') {
        updated.productionSiteId = '';
      }
      return updated;
    });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // 4. Основной запрос строк бюджета на основе UUID-инпутов
  const { data, loading, error, refetch } = useQuery(
    GetBudgetPlanItemsDocument,
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

  // Мемоизация результатов строго от бэкенда
  const planItems = useMemo(() => data?.budgetPlanItems.items || [], [data]);
  const totalCount = useMemo(
    () => data?.budgetPlanItems.totalCount || 0,
    [data]
  );
  const totalCostFiltered = useMemo(
    () => data?.budgetPlanItems.totalCostAll || 0,
    [data]
  );

  const handleUpdatePrice = async (itemId: string, newPrice: number) => {
    await updatePrice({
      variables: { input: { itemId, manualPrice: newPrice } },
    });
    refetch();
  };

  const handleApproveBudget = async () => {
    if (
      window.confirm(
        'Вы уверены, что хотите утвердить бюджет? Это действие заморозит цены прошлых лет намертво.'
      )
    ) {
      await approveBudget({ variables: { id: id || '' } });
      navigate('/budget/plans');
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
    <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
      {/* Шапка с живым динамическим расчетом бюджета от Postgres */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 2,
          bgcolor: 'background.paper',
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
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
            >
              🎯 Планирование бюджета
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Выбрано позиций: <strong>{totalCount} шт.</strong>
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontWeight: 'medium' }}
            >
              ПЛАНОВАЯ СУММА С НДС:
            </Typography>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{ fontWeight: 'black', color: 'primary.main' }}
            >
              {totalCostFiltered.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
              })}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="success"
            size={isMobile ? 'medium' : 'large'}
            startIcon={<LockIcon />}
            onClick={handleApproveBudget}
            sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
          >
            Утвердить
          </Button>
        </Box>
      </Paper>

      {/* Компактная панель фильтров ЦФО строго на UUID */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}
      >
        <Stack
          direction={isMobile ? 'column' : 'row'}
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
            sx={{ minWidth: isMobile ? '100%' : 140, flex: 1 }}
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
            sx={{ minWidth: isMobile ? '100%' : 160, flex: 1 }}
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
            sx={{ minWidth: isMobile ? '100%' : 180, flex: 1 }}
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
            sx={{ minWidth: isMobile ? '100%' : 220, flex: 1.5 }}
          />

          {/* 📊 ФИЛЬТР МЕТОДА МЭТЧИНГА */}
          <TextField
            select
            label="Статус цены"
            size="small"
            value={filters.matchMethod}
            onChange={(e) => handleFilterChange('matchMethod', e.target.value)}
            sx={{ minWidth: isMobile ? '100%' : 150, flex: 1 }}
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
            <MenuItem key="model_exact" value="model_exact">
              По модели
            </MenuItem>
            <MenuItem key="text_fuzzy" value="text_fuzzy">
              Полнотекстовый
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
                minWidth: isMobile ? '100%' : 'auto',
              }}
            >
              ❌ Сбросить
            </Button>
          )}
        </Stack>
      </Paper>
      {/* Рабочая область таблицы с оверлеем загрузки */}
      <Box sx={{ position: 'relative' }}>
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
              borderRadius: 2,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Наименование оборудования
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Модель / Тип</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Заводской № / ГРСИ
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Статус мэтчинга
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Цена без НДС
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
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
                    sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}
                  >
                    Приборы по выбранным фильтрам не найдены.
                  </TableCell>
                </TableRow>
              ) : (
                planItems.map((item: any) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>
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
                        disabled={false}
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
          />
        </TableContainer>
      </Box>
    </Container>
  );
};
