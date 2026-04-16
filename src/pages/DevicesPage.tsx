import { useQuery } from '@apollo/client/react';
import {
  GetDevicesWithRelationsListDocument,
  GetDevicesWithRelationsListQuery,
} from '../graphql/types/__generated__/graphql';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Slide,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { formatDate } from '../utils/date';
import { useEffect, useMemo, useState } from 'react';
import CreateDevicePage from './admin/CreateDevicePage';
import EditDevicePage from './admin/EditDevicePage';
import { Close } from '@mui/icons-material';

type Device = GetDevicesWithRelationsListQuery['devicesWithRelations'][0];
const FILTERS_STORAGE_KEY = 'devices_filters_v1';
interface FilterState {
  city: string;
  company: string;
  productionSite: string;
  deviceName: string;
  status: string;
  dateStart: string | null;
  dateEnd: string | null;
}

const initialFilters: FilterState = {
  city: '',
  company: '',
  productionSite: '',
  deviceName: '',
  status: '',
  dateStart: null,
  dateEnd: null,
};

const loadFilters = (): FilterState => {
  const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialFilters;
};

export default function DevicesPage() {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(() => {
    const saved = localStorage.getItem('devicesColumnVisibility');
    if (saved) {
      return JSON.parse(saved);
    }
  });

  const [filters, setFilters] = useState<FilterState>(loadFilters);

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

  const { data, loading } = useQuery(GetDevicesWithRelationsListDocument);

  const rows = useMemo(() => {
    const rawDevices = (data?.devicesWithRelations as Device[]) || [];

    // const filtered = rawDevices.filter((device) =>
    //   device.name.toLowerCase().includes(filter.toLowerCase())
    // );

    return rawDevices
      .map((device) => {
        const lastVerification =
          device.verifications?.length > 0
            ? device.verifications.reduce((prev, curr) =>
                Number(curr.date) > Number(prev.date) ? curr : prev
              )
            : null;
        return {
          ...device,
          latestVerification: lastVerification,
        };
      })
      .filter((row) => {
        const matchesCity =
          !filters.city || row.productionSite?.city?.name === filters.city;

        const matchesCompany =
          !filters.company ||
          row.productionSite?.company?.name
            ?.toLowerCase()
            .includes(filters.company.toLowerCase());

        const matchesSub =
          !filters.productionSite ||
          row.productionSite?.name
            .toLowerCase()
            .includes(filters.productionSite.toLowerCase());

        const matchesName =
          !filters.deviceName ||
          row.name.toLowerCase().includes(filters.deviceName.toLowerCase());

        const matchesStatus =
          !filters.status || row.status?.name === filters.status;

        const vDate = row.latestVerification?.validUntil
          ? new Date(Number(row.latestVerification.validUntil))
          : null;
        const matchesDateStart =
          !filters.dateStart || (vDate && vDate >= new Date(filters.dateStart));
        const matchesDateEnd =
          !filters.dateEnd || (vDate && vDate <= new Date(filters.dateEnd));

        return (
          matchesName &&
          matchesCity &&
          matchesCompany &&
          matchesSub &&
          matchesStatus &&
          matchesDateStart &&
          matchesDateEnd
        );
      });
  }, [data, filters]);

  const cities = useMemo(() => {
    const raw = (data?.devicesWithRelations as Device[]) || [];
    return Array.from(
      new Set(raw.map((d) => d.productionSite?.city?.name).filter(Boolean))
    ).sort();
  }, [data]);

  const companies = useMemo(() => {
    const raw = (data?.devicesWithRelations as Device[]) || [];
    return Array.from(
      new Set(raw.map((d) => d.productionSite?.company?.name).filter(Boolean))
    ).sort();
  }, [data]);

  const statuses = useMemo(() => {
    const raw = (data?.devicesWithRelations as Device[]) || [];
    return Array.from(
      new Set(raw.map((d) => d.status?.name).filter(Boolean))
    ).sort();
  }, [data]);

  const productionSite = useMemo(() => {
    const raw = (data?.devicesWithRelations as Device[]) || [];
    return Array.from(
      new Set(raw.map((d) => d.productionSite?.name).filter(Boolean))
    ).sort();
  }, [data]);

  const [viewMode, setViewMode] = useState<'edit' | 'create' | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const columns: GridColDef[] = [
    {
      field: 'city',
      headerName: 'Город',
      flex: 1,
      minWidth: 100,
      valueGetter: (_, row) => row.productionSite?.city?.name,
    },
    {
      field: 'company',
      headerName: 'Организация',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => row.productionSite?.company?.name,
    },
    {
      field: 'productionSite',
      headerName: 'Подразделение',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => row.productionSite?.name,
    },
    { field: 'name', headerName: 'Наименование', flex: 1, minWidth: 200 },
    { field: 'model', headerName: 'Тип СИ', flex: 1, minWidth: 120 },
    {
      field: 'serialNumber',
      headerName: 'Заводской номер',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'inventoryNumber',
      headerName: 'Инвентарный номер',
      flex: 1,
      minWidth: 130,
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
      headerName: 'Вид работ',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) =>
        row.latestVerification && row.latestVerification.metrologyControleType
          ? row.latestVerification.metrologyControleType.name
          : '-',
    },
    {
      field: 'status',
      headerName: 'Состояние',
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => row.status?.name,
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
        row.latestVerification ? row.latestVerification.protocolNumber : '-',
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
      valueFormatter: (value) => (value ? value : '-'),
    },
  ];

  const handleRowClick = (params: GridRowParams) => {
    setSelectedDeviceId(params.row.id);
    setViewMode('edit');
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
        height: 'calc(100dvh - 150px)',
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
            <Typography variant="h6">Средства измерения</Typography>
            {/* <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, maxWidth: 500 }}>
              <TextField
                size="small"
                placeholder="Поиск..."
                fullWidth
                onChange={handleChange}
              />
              <Button variant="outlined" size="small">
                Фильтры
              </Button>
            </Box> */}
            <Button variant="contained" onClick={handleAddClick}>
              Добавить СИ
            </Button>
          </Box>

          <Paper
            sx={{
              p: 2,
              mb: 1,
            }}
          >
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                label="Город"
                size="small"
                select
                slotProps={{
                  select: { native: true },
                }}
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <option value=""></option>
                {cities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </TextField>

              <TextField
                label="Организация"
                size="small"
                select
                slotProps={{
                  select: { native: true },
                }}
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <option value=""></option>
                {companies.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </TextField>

              <TextField
                label="Подразделение"
                size="small"
                select
                slotProps={{
                  select: { native: true },
                }}
                value={filters.productionSite}
                onChange={(e) =>
                  handleFilterChange('productionSite', e.target.value)
                }
                sx={{ minWidth: 150, maxWidth: 200 }}
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
              />

              <TextField
                label="Статус"
                size="small"
                select
                slotProps={{
                  select: { native: true },
                }}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ minWidth: 130, maxWidth: 150 }}
              >
                <option value=""></option>
                {statuses.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </TextField>

              <TextField
                label="Срок действия с..."
                type="date"
                size="small"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                value={filters.dateStart || ''}
                onChange={(e) =>
                  handleFilterChange('dateStart', e.target.value)
                }
              />

              <TextField
                label="Срок действия до..."
                type="date"
                size="small"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                value={filters.dateEnd || ''}
                onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
              />

              <Button color="error" onClick={resetFilters}>
                Сброс
              </Button>
            </Stack>
          </Paper>

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
              pagination
              // showCellVerticalBorder
              density="compact"
              // pageSizeOptions={[10, 25, 50]}
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
                // height: '100%',
                // border: 'none',
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '0.9rem',
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
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" gutterBottom>
                    {viewMode === 'create'
                      ? 'Добавить новое СИ'
                      : 'Редактировать СИ'}
                  </Typography>
                  <Tooltip title="Закрыть">
                    <IconButton onClick={closeDetails}>
                      <Close />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {viewMode === 'create' ? (
                  <CreateDevicePage />
                ) : (
                  <EditDevicePage
                    deviceId={selectedDeviceId!}
                    closeDetails={closeDetails}
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
