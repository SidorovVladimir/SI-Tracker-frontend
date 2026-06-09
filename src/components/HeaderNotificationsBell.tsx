import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Tooltip,
  Popover,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GetSystemNotificationsDocument,
  GetUnreadNotificationsCountDocument,
  MarkAllNotificationsAsReadDocument,
  MarkNotificationAsReadDocument,
} from '../graphql/types/__generated__/graphql';
import { useSocketApp } from '../context/SocketContext';

export const HeaderNotificationsBell: React.FC = () => {
  const { socket } = useSocketApp();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 1. GraphQL Запрос: Счетчик непрочитанных алертов
  const { data: countData, refetch: refetchCount } = useQuery(
    GetUnreadNotificationsCountDocument,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  // 2. GraphQL Запрос: Список последних 20 уведомлений (срабатывает, только когда Popover открыт)
  const {
    data: listData,
    loading: listLoading,
    refetch: refetchList,
  } = useQuery(GetSystemNotificationsDocument, {
    skip: !Boolean(anchorEl),
    fetchPolicy: 'network-only',
  });

  // 3. GraphQL Мутации управления статусом прочтения
  const [markAllAsRead] = useMutation(MarkAllNotificationsAsReadDocument);
  const [markAsRead] = useMutation(MarkNotificationAsReadDocument);

  // 4. Интеграция сокетов: принудительно обновляем счетчики при получении нового системного алерта в реальном времени
  useEffect(() => {
    if (!socket) return;

    socket.on('systemAlertReceived', () => {
      refetchCount();
      if (anchorEl) refetchList(); // Если панель сейчас открыта у пользователя перед глазами — обновляем и список
    });

    return () => {
      socket.off('systemAlertReceived');
    };
  }, [socket, refetchCount, refetchList, anchorEl]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetchCount();
    if (anchorEl) refetchList();
  };

  const handleItemClick = async (id: string, isRead: boolean) => {
    if (isRead) return;
    await markAsRead({ variables: { id } });
    refetchCount();
    if (anchorEl) refetchList();
  };

  const unreadCount = countData?.getUnreadNotificationsCount ?? 0;
  const notifications = listData?.getSystemNotifications ?? [];
  const open = Boolean(anchorEl);

  // Вспомогательная функция для определения цвета левого маркера уведомления
  const getAlertColor = (type: string) => {
    if (type === 'success') return 'success.main';
    if (type === 'error') return 'error.main';
    if (type === 'warning') return 'warning.main';
    return 'info.main';
  };

  return (
    <>
      <Tooltip
        title={
          unreadCount > 0
            ? `Системные уведомления: ${unreadCount}`
            : 'Системные уведомления'
        }
      >
        <IconButton color="inherit" onClick={handleOpen} sx={{ p: 1 }}>
          {/* Badge отображает только количество СИСТЕМНЫХ уведомлений */}
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 360,
              maxHeight: 480,
              borderRadius: 2,
              boxShadow: 4,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Шапка выпадающей панели */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'between',
            alignItems: 'center',
            bgcolor: 'grey.50',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 'bold', flexGrow: 1 }}
          >
            Системный журнал
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0 }}
            >
              Прочитать всё
            </Button>
          )}
        </Box>
        <Divider />

        {/* Контентная область списка */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {listLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 4, textAlign: 'center' }}
            >
              Системных уведомлений пока нет.
            </Typography>
          ) : (
            <List disablePadding>
              {notifications.map((item) => (
                <ListItem
                  key={item.id}
                  onClick={() => handleItemClick(item.id, item.isRead)}
                  sx={{
                    alignItems: 'start',
                    py: 1.5,
                    cursor: item.isRead ? 'default' : 'pointer',
                    // Непрочитанные мягко подсвечиваются синеватым фоном
                    bgcolor: item.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: item.isRead ? 'grey.50' : 'action.selected',
                    },
                    transition: 'background-color 0.2s',
                    // Левая цветная линия-маркер
                    borderLeft: '4px solid',
                    borderColor: getAlertColor(item.type),
                  }}
                >
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          component="span"
                          color="text.primary"
                          sx={{ display: 'block', mb: 0.5, fontSize: '0.8rem' }}
                        >
                          {item.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.65rem' }}
                        >
                          {new Date(item.createdAt).toLocaleString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </Typography>
                      </>
                    }
                    slotProps={{
                      primary: {
                        variant: 'body2',
                        fontWeight: item.isRead ? 'medium' : 'bold',
                      },
                    }}
                    sx={{ m: 0, pl: 0.5 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};
