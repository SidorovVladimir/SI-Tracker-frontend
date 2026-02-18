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
import { useState } from 'react';
import CreateDevicePage from './admin/CreateDevicePage';
import EditDevicePage from './admin/EditDevicePage';
import { Close } from '@mui/icons-material';

type Device = GetDevicesWithRelationsListQuery['devicesWithRelations'][0];

export default function DevicesPage() {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(() => {
    const saved = localStorage.getItem('devicesColumnVisibility');
    if (saved) {
      return JSON.parse(saved);
    }
  });

  const { data, loading } = useQuery(GetDevicesWithRelationsListDocument);
  const devices = (data?.devicesWithRelations as Device[]) || [];
  const [viewMode, setViewMode] = useState<'edit' | 'create' | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const columns: GridColDef[] = [
    { field: 'city', headerName: 'Город', flex: 1, minWidth: 100 },
    { field: 'company', headerName: 'Организация', flex: 1, minWidth: 160 },
    {
      field: 'productionSite',
      headerName: 'Подразделение',
      flex: 1,
      minWidth: 160,
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
    },
    {
      field: 'verificationNextDate',
      headerName: 'Дата следующей поверки',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'metrologyControlType',
      headerName: 'Вид работ',
      flex: 1,
      minWidth: 140,
    },
    { field: 'status', headerName: 'Состояние', flex: 1, minWidth: 120 },
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
        height: 'calc(100dvh - 200px)',
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
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, maxWidth: 500 }}>
              <TextField size="small" placeholder="Поиск..." fullWidth />
              <Button variant="outlined" size="small">
                Фильтры
              </Button>
            </Box>
            <Button variant="contained" onClick={handleAddClick}>
              Добавить СИ
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <DataGrid
              rows={devices}
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
          <Box sx={{ width: '30%', minWidth: 300, position: 'relative' }}>
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
                  <EditDevicePage />
                )}
              </Box>
            </Slide>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
