import { useQuery } from '@apollo/client/react';
import { GetUsersDocument } from '../../graphql/types/__generated__/graphql';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

export default function UsersPage() {
  const { data, loading } = useQuery(GetUsersDocument);
  console.log(data?.users);

  if (loading) return <Typography>Loading...</Typography>;
  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Typography align="center" variant="h4" gutterBottom>
        Пользователи
      </Typography>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Имя</TableCell>
              <TableCell align="center">Фамилия</TableCell>
              <TableCell align="center">Почта</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.users.map((user) => (
              <TableRow
                key={user.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="center">{user.firstName}</TableCell>
                <TableCell align="center">{user.lastName}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Редактировать">
                    <IconButton size="small" color="primary" onClick={() => {}}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => {}}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
