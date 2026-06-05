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
  Slide,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { formatDate } from '../utils/date';
import { useEffect, useMemo, useState } from 'react';
import CreateDevicePage from './admin/CreateDevicePage';
import { useAuth } from '../hooks/useAuth';
import DeviceCard from './DeviceCard';
import EditDevicePage from './admin/EditDevicePage';
import { Add, FilterAlt } from '@mui/icons-material';
import { Link } from 'react-router';
import React from 'react';
import routes from '../utils/routes';

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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const isMobileOrLaptop = useMediaQuery(theme.breakpoints.down('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>(loadFilters);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const resetFilters = () => {
    setFilters(initialFilters);
    localStorage.removeItem(FILTERS_STORAGE_KEY);
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
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
  // const rows = useMemo(() => {
  //   const rawDevices = (data?.devicesWithRelations as Device[]) || [];

  //   return rawDevices
  //     .map((device) => {
  //       const lastVerification =
  //         device.verifications?.length > 0
  //           ? device.verifications.reduce((prev, curr) =>
  //               Number(curr.date) > Number(prev.date) ? curr : prev
  //             )
  //           : null;
  //       return {
  //         ...device,
  //         latestVerification: lastVerification,
  //       };
  //     })
  //     .filter((row) => {
  //       const matchesCity =
  //         !filters.city || row.productionSite?.city?.name === filters.city;

  //       const matchesCompany =
  //         !filters.company ||
  //         row.productionSite?.company?.name
  //           ?.toLowerCase()
  //           .includes(filters.company.toLowerCase());

  //       const matchesSub =
  //         !filters.productionSite ||
  //         row.productionSite?.name
  //           .toLowerCase()
  //           .includes(filters.productionSite.toLowerCase());

  //       const matchesName =
  //         !filters.deviceName ||
  //         row.name.toLowerCase().includes(filters.deviceName.toLowerCase());

  //       const matchesSerialNumber =
  //         !filters.serialNumber ||
  //         row.serialNumber
  //           .toLowerCase()
  //           .includes(filters.serialNumber.toLowerCase());

  //       const matchesStatus =
  //         !filters.status || row.status?.name === filters.status;

  //       const vDate = row.latestVerification?.validUntil
  //         ? new Date(Number(row.latestVerification.validUntil))
  //         : null;
  //       const matchesDateStart =
  //         !filters.dateStart || (vDate && vDate >= new Date(filters.dateStart));
  //       const matchesDateEnd =
  //         !filters.dateEnd || (vDate && vDate <= new Date(filters.dateEnd));

  //       const matchesMetrologyControle =
  //         !filters.metrologyControle ||
  //         row.latestVerification?.metrologyControleType?.name ===
  //           filters.metrologyControle;

  //       return (
  //         matchesName &&
  //         matchesSerialNumber &&
  //         matchesCity &&
  //         matchesCompany &&
  //         matchesSub &&
  //         matchesStatus &&
  //         matchesDateStart &&
  //         matchesDateEnd &&
  //         matchesMetrologyControle
  //       );
  //     });
  // }, [data, filters]);

  // const rows = useMemo(() => {
  //   const response = data?.devicesWithRelations;
  //   const rawDevices = response?.items || [];

  //   return rawDevices.map((device) => ({
  //     ...device,
  //     // Бэкенд возвращает в массиве строго 1 последнюю поверку (или 0 штук)
  //     latestVerification: device.verifications?.[0] || null,
  //   }));
  // }, [data]);

  const rows = useMemo(() => {
    const response = data?.devicesWithRelations;
    return response?.items || [];
  }, [data]);

  // const totalCount = data?.devicesWithRelations?.totalCount || 0;

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

  const productionSite = useMemo(() => {
    const raw = productionSiteData?.productionSites || [];
    return Array.from(new Set(raw.map((p) => p.name).filter(Boolean))).sort();
  }, [productionSiteData]);

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

  const closeDetails = () => {
    setViewMode(null);
    setSelectedDeviceId(null);
  };

  const handleColumnVisibilityModelChange = (
    newModel: Record<string, boolean>
  ) => {
    setColumnVisibilityModel(newModel);
    localStorage.setItem('devicesColumnVisibility', JSON.stringify(newModel));
  };

  return (
    <Paper
      sx={{
        height: 'calc(100dvh - 130px)',
        margin: 2,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
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
          gap: 2,
          p: 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            width: viewMode ? '70%' : '100%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
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
            <Box>
              <Button
                id="nav-section-button"
                aria-controls={isMenuOpen ? 'nav-section-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                // Если пользователь админ — показываем стрелочку выбора, если обычный — отключаем клик
                endIcon={
                  user?.role !== 'user' ? (
                    <span style={{ fontSize: '0.8rem', marginLeft: 4 }}>▼</span>
                  ) : null
                }
                disabled={user?.role === 'user'}
                sx={{
                  textTransform: 'none',
                  p: 0,
                  minWidth: 0,
                  color: 'text.primary',
                  textAlign: 'left',
                  '&:hover': {
                    bgcolor: 'transparent',
                    opacity: user?.role !== 'user' ? 0.8 : 1,
                  },
                  '&.Mui-disabled': { color: 'text.primary' },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Средства измерения
                </Typography>
              </Button>

              {/* ВЫПАДАЮЩИЙ СПИСОК РАЗДЕЛОВ ДЛЯ АДМИНИСТРАТОРА */}
              {user?.role !== 'user' && (
                <Menu
                  id="nav-section-menu"
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={() => setAnchorEl(null)}
                  sx={{ mt: 0.5 }}
                  slotProps={{
                    paper: {
                      sx: { borderRadius: 2, boxShadow: 3, minWidth: 220 },
                    },
                    list: {
                      'aria-labelledby': 'nav-section-button', // Настройки списка передаем в слот list
                    },
                  }}
                >
                  {/* <MenuItem onClick={() => setAnchorEl(null)} selected>
                        📊 База СИ (Текущий экран)
                      </MenuItem> */}
                  <MenuItem
                    component={Link}
                    to={routes.planning()}
                    onClick={() => {
                      setAnchorEl(null);
                    }}
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                  >
                    📅 Планировщик поверок
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to={routes.analytics()}
                    onClick={() => setAnchorEl(null)}
                    sx={{ fontWeight: 'bold', color: 'success.main', py: 1 }}
                  >
                    📊 Аналитика и бюджет затрат
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to={routes.productionAnalytics()}
                    onClick={() => setAnchorEl(null)}
                    sx={{ fontWeight: 'bold', color: 'primary.main', py: 1 }}
                  >
                    📋 Объемы СИ и мониторинг
                  </MenuItem>
                </Menu>
              )}
            </Box>

            {isMobileOrLaptop ? (
              <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                <Tooltip title="Фильтры">
                  <IconButton
                    color="primary"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <FilterAlt />
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

                {user?.role !== 'user' && (
                  <Tooltip title="Добавить СИ">
                    <IconButton color="primary" onClick={handleAddClick}>
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ) : (
              <Box>
                {user?.role !== 'user' && (
                  <Button variant="contained" onClick={handleAddClick}>
                    Добавить СИ
                  </Button>
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
              // display: 'flex',
              // flexDirection: 'column',
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              // pagination
              // ----
              paginationMode="server"
              // rowCount={totalCount}
              rowCount={rowCount}
              // rowCount={loading ? undefined : totalCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              // onPaginationModelChange={(newModel) => {
              //   // Жестко фиксируем изменение стейта в памяти React
              //   setPaginationModel(newModel);
              // }}
              // -------
              // showCellVerticalBorder
              density="compact"
              pageSizeOptions={[10, 25, 50]}
              onRowClick={handleRowClick}
              disableColumnSorting
              disableColumnFilter
              hideFooterSelectedRowCount
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
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
                // height: '100%',
                // border: 'none',
                '& .MuiDataGrid-cell': {
                  fontVariantNumeric: 'tabular-nums',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '0.88rem',
                },
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                  outline: 'none',
                },
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
              }}
              getRowClassName={(params: GridRowParams<Device>) =>
                selectedDeviceId === params.row.id ? 'Mui-selected' : ''
              }
            />
          </Box>
        </Box>

        {viewMode && (
          <Box
            sx={{
              width: '30%',
              minWidth: 300,
              position: 'relative',
              // height: '100%',
            }}
          >
            <Slide direction="left" in={!!viewMode} mountOnEnter unmountOnExit>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 3,
                  overflowY: 'auto',
                }}
              >
                {viewMode === 'create' ? (
                  <CreateDevicePage
                    closeDetails={closeDetails}
                    refetchDevice={refetch}
                  />
                ) : viewMode === 'edit' ? (
                  <EditDevicePage
                    deviceId={selectedDeviceId!}
                    closeDetails={() => setViewMode('info')}
                    close={closeDetails}
                    refetchDevice={refetch}
                  />
                ) : (
                  <DeviceCard
                    deviceId={selectedDeviceId!}
                    closeDetails={closeDetails}
                    onEdit={() => setViewMode('edit')}
                  />
                )}
              </Box>
            </Slide>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
