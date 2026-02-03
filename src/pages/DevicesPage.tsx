import { useQuery } from '@apollo/client/react';
import { GetDevicesListDocument } from '../graphql/types/__generated__/graphql';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Наименование</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Изготовитель</TableCell>
              <TableCell>Заводской номер</TableCell>
              <TableCell>Дата выпуска</TableCell>
              <TableCell>Диапазон измерений</TableCell>
              <TableCell>Точность</TableCell>
              <TableCell>ГРСИ</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Дата обновления</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.name}</TableCell>
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
    </>
  );
}
