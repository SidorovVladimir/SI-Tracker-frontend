import { useQuery } from '@apollo/client/react';
import { GetDevicesListDocument } from '../graphql/types/__generated__/graphql';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { formatDate } from '../utils/date';

export default function DevicesPage() {
  const { data, loading } = useQuery(GetDevicesListDocument);

  if (loading)
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Typography>
    );
  const devices = data?.devices || [];
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100dvh - 200px)',
        margin: 2,
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: 3,
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
        }}
      >
        <Typography variant="h6">Устройства</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, maxWidth: 500 }}>
          <TextField size="small" placeholder="Поиск..." fullWidth />
          <Button variant="outlined" size="small">
            Фильтры
          </Button>
        </Box>
        <Button variant="contained">Добавить устройство</Button>
      </Box>

      {/* Прокручиваемая таблица */}
      <TableContainer
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.2)',
            borderRadius: 3,
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Наименование
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Тип
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Изготовитель
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Заводской номер
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Дата выпуска
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Диапазон измерений
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Точность
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                ГРСИ
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Дата создания
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                Дата обновления
              </TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow
                key={device.id}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'background.default',
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: 'grey.50',
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transition: 'background-color 0.1s ease',
                  },
                }}
              >
                <TableCell
                  sx={{
                    width: '20%',
                    minWidth: 150,
                    maxWidth: 250,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 13,
                    py: 0.7,
                    px: 1,
                  }}
                >
                  {device.name}
                </TableCell>
                <TableCell>{device.model}</TableCell>
                <TableCell>{device.manufacturer}</TableCell>
                <TableCell>{device.serialNumber}</TableCell>
                <TableCell>{device.releaseDate}</TableCell>
                <TableCell>{device.measurementRange}</TableCell>
                <TableCell>{device.accuracy}</TableCell>
                <TableCell>{device.grsiNumber}</TableCell>
                <TableCell>{formatDate(device.createdAt)}</TableCell>
                <TableCell>{formatDate(device.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация (заглушка) */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Показано 1–10 из 100
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" disabled>
            Предыдущая
          </Button>
          <Button size="small">Следующая</Button>
        </Box>
      </Box>
    </Paper>
  );
}
