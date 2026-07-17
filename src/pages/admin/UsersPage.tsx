import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteUserDocument,
  GetUsersDocument,
  LogoutDocument,
} from '../../graphql/types/__generated__/graphql';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import routes from '../../utils/routes';
import { Link, useNavigate } from 'react-router';
import { formatDate } from '../../utils/date';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toCapital } from '../../utils/capitalize';

export default function UsersPage() {
  const { user } = useAuth();
  const client = useApolloClient();
  const navigate = useNavigate();

  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const { data, loading, refetch } = useQuery(GetUsersDocument, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data && !loading) {
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastUpdated(now);
    }
  }, [data, loading]);

  const handleManualRefresh = async () => {
    await refetch();
  };

  const [deleteUser] = useMutation(DeleteUserDocument, {
    onCompleted: () => {
      refetch();
    },
  });
  const [logout] = useMutation(LogoutDocument);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (loading)
    return (
      <Typography sx={{ p: 4, textAlign: 'center' }}>Загрузка...</Typography>
    );
  const users = data?.users || [];

  const handleDeleteClick = (id: string) => {
    setSelectedUserId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserId('');
  };

  const handleConfirmDelete = async () => {
    handleCloseDialog();
    if (user?.id === selectedUserId) {
      await logout();
      await client.resetStore();
      navigate(routes.login());
      return;
    }
    await deleteUser({ variables: { id: selectedUserId } });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h5" fontWeight="bold">
            Пользователи
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              color: 'text.secondary',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              Актуально на:{' '}
              <span
                style={{
                  color: 'var(--mui-palette-text-primary)',
                  fontWeight: 600,
                }}
              >
                {lastUpdated || '--:--:--'}
              </span>
            </Typography>

            <IconButton
              size="small"
              onClick={handleManualRefresh}
              disabled={loading}
              sx={{
                p: '2px',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
              aria-label="Обновить данные"
            >
              <Refresh sx={{ fontSize: '1.05rem' }} />
            </IconButton>
          </Box>
        </Box>

        <Button
          aria-label="Добавить пользователя"
          variant="contained"
          startIcon={isMobile ? undefined : <Add />}
          sx={{
            borderRadius: isMobile ? '50%' : undefined,
            minWidth: isMobile ? 40 : undefined,
            width: isMobile ? 40 : undefined,
            height: isMobile ? 40 : undefined,
            px: isMobile ? 0 : undefined,
            padding: isMobile ? 0 : undefined,
          }}
          component={Link}
          to={routes.admin.createUser()}
          disabled={!(user?.role === 'superadmin')}
        >
          {isMobile ? <Add /> : 'Добавить'}
        </Button>
      </Stack>

      {isMobile ? (
        // 📱 МОБИЛЬНАЯ ВЕРСИЯ: Компактный список учетных записей сотрудников
        <Stack spacing={1}>
          {users.map((u) => {
            // Логика определения цвета чипа роли для быстрого визуального контроля
            const roleLabel =
              u.role === 'superadmin'
                ? 'Суперадмин'
                : u.role === 'admin'
                ? 'Админ'
                : 'Пользователь';
            const roleColor =
              u.role === 'superadmin'
                ? 'error'
                : u.role === 'admin'
                ? 'info'
                : 'default';

            return (
              <Paper
                key={u.id}
                variant="outlined"
                sx={{
                  p: 1.5, // Сжали внутренние отступы для максимальной плотности контента
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center', // Центрируем текст сотрудника и кнопки по одной оси
                  gap: 1.5,
                }}
              >
                {/* Левая часть: ФИО, Email и Чип роли */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      lineHeight: 1.2,
                      mb: 0.2,
                    }}
                  >
                    {toCapital(u.firstName)} {toCapital(u.lastName)}
                  </Typography>

                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      mb: 0.5,
                      wordBreak: 'break-all', // Защита от длинных корпоративных email-адресов
                    }}
                  >
                    {u.login}
                  </Typography>

                  <Chip
                    label={roleLabel}
                    size="small"
                    color={roleColor}
                    variant={u.role === 'user' ? 'outlined' : 'filled'}
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  />
                </Box>

                {/* Правая часть: Кнопки действий — перенесены в один ряд с текстом без разделителей */}
                <Stack direction="row" spacing={1} flexShrink={0}>
                  <IconButton
                    size="small"
                    color="primary"
                    component={Link}
                    to={routes.admin.editUser(u.id)}
                    disabled={!(user?.role === 'superadmin')}
                    sx={{
                      border: '1px solid',
                      borderColor: 'grey.200',
                      width: 32,
                      height: 32,
                    }}
                  >
                    <Edit fontSize="small" sx={{ fontSize: '1.1rem' }} />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(u.id)}
                    disabled={user?.role !== 'superadmin' || user?.id === u.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'error.light',
                      width: 32,
                      height: 32,
                      bgcolor: 'rgba(211, 47, 47, 0.02)',
                    }}
                  >
                    <Delete fontSize="small" sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        // Десктопная версия: Таблица
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, boxShadow: 1 }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  '& > th': {
                    fontWeight: 'bold',
                    bgcolor: 'background.default',
                  },
                }}
              >
                <TableCell>Сотрудник (ФИО)</TableCell>
                <TableCell>Логин</TableCell>
                <TableCell>Роль доступа</TableCell>
                <TableCell>Активность (Создан / Изменен)</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow
                  key={u.id}
                  hover
                  sx={{
                    '& > td': {
                      py: 1, // Немного уплотнили вертикальный отступ для аккуратности
                      fontSize: '0.85rem',
                    },
                  }}
                >
                  {/* 1. ОБЪЕДИНЕННАЯ ЯЧЕЙКА: Имя и Фамилия в одной колонке */}
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {toCapital(u.lastName)} {toCapital(u.firstName)}
                  </TableCell>

                  {/* 2. ОПТИМИЗИРОВАННАЯ ЯЧЕЙКА EMAIL: Защита от растягивания таблицы вширь */}
                  <TableCell
                    sx={{
                      maxWidth: 180,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: 'text.secondary',
                      fontFamily: 'monospace', // Моноширинный шрифт для email выглядит компактнее
                    }}
                    title={u.login} // При наведении мышки покажется полный email
                  >
                    {u.login}
                  </TableCell>

                  {/* 3. ЯЧЕЙКА РОЛИ: Лаконичный вывод */}
                  <TableCell>
                    {u.role === 'superadmin' ? (
                      <Box sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        Суперадмин
                      </Box>
                    ) : u.role === 'admin' ? (
                      <Box sx={{ color: 'info.main', fontWeight: 'medium' }}>
                        Админ
                      </Box>
                    ) : (
                      <Box sx={{ color: 'text.secondary' }}>Пользователь</Box>
                    )}
                  </TableCell>

                  {/* 4. ОБЪЕДИНЕННАЯ ЯЧЕЙКА ДАТ: Создание и Обновление друг под другом */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: '0.8rem', fontWeight: 'medium' }}
                    >
                      ➕ {formatDate(u.createdAt)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      🔄 {formatDate(u.updatedAt)}
                    </Typography>
                  </TableCell>

                  {/* 5. ДЕЙСТВИЯ: Чистые кнопки */}
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Редактировать" arrow>
                        <Box component="span" sx={{ display: 'inline-block' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            component={Link}
                            to={routes.admin.editUser(u.id)}
                            disabled={!(user?.role === 'superadmin')}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </Tooltip>

                      <Tooltip title="Удалить" arrow>
                        <Box component="span" sx={{ display: 'inline-block' }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(u.id)}
                            disabled={
                              user?.role !== 'superadmin' || user?.id === u.id
                            }
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Подтвердите удаление</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы действительно хотите удалить этого пользователя? Это действие
            нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
