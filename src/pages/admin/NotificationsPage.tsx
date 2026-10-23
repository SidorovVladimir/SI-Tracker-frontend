import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Card,
  TablePagination,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  GetSystemNotificationsDocument,
  GetUnreadNotificationsCountDocument,
  MarkAllNotificationsAsReadDocument,
  MarkNotificationAsReadDocument,
} from '../../graphql/types/__generated__/graphql';
import routes from '../../utils/routes';

export default function NotificationsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const { data, loading, refetch } = useQuery(GetSystemNotificationsDocument, {
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
    fetchPolicy: 'network-only',
  });

  const [markAllAsRead] = useMutation(MarkAllNotificationsAsReadDocument, {
    refetchQueries: [{ query: GetUnreadNotificationsCountDocument }],
    onCompleted: () => {
      refetch();

      enqueueSnackbar('Все уведомления отмечены как прочитанные', {
        variant: 'success',
      });
    },
  });

  const [markAsRead] = useMutation(MarkNotificationAsReadDocument, {
    refetchQueries: [{ query: GetUnreadNotificationsCountDocument }],
  });

  const response = data?.getSystemNotifications;
  const items = response?.items || [];
  const totalCount = response?.totalCount || 0;

  const handleNotificationClick = async (item: any) => {
    if (!item.isRead) {
      try {
        await markAsRead({ variables: { id: item.id } });
        refetch();
      } catch (error: any) {
        console.error('Не удалось обновить статус прочтения:', error.message);
      }
    }

    let metaObj: any = null;
    if (item.meta) {
      try {
        metaObj =
          typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta;
      } catch (e) {
        console.error('Ошибка парсинга метаданных:', e);
      }
    }

    const lowerTitle = item.title.toLowerCase();

    if (lowerTitle.includes('ремонт') || lowerTitle.includes('мастерск')) {
      navigate('/repair-journal');
    } else if (lowerTitle.includes('партия') || lowerTitle.includes('поверк')) {
      navigate('/verification-planning');
    } else if (metaObj?.action === 'inspection_batch_create') {
      navigate(routes.inspectionPlanning(), {
        state: { activeTab: 1, openAccordionId: metaObj.batchNumber },
      });
    } else {
      navigate('/');
    }
  };

  const formatNotificationDate = (dateStr: string) => {
    try {
      const parsedDate = isNaN(Number(dateStr))
        ? new Date(dateStr)
        : new Date(Number(dateStr));
      return isNaN(parsedDate.getTime())
        ? '---'
        : parsedDate.toLocaleString('ru-RU');
    } catch {
      return '---';
    }
  };

  const getAlertColor = (type: string) => {
    if (type === 'success') return '#16a34a';
    if (type === 'error') return '#dc2626';
    if (type === 'warning') return '#ca8a04';
    return '#2563eb';
  };
  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 1.5, sm: 3 },

        height: { xs: 'calc(100dvh - 70px)', sm: 'calc(100dvh - 120px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ================= ШАПКА СТРАНИЦЫ ================= */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 1.5,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            minWidth: 0,
            flexGrow: 1,
          }}
        >
          История системных уведомлений
        </Typography>

        <Button
          size="small"
          variant="outlined"
          startIcon={<DoneAllIcon />}
          onClick={() => markAllAsRead()}
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            textTransform: 'none',
            borderRadius: 2,
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            height: 34,
          }}
        >
          Прочитать всё
        </Button>

        <Tooltip title="Прочитать всё">
          <IconButton
            color="primary"
            onClick={() => markAllAsRead()}
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 1.5,
              p: '6px',
              height: 34,
              width: 34,
            }}
          >
            <DoneAllIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ================= ОСНОВНОЙ СКРОЛЛИРУЕМЫЙ КОНТЕЙНЕР ЕЛЕМЕНТОВ ================= */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          my: 2,
          pr: 0.5,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': { bgcolor: '#94a3b8' },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : items.length === 0 ? (
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              color: 'text.secondary',
              borderStyle: 'dashed',
              borderRadius: 2,
            }}
          >
            Уведомлений пока нет
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {items.map((item: any) => (
              <Card
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  cursor: 'pointer',
                  borderRadius: 2,

                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: '5px solid',
                  borderLeftColor: getAlertColor(item.type),

                  bgcolor: item.isRead ? 'background.paper' : 'action.hover',
                  boxShadow: 'none',

                  transition:
                    'background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out',

                  '&:hover': {
                    bgcolor: item.isRead ? 'action.hover' : 'action.selected',

                    boxShadow:
                      '0 6px 16px -4px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',

                    borderTopColor: 'grey.300',
                    borderRightColor: 'grey.300',
                    borderBottomColor: 'grey.300',
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: item.isRead ? '600' : '800',
                    color: 'text.primary',
                    fontSize: '0.9rem',
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    lineHeight: 1.4,
                  }}
                >
                  {item.message}
                </Typography>

                <Divider
                  sx={{
                    my: 0.5,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    📅 {formatNotificationDate(item.createdAt)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      color: item.isRead ? 'text.disabled' : 'primary.main',
                    }}
                  >
                    {item.isRead ? '✓ Прочитано' : '● Новое'}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* ================= ФИКСИРОВАННАЯ ПАНЕЛЬ ПАГИНАЦИИ ВНИЗУ ================= */}
      {!loading && items.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 'auto',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[15, 30, 50]}
            labelRowsPerPage="Строк:"
            sx={{
              '& .MuiTablePagination-toolbar': { px: { xs: 0.5, sm: 2 } },
              '& .MuiTablePagination-actions': { ml: { xs: 0.5, sm: 2 } },
            }}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} из ${count}`
            }
          />
        </Box>
      )}
    </Container>
  );
}
