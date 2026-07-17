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
  MenuItem,
  Fade,
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
import { cleanSpaces, toCapital } from '../utils/capitalize';

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
  archivedStatus: 'active' | 'archived' | 'all';
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
  archivedStatus: 'active',
};

const isFiltersApplied = (currentFilters: FilterState): boolean => {
  return Object.keys(initialFilters).some((key) => {
    const k = key as keyof FilterState;
    return currentFilters[k] !== initialFilters[k];
  });
};

const loadFilters = (): FilterState => {
  const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialFilters;
};

type StatusColor = 'error' | 'warning' | 'success' | 'info' | 'default';

const STATUS_COLOR_MAP: Record<string, StatusColor> = {
  исправен: 'success',
  'длительное хранение': 'info',
  неисправен: 'error',
  забракован: 'error',
  утерян: 'error',
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

  const hasActiveFilters = isFiltersApplied(filters);

  const activeFiltersCount = Object.keys(initialFilters).reduce(
    (count, key) => {
      const k = key as keyof FilterState;
      return filters[k] !== initialFilters[k] ? count + 1 : count;
    },
    0
  );

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const resetFilters = () => {
    setFilters(initialFilters);
    setPaginationModel({ page: 0, pageSize: 25 });
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

    setPaginationModel((prev) => ({ ...prev, page: 0 }));
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
          includeArchived: filters.archivedStatus === 'all',
          archived: filters.archivedStatus === 'archived' ? true : false,
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

  const productionSite = useMemo(() => {
    const rawSites = productionSiteData?.productionSites || [];

    // Если справочники городов/компаний еще загружаются, возвращаем уникальные имена из сырых данных,
    // чтобы интерфейс не «моргал» пустым списком при перезагрузке страницы
    if (cities.length === 0 && companies.length === 0) {
      return Array.from(
        new Set(rawSites.map((p) => p.name).filter(Boolean))
      ).sort();
    }

    // 1. Находим объект выбранного города (сравнение без учета регистра и пробелов)
    const selectedCityObj = cities.find(
      (c) => c.name?.trim().toLowerCase() === filters.city?.trim().toLowerCase()
    );
    const targetCityId = selectedCityObj?.id; // ID сравниваем в оригинальном виде

    // 2. Находим объект выбранной компании
    const selectedCompanyObj = companies.find(
      (co) =>
        co.name?.trim().toLowerCase() === filters.company?.trim().toLowerCase()
    );
    const targetCompanyId = selectedCompanyObj?.id;

    // 3. Последовательно фильтруем массив площадок по ID
    let filtered = rawSites;

    if (targetCityId) {
      filtered = filtered.filter((site) => site.cityId === targetCityId);
    }

    if (targetCompanyId) {
      filtered = filtered.filter((site) => site.companyId === targetCompanyId);
    }

    // 4. Собираем массив уникальных текстовых названий и сортируем их
    return Array.from(
      new Set(filtered.map((p) => p.name).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
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
      minWidth: 120,
      valueGetter: (_, row) => cleanSpaces(row?.productionSite?.city?.name),
    },
    {
      field: 'company',
      headerName: 'Организация',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => cleanSpaces(row?.productionSite?.company?.name),
    },
    {
      field: 'productionSite',
      headerName: 'Подразделение',
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => cleanSpaces(row?.productionSite?.name),
    },
    {
      field: 'name',
      headerName: 'Наименование',
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) => cleanSpaces(row?.name),
    },
    {
      field: 'model',
      headerName: 'Тип СИ',
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => cleanSpaces(row?.model),
    },
    {
      field: 'serialNumber',
      headerName: 'Заводской номер',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => cleanSpaces(row?.serialNumber),
    },
    {
      field: 'inventoryNumber',
      headerName: 'Инвентарный номер',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => cleanSpaces(row?.inventoryNumber),
    },
    {
      field: 'verificationDate',
      headerName: 'Дата поверки',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) =>
        row.latestVerification ? formatDate(row.latestVerification.date) : '—',
    },
    {
      field: 'verificationNextDate',
      headerName: 'Дата следующей поверки',
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) =>
        row.latestVerification
          ? formatDate(row.latestVerification.validUntil)
          : '—',
    },
    {
      field: 'metrologyControlType',
      headerName: 'Вид контроля',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) =>
        cleanSpaces(row?.latestVerification?.metrologyControleType?.name),
    },
    {
      field: 'status',
      headerName: 'Состояние',
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => cleanSpaces(row?.status?.name),
    },
    {
      field: 'grsiNumber',
      headerName: 'Госреестр',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => cleanSpaces(row?.grsiNumber),
    },
    {
      field: 'certificate',
      headerName: 'Свидетельство',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) =>
        cleanSpaces(row?.latestVerification?.protocolNumber),
    },
    {
      field: 'releaseDate',
      headerName: 'Дата производства',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) =>
        row?.releaseDate ? formatDate(row.releaseDate) : '—',
    },
    {
      field: 'manufacturer',
      headerName: 'Изготовитель',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => cleanSpaces(row?.manufacturer),
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
                  // display: 'flex',
                  display: viewMode ? { xs: 'none', md: 'flex' } : 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  flexWrap: 'nowrap',
                }}
              >
                <Tooltip title="Фильтры">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Badge
                      badgeContent={activeFiltersCount}
                      color="error"
                      invisible={activeFiltersCount === 0}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.65rem',
                          height: '16px',
                          minWidth: '16px',
                          padding: '0 4px',
                        },
                      }}
                    >
                      <FilterAlt fontSize="small" />
                    </Badge>
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
                    {/* 🏙️ ГОРОД */}
                    <TextField
                      label="Город"
                      size="small"
                      select
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange('city', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 150,
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.city !== initialFilters.city
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    >
                      <option value="">Все города</option>
                      {cities.map((city: any) => (
                        <option
                          key={city.id || city.name}
                          value={city.name}
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.77rem',
                            letterSpacing: '0.55px',
                            fontWeight: 500,
                          }}
                        >
                          {cleanSpaces(city.name)}
                        </option>
                      ))}
                    </TextField>
                    {/* 🏢 ОРГАНИЗАЦИЯ */}
                    <TextField
                      label="Организация"
                      size="small"
                      select
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      value={filters.company}
                      onChange={(e) =>
                        handleFilterChange('company', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 150,
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.company !== initialFilters.company
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    >
                      <option value="">Все организации</option>
                      {companies.map((company: any) => (
                        <option
                          key={company.id || company.name}
                          value={company.name}
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.77rem',
                            letterSpacing: '0.55px',
                            fontWeight: 500,
                          }}
                        >
                          {cleanSpaces(company.name)}
                        </option>
                      ))}
                    </TextField>
                    {/* 🏭 ПОДРАЗДЕЛЕНИЕ */}
                    <TextField
                      label="Подразделение"
                      size="small"
                      select
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      value={filters.productionSite}
                      onChange={(e) =>
                        handleFilterChange('productionSite', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 150,
                        maxWidth: isMobileOrLaptop ? 'none' : 200,
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.productionSite !==
                          initialFilters.productionSite
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    >
                      <option value="">Все подразделения</option>
                      {productionSite.map((name) => (
                        <option
                          key={name}
                          value={name}
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.77rem',
                            letterSpacing: '0.55px',
                            fontWeight: 500,
                          }}
                        >
                          {cleanSpaces(name)}
                        </option>
                      ))}
                    </TextField>
                    {/* 🔍 НАИМЕНОВАНИЕ */}
                    <TextField
                      label="Наименование"
                      size="small"
                      fullWidth={isMobileOrLaptop}
                      value={filters.deviceName}
                      onChange={(e) =>
                        handleFilterChange('deviceName', e.target.value)
                      }
                      sx={{
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.deviceName !== initialFilters.deviceName
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    />
                    {/* 🔢 ЗАВОДСКОЙ НОМЕР */}
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
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.serialNumber !== initialFilters.serialNumber
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    />
                    {/* 🛡️ ВИД КОНТРОЛЯ */}
                    <TextField
                      label="Вид контроля"
                      size="small"
                      select
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      value={filters.metrologyControle}
                      onChange={(e) =>
                        handleFilterChange('metrologyControle', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 130,
                        maxWidth: isMobileOrLaptop ? 'none' : 150,
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.metrologyControle !==
                          initialFilters.metrologyControle
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    >
                      <option value="">Все виды контроля</option>
                      {metrologyControleTypes.map((type: any) => (
                        <option
                          key={type.id || type.name}
                          value={type.name}
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.77rem',
                            letterSpacing: '0.55px',
                            fontWeight: 500,
                          }}
                        >
                          {cleanSpaces(type.name)}
                        </option>
                      ))}
                    </TextField>
                    {/* 📊 СТАТУС */}
                    <TextField
                      label="Статус"
                      size="small"
                      select
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange('status', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
                      sx={{
                        minWidth: 130,
                        maxWidth: isMobileOrLaptop ? 'none' : 150,
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.status !== initialFilters.status
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    >
                      <option value="">Все статусы</option>
                      {statuses.map((status: any) => (
                        <option
                          key={status.id || status.name}
                          value={status.name}
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.77rem',
                            letterSpacing: '0.55px',
                            fontWeight: 500,
                          }}
                        >
                          {cleanSpaces(status.name)}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      label="Отображение"
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      size="small"
                      select
                      value={filters.archivedStatus}
                      onChange={(e) =>
                        handleFilterChange('archivedStatus', e.target.value)
                      }
                      sx={{
                        minWidth: 140,
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.77rem',
                          letterSpacing: '0.55px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.archivedStatus !==
                          initialFilters.archivedStatus
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    >
                      <option
                        value="active"
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.77rem',
                          letterSpacing: '0.55px',
                          fontWeight: 500,
                        }}
                      >
                        активные си
                      </option>
                      <option
                        value="archived"
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.77rem',
                          letterSpacing: '0.55px',
                          fontWeight: 500,
                        }}
                      >
                        только архив
                      </option>
                      <option
                        value="all"
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.77rem',
                          letterSpacing: '0.55px',
                          fontWeight: 500,
                        }}
                      >
                        все приборы
                      </option>
                    </TextField>
                    {/* 📅 СРОК ДЕЙСТВИЯ С... */}
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
                      sx={{
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.dateStart !== initialFilters.dateStart
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    />
                    {/* 📅 СРОК ДЕЙСТВИЯ ДО... */}
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
                      sx={{
                        '& .MuiInputBase-root': {
                          paddingTop: '2.5px',
                          paddingBottom: '2.5px',
                        },
                        '& .MuiInputBase-input': {
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          letterSpacing: '0.6px',
                          fontWeight: 500,
                        },
                        backgroundColor:
                          filters.dateEnd !== initialFilters.dateEnd
                            ? 'action.hover'
                            : 'transparent',
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                      }}
                    />
                    <Fade in={hasActiveFilters}>
                      <Button
                        color="error"
                        onClick={resetFilters}
                        fullWidth={isMobileOrLaptop}
                      >
                        Сброс{' '}
                        {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                      </Button>
                    </Fade>
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
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.65rem',
                                height: '16px',
                                minWidth: '16px',
                                padding: '0 4px',
                              },
                            }}
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
                {/* 🏙️ ГОРОД */}
                <TextField
                  label="Город"
                  size="small"
                  select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  sx={{
                    minWidth: 150,
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.city !== initialFilters.city
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                >
                  <MenuItem value="">
                    <em>Все города</em>
                  </MenuItem>
                  {cities.map((city: any) => (
                    <MenuItem
                      key={city.id || city.name}
                      value={city.name}
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0.77rem',
                        letterSpacing: '0.55px',
                        fontWeight: 500,
                      }}
                    >
                      {cleanSpaces(city.name)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 🏢 ОРГАНИЗАЦИЯ */}
                <TextField
                  label="Организация"
                  size="small"
                  select
                  value={filters.company}
                  onChange={(e) =>
                    handleFilterChange('company', e.target.value)
                  }
                  sx={{
                    minWidth: 160,
                    maxWidth: 200,
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },

                    backgroundColor:
                      filters.company !== initialFilters.company
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                >
                  <MenuItem value="">
                    <em>Все организации</em>
                  </MenuItem>
                  {companies.map((company: any) => (
                    <MenuItem
                      key={company.id || company.name}
                      value={company.name}
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0.77rem',
                        letterSpacing: '0.55px',
                        fontWeight: 500,
                      }}
                    >
                      {cleanSpaces(company.name)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 🏭 ПОДРАЗДЕЛЕНИЕ */}
                <TextField
                  label="Подразделение"
                  size="small"
                  select
                  value={filters.productionSite}
                  onChange={(e) =>
                    handleFilterChange('productionSite', e.target.value)
                  }
                  sx={{
                    minWidth: 170,
                    maxWidth: 220,
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.productionSite !== initialFilters.productionSite
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                >
                  <MenuItem value="">
                    <em>Все подразделения</em>
                  </MenuItem>
                  {productionSite.map((name) => (
                    <MenuItem
                      key={name}
                      value={name}
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0.77rem',
                        letterSpacing: '0.55px',
                        fontWeight: 500,
                      }}
                    >
                      {cleanSpaces(name)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 🔍 НАИМЕНОВАНИЕ */}
                <TextField
                  label="Наименование"
                  size="small"
                  value={filters.deviceName}
                  onChange={(e) =>
                    handleFilterChange('deviceName', e.target.value)
                  }
                  sx={{
                    minWidth: 150,
                    maxWidth: 180,
                    '& .MuiInputBase-root': {
                      paddingTop: '2.5px',
                      paddingBottom: '2.5px',
                    },
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },

                    backgroundColor:
                      filters.deviceName !== initialFilters.deviceName
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                />

                {/* 🔢 ЗАВОДСКОЙ НОМЕР */}
                <TextField
                  label="Заводской номер"
                  size="small"
                  value={filters.serialNumber}
                  onChange={(e) =>
                    handleFilterChange('serialNumber', e.target.value)
                  }
                  sx={{
                    minWidth: 130,
                    maxWidth: 160,
                    '& .MuiInputBase-root': {
                      paddingTop: '2.5px',
                      paddingBottom: '2.5px',
                    },
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.serialNumber !== initialFilters.serialNumber
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                />

                {/* 🛡️ ВИД КОНТРОЛЯ */}
                <TextField
                  label="Вид контроля"
                  size="small"
                  select
                  value={filters.metrologyControle}
                  onChange={(e) =>
                    handleFilterChange('metrologyControle', e.target.value)
                  }
                  sx={{
                    minWidth: 150,
                    maxWidth: 180,
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.metrologyControle !==
                      initialFilters.metrologyControle
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                >
                  <MenuItem value="">
                    <em>Все виды контроля</em>
                  </MenuItem>
                  {metrologyControleTypes.map((type: any) => (
                    <MenuItem
                      key={type.id || type.name}
                      value={type.name}
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0.77rem',
                        letterSpacing: '0.55px',
                        fontWeight: 500,
                      }}
                    >
                      {cleanSpaces(type.name)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 📊 СТАТУС */}
                <TextField
                  label="Статус"
                  size="small"
                  select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{
                    minWidth: 130,
                    maxWidth: 160,
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.status !== initialFilters.status
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                >
                  <MenuItem value="">
                    <em>Все статусы</em>
                  </MenuItem>
                  {statuses.map((status: any) => (
                    <MenuItem
                      key={status.id || status.name}
                      value={status.name}
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0.77rem',
                        letterSpacing: '0.55px',
                        fontWeight: 500,
                      }}
                    >
                      {cleanSpaces(status.name)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Отображение"
                  size="small"
                  select
                  value={filters.archivedStatus}
                  onChange={(e) =>
                    handleFilterChange('archivedStatus', e.target.value)
                  }
                  sx={{
                    minWidth: 140,
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.77rem',
                      letterSpacing: '0.55px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.archivedStatus !== initialFilters.archivedStatus
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                >
                  <MenuItem
                    value="active"
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: '0.77rem',
                      letterSpacing: '0.55px',
                      fontWeight: 500,
                    }}
                  >
                    АКТИВНЫЕ СИ
                  </MenuItem>
                  <MenuItem
                    value="archived"
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: '0.77rem',
                      letterSpacing: '0.55px',
                      fontWeight: 500,
                    }}
                  >
                    ТОЛЬКО АРХИВ
                  </MenuItem>
                  <MenuItem
                    value="all"
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: '0.77rem',
                      letterSpacing: '0.55px',
                      fontWeight: 500,
                    }}
                  >
                    ВСЕ ПРИБОРЫ
                  </MenuItem>
                </TextField>

                {/* 📅 СРОК ДЕЙСТВИЯ С... */}
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
                  sx={{
                    minWidth: 140,
                    '& .MuiInputBase-root': {
                      paddingTop: '2.5px',
                      paddingBottom: '2.5px',
                    },
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.dateStart !== initialFilters.dateStart
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                />

                {/* 📅 СРОК ДЕЙСТВИЯ ДО... */}
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
                  sx={{
                    minWidth: 140,
                    '& .MuiInputBase-root': {
                      paddingTop: '2.5px',
                      paddingBottom: '2.5px',
                    },
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    },
                    backgroundColor:
                      filters.dateEnd !== initialFilters.dateEnd
                        ? 'action.hover'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: 1,
                  }}
                />

                <Fade in={hasActiveFilters}>
                  <Button color="error" onClick={resetFilters}>
                    Сброс {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </Button>
                </Fade>
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
                    display: viewMode ? { xs: 'none', md: 'block' } : 'block',
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
                        device?.status?.name?.trim().toLowerCase() || '';
                      const statusColor =
                        STATUS_COLOR_MAP[statusName] || 'default';

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
                                          return `${prefix}${toCapital(
                                            typeName
                                          )}: до ${dateStr}`;
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
                    textTransform: 'uppercase', // Автоматический верхний регистр
                    fontSize: '0.77rem', // Компактный размер букв
                    letterSpacing: '0.55px', // Разреженность, чтобы Капс "дышал" и легко читался
                    fontWeight: 500,
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
