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
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { formatDate } from '../utils/date';
import { useState } from 'react';

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

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

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
    setSelectedDevice(params.row);
  };

  const closeDetails = () => {
    setSelectedDevice(null);
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
            width: selectedDevice ? '70%' : '100%',
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
            <Button variant="contained">Добавить СИ</Button>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <DataGrid
              rows={devices}
              columns={columns}
              loading={loading}
              pagination
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
                selectedDevice?.id === params.row.id ? 'Mui-selected' : ''
              }
            />
          </Box>
        </Box>

        <Slide
          direction="left"
          in={!!selectedDevice}
          mountOnEnter
          unmountOnExit
        >
          <Box
            sx={{
              width: '30%',
              minWidth: 300,
              maxHeight: '100%',
              overflowY: 'auto',
              borderRadius: 3,
              boxShadow: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Редактировать СИ
            </Typography>
            {selectedDevice && (
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {Object.entries(selectedDevice).map(([key, value]) => (
                  <li key={key}>
                    <Typography
                      component="div"
                      variant="body2"
                      sx={{ mb: 1.5 }}
                    >
                      <strong>{key}:</strong> {value}
                    </Typography>
                  </li>
                ))}
              </Box>
            )}
            <Button
              onClick={closeDetails}
              size="small"
              variant="outlined"
              sx={{ mt: 'auto', alignSelf: 'flex-start' }}
            >
              Скрыть
            </Button>
          </Box>
        </Slide>
      </Box>
    </Paper>
  );
}
