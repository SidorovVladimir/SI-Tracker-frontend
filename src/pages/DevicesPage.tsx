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
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { formatDate } from '../utils/date';
import { useEffect, useMemo, useState } from 'react';
import CreateDevicePage from './admin/CreateDevicePage';
import { useAuth } from '../hooks/useAuth';
import DeviceCard from './DeviceCard';
import EditDevicePage from './admin/EditDevicePage';
import { Add, FilterAlt } from '@mui/icons-material';

type Device = GetDevicesWithRelationsListQuery['devicesWithRelations'][0];
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

        const matchesSerialNumber =
          !filters.serialNumber ||
          row.serialNumber
            .toLowerCase()
            .includes(filters.serialNumber.toLowerCase());

        const matchesStatus =
          !filters.status || row.status?.name === filters.status;

        const vDate = row.latestVerification?.validUntil
          ? new Date(Number(row.latestVerification.validUntil))
          : null;
        const matchesDateStart =
          !filters.dateStart || (vDate && vDate >= new Date(filters.dateStart));
        const matchesDateEnd =
          !filters.dateEnd || (vDate && vDate <= new Date(filters.dateEnd));

        const matchesMetrologyControle =
          !filters.metrologyControle ||
          row.latestVerification?.metrologyControleType?.name ===
            filters.metrologyControle;

        return (
          matchesName &&
          matchesSerialNumber &&
          matchesCity &&
          matchesCompany &&
          matchesSub &&
          matchesStatus &&
          matchesDateStart &&
          matchesDateEnd &&
          matchesMetrologyControle
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

  const metrologyControleTypes = useMemo(() => {
    return Array.from(
      new Set(
        rows
          .map((d) => d.latestVerification?.metrologyControleType?.name)
          .filter(Boolean)
      )
    ).sort();
  }, [data]);

  const productionSite = useMemo(() => {
    const raw = (data?.devicesWithRelations as Device[]) || [];
    return Array.from(
      new Set(raw.map((d) => d.productionSite?.name).filter(Boolean))
    ).sort();
  }, [data]);

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
            <Typography variant="h6">Средства измерения</Typography>

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
                      slotProps={{ select: { native: true } }}
                      value={filters.company}
                      onChange={(e) =>
                        handleFilterChange('company', e.target.value)
                      }
                      fullWidth={isMobileOrLaptop}
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
                      {metrologyControleTypes.map((name) => (
                        <option key={name} value={name}>
                          {name}
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
                      {statuses.map((name) => (
                        <option key={name} value={name}>
                          {name}
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
                  slotProps={{ select: { native: true } }}
                  value={filters.company}
                  onChange={(e) =>
                    handleFilterChange('company', e.target.value)
                  }
                  sx={{ minWidth: 150, maxWidth: 160 }}
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
                  {metrologyControleTypes.map((name) => (
                    <option key={name} value={name}>
                      {name}
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
                  {statuses.map((name) => (
                    <option key={name} value={name}>
                      {name}
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
                  <CreateDevicePage closeDetails={closeDetails} />
                ) : viewMode === 'edit' ? (
                  <EditDevicePage
                    deviceId={selectedDeviceId!}
                    closeDetails={() => setViewMode('info')}
                    close={closeDetails}
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
