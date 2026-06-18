import { useQuery } from '@apollo/client/react';
import {
  GetCompaniesDocument,
  GetDevicesWithRelationsListDocument,
  GetDevicesWithRelationsListQuery,
  GetMetrologyControlTypesListDocument,
  GetProductionSitesDocument,
  GetSitiesDocument,
  GetStatusListDocument,
} from '../graphql/types/__generated__/graphql';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Tooltip,
  Chip,
  Badge,
  Checkbox,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { formatDate } from '../utils/date';
import { useEffect, useMemo, useState } from 'react';
// import CreateDevicePage from './admin/CreateDevicePage';
import { useAuth } from '../hooks/useAuth';
// import DeviceCard from './DeviceCard';
// import EditDevicePage from './admin/EditDevicePage';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Add,
  Close,
  FilterAlt,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import React from 'react';
import { DeviceManageSidebar } from '../components/DeviceManageSidebar';
import { BarcodePrintModal } from '../components/BarcodePrintModal';

type Device =
  GetDevicesWithRelationsListQuery['devicesWithRelations']['items'][0];
const FILTERS_STORAGE_KEY = 'devices_filters_v1';
interface FilterState {
  city: string;
  company: string;
  productionSite: string;
  deviceName: string;
  serialNumber: string;
  status: string;
  metrologyControle: string;
  dateStart: string | null;
  dateEnd: string | null;
}

const initialFilters: FilterState = {
  city: '',
  company: '',
  productionSite: '',
  deviceName: '',
  serialNumber: '',
  status: '',
  metrologyControle: '',
  dateStart: null,
  dateEnd: null,
};

const loadFilters = (): FilterState => {
  const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialFilters;
};

export default function DevicesPage() {
  const { user } = useAuth();
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(() => {
    const saved = localStorage.getItem('devicesColumnVisibility');
    if (saved) {
      return JSON.parse(saved);
    }
  });

  const theme = useTheme();

  const isMobileOrLaptop = useMediaQuery(theme.breakpoints.down('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>(loadFilters);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const resetFilters = () => {
    setFilters(initialFilters);
    localStorage.removeItem(FILTERS_STORAGE_KEY);
  };

  // const handleFilterChange = (field: keyof FilterState, value: any) => {
  //   setFilters((prev) => ({ ...prev, [field]: value }));
  // };
  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'city') {
        updated.productionSite = '';
      }

      if (field === 'company') {
        updated.productionSite = '';
      }

      return updated;
    });
  };

  // const { data, loading } = useQuery(GetDevicesWithRelationsListDocument);
  const { data, loading, refetch } = useQuery(
    GetDevicesWithRelationsListDocument,
    {
      variables: {
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
        filter: {
          city: filters.city || undefined,
          company: filters.company || undefined,
          productionSite: filters.productionSite || undefined,
          deviceName: filters.deviceName || undefined,
          serialNumber: filters.serialNumber || undefined,
          status: filters.status || undefined,
          metrologyControle: filters.metrologyControle || undefined,
          dateStart: filters.dateStart || undefined,
          dateEnd: filters.dateEnd || undefined,
        },
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: productionSiteData } = useQuery(GetProductionSitesDocument);
  const { data: statusesData } = useQuery(GetStatusListDocument);

  const { data: metrologyControlTypeData } = useQuery(
    GetMetrologyControlTypesListDocument
  );

  const { data: companiesData } = useQuery(GetCompaniesDocument);
  const { data: citiesData } = useQuery(GetSitiesDocument);

  const rows = useMemo(() => {
    const response = data?.devicesWithRelations;
    return response?.items || [];
  }, [data]);

  const totalCountRaw = data?.devicesWithRelations?.totalCount;

  const rowCountRef = React.useRef(0);

  const rowCount = React.useMemo(() => {
    if (totalCountRaw !== undefined) {
      rowCountRef.current = totalCountRaw;
    }
    return rowCountRef.current;
  }, [totalCountRaw]);

  const cities = useMemo(() => {
    const raw = citiesData?.cities || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [citiesData]);

  const companies = useMemo(() => {
    const raw = companiesData?.companies || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [companiesData]);

  // const productionSite = useMemo(() => {
  //   const raw = productionSiteData?.productionSites || [];
  //   return Array.from(new Set(raw.map((p) => p.name).filter(Boolean))).sort();
  // }, [productionSiteData]);
  const productionSite = useMemo(() => {
    const rawSites = productionSiteData?.productionSites || [];

    // 2. Находим объект выбранного города
    const selectedCityObj = cities.find(
      (c) => c.name?.toLowerCase().trim() === filters.city?.toLowerCase().trim()
    );
    const targetCityId = selectedCityObj?.id?.toLowerCase().trim();

    // 3. Находим объект выбранной компании
    const selectedCompanyObj = companies.find(
      (co) =>
        co.name?.toLowerCase().trim() === filters.company?.toLowerCase().trim()
    );
    const targetCompanyId = selectedCompanyObj?.id?.toLowerCase().trim();

    // 4. Последовательно фильтруем массив площадок
    let filtered = rawSites;

    // Если город выбран — оставляем только участки, привязанные к этому cityId
    if (targetCityId) {
      filtered = filtered.filter(
        (site) => site.cityId?.toLowerCase().trim() === targetCityId
      );
    }

    // Если компания выбрана — дополнительно фильтруем по companyId
    if (targetCompanyId) {
      filtered = filtered.filter(
        (site) => site.companyId?.toLowerCase().trim() === targetCompanyId
      );
    }

    // 5. Собираем массив уникальных текстовых названий и сортируем их
    const uniqueNames = Array.from(
      new Set(filtered.map((p) => p.name).filter(Boolean))
    );

    return uniqueNames.sort((a, b) => a.localeCompare(b));

    // Оставляем зависимости для мгновенного пересчета в браузере
  }, [productionSiteData, filters.city, filters.company, cities, companies]);

  const statuses = useMemo(() => {
    const raw = statusesData?.statuses || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [statusesData]);

  const metrologyControleTypes = useMemo(() => {
    const raw = metrologyControlTypeData?.metrologyControlTypes || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [metrologyControlTypeData]);

  const [viewMode, setViewMode] = useState<'info' | 'create' | 'edit' | null>(
    null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const columns: GridColDef[] = [
    {
      field: 'city',
      headerName: 'Город',
      flex: 1,
      minWidth: 100,
      valueGetter: (_, row) =>
        row?.productionSite?.city?.name?.toUpperCase() ?? '-',
    },
    {
      field: 'company',
      headerName: 'Организация',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) =>
        row?.productionSite?.company?.name.toUpperCase() ?? '-',
    },
    {
      field: 'productionSite',
      headerName: 'Подразделение',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => row?.productionSite?.name?.toUpperCase() ?? '-',
    },
    {
      field: 'name',
      headerName: 'Наименование',
      flex: 1,
      minWidth: 200,
      valueFormatter: (_, value) => value?.name?.toUpperCase() ?? '-',
    },
    {
      field: 'model',
      headerName: 'Тип СИ',
      flex: 1,
      minWidth: 120,
      valueFormatter: (_, value) => value?.model?.toUpperCase() ?? '-',
    },
    {
      field: 'serialNumber',
      headerName: 'Заводской номер',
      flex: 1,
      minWidth: 130,
      valueFormatter: (_, value) => value?.serialNumber?.toUpperCase() ?? '-',
    },
    {
      field: 'inventoryNumber',
      headerName: 'Инвентарный номер',
      flex: 1,
      minWidth: 130,
      valueFormatter: (_, value) =>
        value?.inventoryNumber?.toUpperCase() ?? '-',
    },
    {
      field: 'verificationDate',
      headerName: 'Дата поверки',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) =>
        row.latestVerification ? formatDate(row.latestVerification.date) : '-',
    },
    {
      field: 'verificationNextDate',
      headerName: 'Дата следующей поверки',
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) =>
        row.latestVerification
          ? formatDate(row.latestVerification.validUntil)
          : '-',
    },
    {
      field: 'metrologyControlType',
      headerName: 'Вид контроля',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) =>
        row?.latestVerification?.metrologyControleType?.name?.toUpperCase() ??
        '-',
    },
    {
      field: 'status',
      headerName: 'Состояние',
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => row?.status?.name?.toUpperCase() ?? '-',
    },
    {
      field: 'grsiNumber',
      headerName: 'Госреестр',
      flex: 1,
      minWidth: 130,
      valueFormatter: (value) => (value ? value : '-'),
    },
    {
      field: 'certificate',
      headerName: 'Свидетельство',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) =>
        row?.latestVerification?.protocolNumber?.toUpperCase() ?? '-',
    },
    {
      field: 'releaseDate',
      headerName: 'Дата производства',
      flex: 1,
      minWidth: 130,
      valueFormatter: (value) => (value ? formatDate(value) : '-'),
    },
    {
      field: 'manufacturer',
      headerName: 'Изготовитель',
      flex: 1,
      minWidth: 160,
      valueFormatter: (_, value) => value?.manufacturer?.toUpperCase() || '-',
    },
  ];

  const handleRowClick = (params: GridRowParams) => {
    setSelectedDeviceId(params.row.id);
    setViewMode('info');
  };

  const handleAddClick = () => {
    setSelectedDeviceId(null);
    setViewMode('create');
  };

  // const closeDetails = () => {
  //   setViewMode(null);
  //   setSelectedDeviceId(null);
  // };

  const handleColumnVisibilityModelChange = (
    newModel: Record<string, boolean>
  ) => {
    setColumnVisibilityModel(newModel);
    localStorage.setItem('devicesColumnVisibility', JSON.stringify(newModel));
  };

  //  const handleToggleCheckboxes = () => {
  //   setShowCheckboxes((prev) => {
  //     const nextState = !prev;
  //     if (!nextState) {
  //       setSelectedDeviceIds([]);
  //     }
  //     return nextState;
  //   });

  // };

  const handleCancelSelection = () => {
    setShowCheckboxes(false);
    setSelectedDeviceIds([]);
  };

  return (
    <Paper
      sx={{
        height: isMobileOrLaptop
          ? 'calc(100dvh - 110px)'
          : 'calc(100dvh - 130px)',
        // margin: 2,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isMobileOrLaptop ? 0 : 2,
        margin: isMobileOrLaptop ? 0 : 2,
        overflow: 'hidden',
        bgcolor: 'transparent',
        boxShadow: 'none',
        border: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          gap: isMobileOrLaptop ? 0 : 2,
          p: isMobileOrLaptop ? 0 : 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            width: viewMode ? '70%' : '100%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobileOrLaptop ? 0 : 3,
            boxShadow: isMobileOrLaptop ? 0 : 4,
            overflow: 'hidden',
            bgcolor: isMobileOrLaptop ? 'transparent' : 'background.paper',
            border: isMobileOrLaptop ? 'none' : '1px solid',
            borderColor: 'divider',
            transition: 'width 0.4s ease-in-out',
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1rem', md: '1.5rem' },
              }}
            >
              🔬 Средства измерения
            </Typography>

            {isMobileOrLaptop ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  flexWrap: 'nowrap',
                }}
              >
                {/* Фильтры — иконка + Drawer (остаётся) */}
                <Tooltip title="Фильтры">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <FilterAlt fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Drawer
                  anchor="right"
                  open={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                >
                  <Stack
                    direction={isMobileOrLaptop ? 'column' : 'row'}
                    spacing={2}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{
                      p: isMobileOrLaptop ? 3 : 0,
                      pt: isMobileOrLaptop ? 10 : 0,
                      width: isMobileOrLaptop ? 280 : 'auto',
                    }}
                  >
                    <TextField
                      label="Город"
                      size="small"
                      select
                      slotProps={{ select: { native: true } }}
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange('city', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{ minWidth: 150 }}
                    >
                      <option value=""></option>
                      {cities.map((city: any) => (
                        <option key={city.id || city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      label="Организация"
                      size="small"
                      select
                      slotProps={{ select: { native: true } }}
                      value={filters.company}
                      onChange={(e) =>
                        handleFilterChange('company', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{ minWidth: 150 }}
                    >
                      <option value=""></option>
                      {companies.map((company: any) => (
                        <option
                          key={company.id || company.name}
                          value={company.name}
                        >
                          {company.name}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      label="Подразделение"
                      size="small"
                      select
                      slotProps={{ select: { native: true } }}
                      value={filters.productionSite}
                      onChange={(e) =>
                        handleFilterChange('productionSite', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 150,
                        maxWidth: isMobileOrLaptop ? 'none' : 200,
                      }}
                    >
                      <option value=""></option>
                      {productionSite.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      label="Наименование"
                      size="small"
                      fullWidth={isMobileOrLaptop}
                      value={filters.deviceName}
                      onChange={(e) =>
                        handleFilterChange('deviceName', e.target.value)
                      }
                    />

                    <TextField
                      label="Заводской номер"
                      size="small"
                      value={filters.serialNumber}
                      onChange={(e) =>
                        handleFilterChange('serialNumber', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 130,
                        maxWidth: isMobileOrLaptop ? 'none' : 150,
                      }}
                    />

                    <TextField
                      label="Вид контроля"
                      size="small"
                      select
                      slotProps={{ select: { native: true } }}
                      value={filters.metrologyControle}
                      onChange={(e) =>
                        handleFilterChange('metrologyControle', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 130,
                        maxWidth: isMobileOrLaptop ? 'none' : 150,
                      }}
                    >
                      <option value=""></option>
                      {metrologyControleTypes.map((type: any) => (
                        <option key={type.id || type.name} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      label="Статус"
                      size="small"
                      select
                      slotProps={{ select: { native: true } }}
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange('status', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 130,
                        maxWidth: isMobileOrLaptop ? 'none' : 150,
                      }}
                    >
                      <option value=""></option>
                      {statuses.map((status: any) => (
                        <option
                          key={status.id || status.name}
                          value={status.name}
                        >
                          {status.name}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      label="Срок действия с..."
                      size="small"
                      fullWidth={isMobileOrLaptop}
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { type: 'date' },
                      }}
                      value={filters.dateStart || ''}
                      onChange={(e) =>
                        handleFilterChange('dateStart', e.target.value)
                      }
                    />

                    <TextField
                      label="Срок действия до..."
                      size="small"
                      fullWidth={isMobileOrLaptop}
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { type: 'date' },
                      }}
                      value={filters.dateEnd || ''}
                      onChange={(e) =>
                        handleFilterChange('dateEnd', e.target.value)
                      }
                    />

                    <Button
                      color="error"
                      onClick={resetFilters}
                      fullWidth={isMobileOrLaptop}
                    >
                      Сброс
                    </Button>
                  </Stack>
                </Drawer>

                {/* Компактная группа: Добавить + Печать */}
                {user?.role !== 'user' && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                      ml: 'auto',
                    }}
                  >
                    <Tooltip title="Добавить СИ">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={handleAddClick}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {selectedDeviceIds.length > 0 ? (
                      <Tooltip
                        title={`Отправить на печать (${selectedDeviceIds.length})`}
                      >
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => setIsBarcodeModalOpen(true)}
                          sx={{
                            backgroundColor: 'success.lighter',
                            '&:hover': { backgroundColor: 'success.light' },
                          }}
                        >
                          <Badge
                            badgeContent={selectedDeviceIds.length}
                            color="error"
                          >
                            <QrCode fontSize="small" />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title={
                          showCheckboxes
                            ? 'Выберите СИ в таблице...'
                            : 'Печать бирок'
                        }
                      >
                        <IconButton
                          size="small"
                          color={showCheckboxes ? 'warning' : 'primary'}
                          onClick={() => setShowCheckboxes(true)}
                        >
                          <QrCode fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {showCheckboxes && (
                      <Tooltip title="Отменить выбор">
                        <IconButton
                          size="small"
                          color="default"
                          onClick={handleCancelSelection}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                {user?.role !== 'user' && (
                  <div
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{ height: 36, borderRadius: 2 }}
                      onClick={handleAddClick}
                    >
                      Добавить СИ
                    </Button>
                    {selectedDeviceIds.length > 0 ? (
                      // СОСТОЯНИЕ: Приборы выбраны -> Готовы отправлять на печать
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<QrCode />}
                        onClick={() => setIsBarcodeModalOpen(true)}
                        sx={{
                          height: 36,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          borderRadius: 2,
                          boxShadow: '0px 4px 10px rgba(46, 125, 50, 0.2)', // Легкая красивая тень
                        }}
                      >
                        Отправить на печать ({selectedDeviceIds.length})
                      </Button>
                    ) : (
                      // СОСТОЯНИЕ: Выбор еще не сделан (или режим вообще выключен)
                      <Button
                        variant={showCheckboxes ? 'contained' : 'outlined'}
                        color="primary"
                        startIcon={<QrCode />}
                        onClick={() => setShowCheckboxes(true)} // Включает чекбоксы при первом клике
                        sx={{
                          height: 36,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          borderRadius: 2,
                        }}
                      >
                        {showCheckboxes
                          ? 'Выберите СИ в таблице...'
                          : 'Печать бирок'}
                      </Button>
                    )}

                    {showCheckboxes && (
                      <Button
                        variant="text"
                        color="inherit"
                        onClick={handleCancelSelection}
                        sx={{
                          height: 36,
                          textTransform: 'none',
                          color: 'text.secondary',
                        }}
                      >
                        Отмена
                      </Button>
                    )}
                  </div>
                )}
              </Box>
            )}
          </Box>

          {!isMobileOrLaptop && (
            <Paper sx={{ p: 2, mb: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  p: 0,
                  width: 'auto',
                }}
              >
                <TextField
                  label="Город"
                  size="small"
                  select
                  slotProps={{ select: { native: true } }}
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <option value=""></option>
                  {cities.map((city: any) => (
                    <option key={city.id || city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </TextField>

                <TextField
                  label="Организация"
                  size="small"
                  select
                  slotProps={{ select: { native: true } }}
                  value={filters.company}
                  onChange={(e) =>
                    handleFilterChange('company', e.target.value)
                  }
                  sx={{ minWidth: 150, maxWidth: 160 }}
                >
                  <option value=""></option>
                  {companies.map((company: any) => (
                    <option
                      key={company.id || company.name}
                      value={company.name}
                    >
                      {company.name}
                    </option>
                  ))}
                </TextField>

                <TextField
                  label="Подразделение"
                  size="small"
                  select
                  slotProps={{ select: { native: true } }}
                  value={filters.productionSite}
                  onChange={(e) =>
                    handleFilterChange('productionSite', e.target.value)
                  }
                  sx={{
                    minWidth: 150,
                    maxWidth: 170,
                  }}
                >
                  <option value=""></option>
                  {productionSite.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </TextField>

                <TextField
                  label="Наименование"
                  size="small"
                  value={filters.deviceName}
                  onChange={(e) =>
                    handleFilterChange('deviceName', e.target.value)
                  }
                  sx={{
                    minWidth: 150,
                    maxWidth: 170,
                  }}
                />

                <TextField
                  label="Заводской номер"
                  size="small"
                  value={filters.serialNumber}
                  onChange={(e) =>
                    handleFilterChange('serialNumber', e.target.value)
                  }
                  sx={{
                    minWidth: 130,
                    maxWidth: 150,
                  }}
                />

                <TextField
                  label="Вид контроля"
                  size="small"
                  select
                  slotProps={{ select: { native: true } }}
                  value={filters.metrologyControle}
                  onChange={(e) =>
                    handleFilterChange('metrologyControle', e.target.value)
                  }
                  sx={{
                    minWidth: 130,
                    maxWidth: 150,
                  }}
                >
                  <option value=""></option>
                  {metrologyControleTypes.map((type: any) => (
                    <option key={type.id || type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </TextField>

                <TextField
                  label="Статус"
                  size="small"
                  select
                  slotProps={{ select: { native: true } }}
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{
                    minWidth: 130,
                    maxWidth: 150,
                  }}
                >
                  <option value=""></option>
                  {statuses.map((status: any) => (
                    <option key={status.id || status.name} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </TextField>

                <TextField
                  label="Срок действия с..."
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { type: 'date' },
                  }}
                  value={filters.dateStart || ''}
                  onChange={(e) =>
                    handleFilterChange('dateStart', e.target.value)
                  }
                />

                <TextField
                  label="Срок действия до..."
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { type: 'date' },
                  }}
                  value={filters.dateEnd || ''}
                  onChange={(e) =>
                    handleFilterChange('dateEnd', e.target.value)
                  }
                />

                <Button color="error" onClick={resetFilters}>
                  Сброс
                </Button>
              </Stack>
            </Paper>
          )}

          <Box
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {isMobileOrLaptop ? (
              /* ====== МОБИЛЬНАЯ ВЕРСИЯ: Compact List ====== */
              <>
                {/* Список приборов (скроллится) */}
                <Box
                  sx={{
                    overflow: 'auto',
                    flex: '1 1 auto',
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}
                    >
                      <Typography color="text.secondary">
                        Загрузка...
                      </Typography>
                    </Box>
                  ) : rows.length === 0 ? (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}
                    >
                      <Typography color="text.secondary">
                        Нет средств измерения
                      </Typography>
                    </Box>
                  ) : (
                    rows.map((device) => {
                      const statusName =
                        device?.status?.name?.toLowerCase() || '';
                      let statusColor:
                        | 'error'
                        | 'warning'
                        | 'success'
                        | 'default' = 'default';
                      if (
                        statusName.includes('брак') ||
                        statusName.includes('списан') ||
                        statusName.includes('на замен')
                      )
                        statusColor = 'error';
                      else if (
                        statusName.includes('ремонт') ||
                        statusName.includes('ожид') ||
                        statusName.includes('ремон')
                      )
                        statusColor = 'warning';
                      else if (
                        statusName.includes('исправен') ||
                        statusName.includes('эксплуатац') ||
                        statusName.includes('годен')
                      )
                        statusColor = 'success';

                      const isOverdue = device.latestVerification?.validUntil
                        ? new Date(device.latestVerification.validUntil) <
                          new Date()
                        : false;

                      const isChecked = selectedDeviceIds.includes(device.id);

                      return (
                        <React.Fragment key={device.id}>
                          <Box
                            onClick={() => {
                              setSelectedDeviceId(device.id);
                              setViewMode('info');
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              px: 1.5,
                              py: 1,
                              minHeight: 48,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                              transition: 'background-color 0.15s ease',
                              bgcolor:
                                showCheckboxes && isChecked
                                  ? 'action.selected'
                                  : 'transparent',
                            }}
                          >
                            {/* Checkbox (если режим выбора) */}
                            {showCheckboxes && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mr: 1,
                                  ml: -0.5,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  size="small"
                                  color="primary"
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedDeviceIds((prev) => {
                                      if (checked) {
                                        return [...prev, device.id];
                                      } else {
                                        return prev.filter(
                                          (id) => id !== device.id
                                        );
                                      }
                                    });
                                  }}
                                  sx={{ p: 0.5 }}
                                />
                              </Box>
                            )}

                            {/* Основной контент */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    lineHeight: 1.3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {device.name?.toUpperCase() || '—'}
                                </Typography>
                                <Chip
                                  label={device?.status?.name || '—'}
                                  size="small"
                                  color={statusColor}
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 600,
                                    height: 18,
                                    fontSize: 10,
                                    flexShrink: 0,
                                    '& .MuiChip-label': { px: 0.8 },
                                  }}
                                />
                              </Box>

                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mt: 0.25,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: '0.7rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '50%',
                                  }}
                                >
                                  {[device.model, device.serialNumber]
                                    .filter(Boolean)
                                    .map((s) => s?.toUpperCase())
                                    .join(' · ') || '—'}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.65rem',
                                    color: isOverdue
                                      ? 'error.main'
                                      : 'text.secondary',
                                    fontWeight: isOverdue ? 700 : 400,
                                    flexShrink: 0,
                                    ml: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '48%',
                                    textAlign: 'right',
                                  }}
                                >
                                  {device.latestVerification?.validUntil
                                    ? (() => {
                                        const typeName =
                                          device.latestVerification
                                            ?.metrologyControleType?.name || '';
                                        const dateStr = formatDate(
                                          device.latestVerification.validUntil
                                        );
                                        const prefix = isOverdue ? '❗ ' : '';
                                        // Если есть тип контроля — используем его как подпись
                                        if (
                                          typeName
                                            .toLowerCase()
                                            .includes('поверк')
                                        )
                                          return `${prefix}Поверка: до ${dateStr}`;
                                        if (
                                          typeName
                                            .toLowerCase()
                                            .includes('осмотр')
                                        )
                                          return `${prefix}Осмотр: до ${dateStr}`;
                                        if (typeName)
                                          return `${prefix}${typeName}: до ${dateStr}`;
                                        return `${prefix}до ${dateStr}`;
                                      })()
                                    : '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Divider sx={{ mx: 1.5 }} />
                        </React.Fragment>
                      );
                    })
                  )}
                </Box>

                {/* Пагинация — фиксированная снизу */}
                {!loading && rows.length > 0 && (
                  <Box
                    sx={{
                      flexShrink: 0,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      px: 2,
                      py: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <IconButton
                      size="small"
                      disabled={paginationModel.page === 0}
                      onClick={() =>
                        setPaginationModel((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                    >
                      <ChevronLeft />
                    </IconButton>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {paginationModel.page * paginationModel.pageSize + 1}–
                      {Math.min(
                        (paginationModel.page + 1) * paginationModel.pageSize,
                        rowCount
                      )}
                      {' из '}
                      {rowCount}
                    </Typography>

                    <IconButton
                      size="small"
                      disabled={
                        (paginationModel.page + 1) * paginationModel.pageSize >=
                        rowCount
                      }
                      onClick={() =>
                        setPaginationModel((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>
                )}
              </>
            ) : (
              /* ====== ДЕСКТОПНАЯ ВЕРСИЯ: DataGrid ====== */
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                paginationMode="server"
                rowCount={rowCount}
                // checkboxSelection
                checkboxSelection={showCheckboxes}
                paginationModel={paginationModel}
                // rowSelectionModel={selectedDeviceIds}
                rowSelectionModel={{
                  type: 'include',
                  ids: new Set(selectedDeviceIds),
                }}
                keepNonExistentRowsSelected
                onPaginationModelChange={setPaginationModel}
                isRowSelectable={() => showCheckboxes}
                density="compact"
                disableRowSelectionOnClick
                // onRowSelectionModelChange={(newSelection) => {
                //   setSelectedDeviceIds(newSelection);
                // }}
                onRowSelectionModelChange={(newSelection) => {
                  // Преобразуем Set обратно в массив строк
                  const idsArray = Array.from(newSelection.ids).map((id) =>
                    String(id)
                  );
                  setSelectedDeviceIds(idsArray);
                }}
                pageSizeOptions={[10, 25, 50]}
                onRowClick={handleRowClick}
                disableColumnSorting
                disableColumnFilter
                hideFooterSelectedRowCount
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={
                  handleColumnVisibilityModelChange
                }
                localeText={{
                  columnMenuHideColumn: 'Скрыть столбец',
                  columnMenuManageColumns: 'Управлять колонками',
                  noRowsLabel: 'Нет средств измерения',
                  paginationRowsPerPage: 'Кол-во СИ на странице:',
                }}
                getRowId={(row) => row.id}
                sx={{
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '0.85rem',
                  '& .MuiDataGrid-cell': {
                    fontVariantNumeric: 'tabular-nums',
                  },
                  '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer':
                    {
                      display: 'none',
                    },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: '0.88rem',
                  },
                  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within':
                    { outline: 'none' },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  },
                  '& .Mui-selected': {
                    backgroundColor: 'rgba(25, 100, 255, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 100, 255, 0.12)',
                    },
                    transition: 'background-color 0.2s ease',
                  },
                  '& .clicked-row-active': {
                    backgroundColor: 'rgba(25, 100, 255, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 100, 255, 0.12)',
                    },
                    transition: 'background-color 0.2s ease',
                  },
                }}
                getRowClassName={(params: GridRowParams<Device>) =>
                  // selectedDeviceId === params.row.id ? 'Mui-selected' : ''
                  selectedDeviceId === params.row.id ? 'clicked-row-active' : ''
                }
              />
            )}
          </Box>
        </Box>
        {viewMode && (
          <DeviceManageSidebar
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedDeviceId={selectedDeviceId}
            setSelectedDeviceId={setSelectedDeviceId}
            refetchTable={refetch} // Ваша функция refetch от useQuery
          />
        )}
        <BarcodePrintModal
          open={isBarcodeModalOpen}
          onClose={() => {
            setIsBarcodeModalOpen(false);
            // Бонус UX: после закрытия печатного окна можно сбросить галочки в таблице,
            // чтобы они не висели, раскомментируйте строчку ниже если это нужно:
            // setSelectedDeviceIds([]);
          }}
          deviceIds={selectedDeviceIds as unknown as string[]}
        />
      </Box>
    </Paper>
  );
}
