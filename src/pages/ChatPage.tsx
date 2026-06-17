//
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Badge,
  Tooltip,
  Button,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // 🎯 Иконка назад для мобилок
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import {
  GetChatDialogsDocument,
  GetChatHistoryDocument,
  GetChatUsersDocument,
  // GetTotalUnreadCountDocument,
  MarkAsReadDocument,
} from '../graphql/types/__generated__/graphql';
import { useSocketApp } from '../context/SocketContext';
import { useAuth } from '../hooks/useAuth';
import { Chat, People } from '@mui/icons-material';

interface MessageLocal {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: string;
}

const getInitials = (
  firstName?: string | null,
  lastName?: string | null
): string => {
  const fLetter = firstName?.trim()?.[0] || '';
  const lLetter = lastName?.trim()?.[0] || '';

  const initials = `${fLetter}${lLetter}`.toUpperCase();

  return initials || '??'; // Если имя и фамилия пустые, выведем ??
};

export const ChatPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  // const { socket, setUnreadChatCount, onlineUserIds  } = useSocketApp();
  const { socket, setUnreadChatCount, onlineUsers } = useSocketApp();
  const client = useApolloClient();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Управление выбранным собеседником и текстом
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(
    null
  );
  const [activeCompanionName, setActiveCompanionName] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState<MessageLocal[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const topLoaderRef = useRef<HTMLDivElement | null>(null);

  const [mobileActivePanel, setMobileActivePanel] = useState<'LIST' | 'CHAT'>(
    'LIST'
  );

  // Защита от замороженных стейтов в сокетах через Refs
  const companionIdRef = useRef<string | null>(null);
  useEffect(() => {
    companionIdRef.current = activeCompanionId;
  }, [activeCompanionId]);

  // GraphQL Запросы
  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(GetChatUsersDocument, {
    skip: !showAllUsers,
    // fetchPolicy: 'network-only',
  });

  const systemUsers = usersData?.getChatUsers ?? [];

  const {
    data: dialogsData,
    loading: dialogsLoading,
    refetch: refetchDialogs,
  } = useQuery(GetChatDialogsDocument, {
    // fetchPolicy: 'cache-and-network'

    fetchPolicy: 'network-only', // Всегда берем свежие диалоги с сервера без залипаний кэша
    nextFetchPolicy: 'cache-first',
  });

  const {
    data: historyData,
    loading: historyLoading,
    fetchMore,
  } = useQuery(GetChatHistoryDocument, {
    variables: { recipientId: activeCompanionId ?? '', limit: 50, offset: 0 },
    skip: !activeCompanionId,
    fetchPolicy: 'network-only',
    // fetchPolicy: 'no-cache',
  });

  const loadMoreMessages = async () => {
    if (historyLoading || !hasMoreMessages || !activeCompanionId) return;

    const currentCount = localMessages.length;

    const { data } = await fetchMore({
      variables: {
        offset: currentCount,
      },
    });

    const newMessages = data?.getChatHistory || [];

    if (newMessages.length < 50) {
      setHasMoreMessages(false);
    }

    if (newMessages.length > 0) {
      // const reversedNew = [...newMessages].reverse();

      setLocalMessages((prev) => {
        // Объединяем старые и текущие сообщения
        // const allMessages = [...reversedNew, ...prev];
        const allMessages = [...newMessages, ...prev];
        // Фильтруем массив, оставляя только уникальные по id
        return allMessages.filter(
          (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
        );
      });
    }
  };

  const [markAsRead] = useMutation(MarkAsReadDocument);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    setLocalMessages([]);
    setHasMoreMessages(true);
  }, [activeCompanionId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Если невидимый блок вверху чата стал виден пользователю (он доскроллил до верха)
        // if (entries[0].isIntersecting) {
        if (
          entries[0].isIntersecting &&
          !historyLoading &&
          hasMoreMessages &&
          localMessages.length >= 50
        ) {
          loadMoreMessages();
        }
      },
      { threshold: 0.5 }
    );

    if (topLoaderRef.current) {
      observer.observe(topLoaderRef.current);
    }

    return () => observer.disconnect();
  }, [localMessages, hasMoreMessages, historyLoading]);

  // Синхронизация истории сообщений
  useEffect(() => {
    if (historyData?.getChatHistory) {
      // const reversed = [...historyData.getChatHistory].reverse();
      // setLocalMessages(reversed);

      setLocalMessages(historyData.getChatHistory);
      if (localMessages.length === 0) {
        setTimeout(() => scrollToBottom('auto'), 50);
      }
    }
  }, [historyData]);

  useEffect(() => {
    if (!socket) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        socket.emit('setUserIdleStatus', { isIdle: true });
      } else {
        socket.emit('setUserIdleStatus', { isIdle: false });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket]);

  // Автоматическое прочтение при клике/смене пользователя
  useEffect(() => {
    const handleMarkRead = async () => {
      if (activeCompanionId && socket) {
        try {
          await markAsRead({ variables: { senderId: activeCompanionId } });
          await refetchDialogs();

          socket.emit('notifyMessagesRead', {
            readerId: user?.id,
            authorId: activeCompanionId,
          });

          // Ищем в массиве диалогов тот, чей companionId равен активному
          const currentActiveDialog = dialogsData?.getChatDialogs?.find(
            (d) => d.companionId === activeCompanionId
          );
          const currentUnreadCount = currentActiveDialog?.unreadCount ?? 0;
          setUnreadChatCount((prev) => Math.max(0, prev - currentUnreadCount));
        } catch (err) {
          console.error('Ошибка сброса непрочитанных:', err);
        }
      }
    };
    handleMarkRead();
  }, [
    activeCompanionId,
    markAsRead,
    refetchDialogs,
    setUnreadChatCount,
    dialogsData,
    socket,
    user,
  ]);

  // Уведомление бэкенда об активной комнате переписки
  useEffect(() => {
    if (!socket) return;
    socket.emit('joinChatRoom', { companionId: activeCompanionId });

    return () => {
      socket.emit('joinChatRoom', { companionId: null });
    };
  }, [activeCompanionId, socket]);

  // Реалтайм сокет-слушатели
  useEffect(() => {
    if (!socket) return;

    // socket.on('newMessage', async (newMessage: MessageLocal) => {
    //   const currentCompanionId = companionIdRef.current;

    //   if (
    //     currentCompanionId &&
    //     newMessage.senderId.toLowerCase() === currentCompanionId.toLowerCase()
    //   ) {
    //     const formattedMsg = {
    //       ...newMessage,
    //       createdAt: new Date(newMessage.createdAt).toISOString(),
    //     };
    //     setLocalMessages((prev) => [...prev, formattedMsg]);
    //     await markAsRead({ variables: { senderId: currentCompanionId } });
    //     socket.emit('notifyMessagesRead', {
    //       readerId: user?.id,
    //       authorId: currentCompanionId,
    //     });
    //     setTimeout(() => scrollToBottom('smooth'), 100);
    //     // await client.refetchQueries({ include: [GetTotalUnreadCountDocument] });
    //   }
    // });
    socket.on('newMessage', async (newMessage: MessageLocal) => {
      const currentCompanionId = companionIdRef.current;

      if (!currentCompanionId) return;

      // 🔥 ИСПРАВЛЕНО: Проверяем, относится ли сообщение к текущему открытому диалогу вообще
      const isMessageFromCurrentDialog =
        newMessage.senderId.toLowerCase() ===
          currentCompanionId.toLowerCase() ||
        newMessage.recipientId.toLowerCase() ===
          currentCompanionId.toLowerCase();

      if (isMessageFromCurrentDialog) {
        const formattedMsg = {
          ...newMessage,
          createdAt: new Date(newMessage.createdAt).toISOString(),
        };

        setLocalMessages((prev) => {
          // Защита от дублирования с событием messageSentConfirmation
          if (prev.some((m) => m.id === formattedMsg.id)) return prev;
          return [...prev, formattedMsg]; // Пушим в конец
        });

        await markAsRead({ variables: { senderId: currentCompanionId } });

        socket.emit('notifyMessagesRead', {
          readerId: user?.id,
          authorId: currentCompanionId,
        });

        setTimeout(() => scrollToBottom('smooth'), 100);
      }
    });

    socket.on('messageSentConfirmation', async (sentMessage: MessageLocal) => {
      const currentCompanionId = companionIdRef.current;

      if (
        currentCompanionId &&
        sentMessage.recipientId.toLowerCase() ===
          currentCompanionId.toLowerCase()
      ) {
        const formattedMsg = {
          ...sentMessage,
          createdAt: new Date(sentMessage.createdAt).toISOString(),
        };
        setLocalMessages((prev) => [...prev, formattedMsg]);
        setTimeout(() => scrollToBottom('auto'), 50);
      }

      try {
        await client.refetchQueries({
          // Принудительно обновляем и список активных чатов, и телефонную книгу в фоне!
          include: [GetChatDialogsDocument, GetChatUsersDocument],
        });
      } catch (err) {
        console.error('Ошибка принудительного обновления списков чата:', err);
      }
    });

    socket.on('userCreated', async () => {
      await refetchUsers();
    });

    socket.on(
      'messagesMarkedAsRead',
      (data: { senderId: string; recipientId: string }) => {
        const currentCompanionId = companionIdRef.current;
        // Если тот, кто сейчас открыт, прочитал наши сообщения — красим все галочки в true!
        if (
          data.recipientId.toLowerCase() === currentCompanionId?.toLowerCase()
        ) {
          setLocalMessages((prev) =>
            prev.map((msg) => ({ ...msg, isRead: true }))
          );
        }
      }
    );

    return () => {
      socket.off('newMessage');
      socket.off('messageSentConfirmation');
      socket.off('messagesMarkedAsRead');
    };
  }, [socket, markAsRead, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeCompanionId || !socket) return;

    socket.emit('sendMessage', {
      recipientId: activeCompanionId,
      text: messageText.trim(),
    });

    setMessageText('');
  };

  //  БЕЗОПАСНОЕ ФОРМАТИРОВАНИЕ ВРЕМЕНИ ДЛЯ ПОДДЕРЖКИ ЛЮБЫХ ФОРМАТОВ БАЗЫ ДАННЫХ
  const formatMessageTime = (dateStr: string) => {
    try {
      // Защита: если прилетело число (timestamp) в виде строки
      const parsedDate = isNaN(Number(dateStr))
        ? new Date(dateStr)
        : new Date(Number(dateStr));

      if (isNaN(parsedDate.getTime())) {
        return '00:00'; // Заглушка, если дата совсем битая
      }

      return parsedDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '00:00';
    }
  };

  const dialogs = dialogsData?.getChatDialogs ?? [];
  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 4 },
        height: 'calc(100vh - 64px)',
        boxSizing: 'border-box',
        bgcolor: 'grey.50',
      }}
    >
      <Grid
        container
        component={Paper}
        variant="outlined"
        sx={{
          height: '100%',
          borderRadius: { xs: 2, md: 3 },
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* ЛЕВАЯ ПАНЕЛЬ: СПИСОК АКТИВНЫХ ДИАЛОГОВ ИЛИ СОТРУДНИКОВ */}
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            borderRight: '1px solid',
            borderColor: 'divider',
            height: '100%',
            //  МОБИЛЬНАЯ АДАПТИВНОСТЬ: Прячем панель списка на мобилках, если открыт чат
            display: {
              xs: mobileActivePanel === 'LIST' ? 'flex' : 'none',
              md: 'flex',
            },
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {showAllUsers ? '👥 Сотрудники' : '💬 Внутренний чат'}
            </Typography>

            <Tooltip
              title={showAllUsers ? 'Вернуться к диалогам' : 'Начать новый чат'}
            >
              <IconButton
                color={showAllUsers ? 'primary' : 'default'}
                onClick={() => setShowAllUsers(!showAllUsers)}
                size="small"
              >
                {showAllUsers ? <Chat /> : <People />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {showAllUsers ? (
              usersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : systemUsers.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 3, textAlign: 'center' }}
                >
                  Другие пользователи не найдены.
                </Typography>
              ) : (
                <List disablePadding>
                  {systemUsers.map((u) => {
                    // const isCompanionOnline = onlineUserIds.includes(
                    //   u.id.toLowerCase()
                    // );
                    const companionStatus = onlineUsers.find(
                      (o) => o.userId === u.id.toLowerCase()
                    );
                    const isOnline = !!companionStatus; // Физически в сети
                    const isAway = companionStatus?.isIdle ?? false; // Вкладка в фоне
                    const getStatusColor = () => {
                      if (!isOnline) return 'transparent';
                      return isAway ? '#ffa500' : '#44b700'; //  Желтый (Away) или Зеленый (Active)
                    };
                    const getStatusText = () => {
                      if (!isOnline) return 'офлайн';
                      return isAway ? 'отошел' : 'в сети';
                    };
                    const fullName = `${u.firstName} ${u.lastName}`;
                    return (
                      <ListItem
                        key={u.id}
                        onClick={() => {
                          if (u.id !== activeCompanionId) {
                            setLocalMessages([]);
                          }
                          setActiveCompanionId(u.id);
                          setActiveCompanionName(fullName);
                          setLocalMessages([]);
                          setShowAllUsers(false);
                          setMobileActivePanel('CHAT'); // Уводим мобилку на экран чата
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'grey.100',
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            variant="dot"
                            // Если пользователь в сети — зажигаем зеленую точку
                            sx={{
                              '& .MuiBadge-badge': {
                                // backgroundColor: '#44b700',
                                // color: '#44b700',
                                backgroundColor: getStatusColor(),
                                color: getStatusColor(),
                                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                                // display: isCompanionOnline ? 'block' : 'none',
                                display: isOnline ? 'block' : 'none',
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: 'primary.light',
                                fontSize: '0.85rem',
                                width: 36,
                                height: 36,
                              }}
                            >
                              {/* 🎯 ИСПРАВЛЕНО: Выводим четкие инициалы сотрудника */}
                              {getInitials(u.firstName, u.lastName)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>

                        <ListItemText
                          primary={`${u.firstName} ${u.lastName}`}
                          secondary={
                            <Box
                              component="span"
                              sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                              }}
                            >
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                              >
                                {u.role === 'superadmin'
                                  ? '⚙️ Суперадминистратор'
                                  : u.role === 'admin'
                                  ? '⚙️ Администратор'
                                  : '🔧 Пользователь'}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                  color: isOnline
                                    ? isAway
                                      ? 'warning.main'
                                      : 'success.main'
                                    : 'text.disabled',
                                  fontWeight: 'medium',
                                }}
                              >
                                • {getStatusText()}
                              </Typography>
                            </Box>
                          }
                          slotProps={{
                            secondary: { component: 'div' },
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )
            ) : dialogsLoading && dialogs.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : dialogs.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  У вас пока нет active диалогов.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => setShowAllUsers(true)}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Найти сотрудника
                </Button>
              </Box>
            ) : (
              <List disablePadding>
                {dialogs.map((dialog) => {
                  // const isCompanionOnline = onlineUserIds.includes(
                  //   dialog.companionId.toLowerCase()
                  // );

                  // 2. Внутри .map списков сотрудников или диалогов находим статус этого человека:
                  const companionStatus = onlineUsers.find(
                    (o) => o.userId === dialog.companionId.toLowerCase()
                  ); // или dialog.companionId

                  const isOnline = !!companionStatus; // Физически в сети
                  const isAway = companionStatus?.isIdle ?? false; // Вкладка в фоне
                  const isSelected = dialog.companionId === activeCompanionId;
                  const nameParts = dialog.companionName.trim().split(/\s+/);
                  const fLetter = nameParts[0]?.[0] || '';
                  const lLetter = nameParts[1]?.[0] || '';
                  const firstLetters =
                    `${fLetter}${lLetter}`.toUpperCase() || '??';

                  const getStatusColor = () => {
                    if (!isOnline) return 'transparent';
                    return isAway ? '#ffa500' : '#44b700'; // Желтый (Away) или Зеленый (Active)
                  };

                  const getStatusText = () => {
                    if (!isOnline) return 'офлайн';
                    return isAway ? 'отошел' : 'в сети';
                  };

                  return (
                    <ListItem
                      key={dialog.companionId}
                      onClick={() => {
                        if (dialog.companionId !== activeCompanionId) {
                          setLocalMessages([]);
                        }
                        setActiveCompanionId(dialog.companionId);
                        setActiveCompanionName(dialog.companionName);
                        setMobileActivePanel('CHAT'); // Переключаем мобильный таб на чат
                      }}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                        py: 1.2,
                        borderBottom: '1px solid',
                        borderColor: 'grey.100',
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={dialog.unreadCount}
                          color="error"
                          max={99}
                        >
                          <Badge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            variant="dot"
                            //  Если пользователь в сети — зажигаем зеленую точку!
                            sx={{
                              '& .MuiBadge-badge': {
                                // backgroundColor: '#44b700',
                                // color: '#44b700',
                                backgroundColor: getStatusColor(),
                                color: getStatusColor(),
                                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                                // display: isCompanionOnline ? 'block' : 'none',
                                display: isOnline ? 'block' : 'none',
                                zIndex: 10,
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: isSelected
                                  ? 'primary.main'
                                  : 'grey.400',
                                fontSize: '0.75rem',
                                width: 36,
                                height: 36,
                              }}
                            >
                              {firstLetters}
                            </Avatar>
                          </Badge>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        //
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                fontWeight:
                                  dialog.unreadCount > 0 ? 'bold' : 'medium',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                maxWidth: '65%',
                              }}
                            >
                              {dialog.companionName}
                            </Typography>

                            {/* Текстовый индикатор статуса рядом с именем */}
                            <Typography
                              variant="caption"
                              sx={{
                                color: isOnline
                                  ? isAway
                                    ? 'warning.main'
                                    : 'success.main'
                                  : 'text.disabled',
                                fontSize: '0.7rem',
                                fontWeight: 'medium',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              • {getStatusText()}
                            </Typography>
                          </Box>
                        }
                        //  ОБРЕЗКА ПОСЛЕДНЕГО СООБЩЕНИЯ С ТРОЕТОЧИЕМ
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '100%',
                              color:
                                dialog.unreadCount > 0
                                  ? 'text.primary'
                                  : 'text.secondary',
                              fontWeight:
                                dialog.unreadCount > 0 ? 'bold' : 'regular',
                            }}
                          >
                            {dialog.lastMessageText}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Grid>
        {/* ПРАВАЯ ПАНЕЛЬ: ОКНО ПЕРЕПИСКИ С СОТРУДНИКОМ */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{
            height: '100%',
            display: {
              xs: mobileActivePanel === 'CHAT' ? 'flex' : 'none',
              md: 'flex',
            },
            flexDirection: 'column',
          }}
        >
          {activeCompanionId ? (
            <>
              {/* Шапка чата с кнопкой "Назад" для телефонов и аватаром онлайна */}
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                {/* КНОПКА НАЗАД: Вынесена наверх, чтобы всегда отображаться на мобилках */}
                <IconButton
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                  onClick={() => setMobileActivePanel('LIST')}
                  size="small"
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>

                {(() => {
                  // Вычисляем статус собеседника внутри изолированной функции шапки
                  const chatCompanionStatus = onlineUsers.find(
                    (o) => o.userId === activeCompanionId?.toLowerCase()
                  );
                  const isChatOnline = !!chatCompanionStatus;
                  const isChatAway = chatCompanionStatus?.isIdle ?? false;

                  const getHeaderStatusColor = () => {
                    if (!isChatOnline) return 'transparent';
                    return isChatAway ? '#ffa500' : '#44b700';
                  };

                  const parts = activeCompanionName.trim().split(/\s+/);
                  const firstLetters =
                    `${parts[0]?.[0] || ''}${
                      parts[1]?.[0] || ''
                    }`.toUpperCase() || '??';

                  return (
                    <>
                      {/* Аватарка в шапке с точкой онлайна */}
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: getHeaderStatusColor(),
                            color: getHeaderStatusColor(),
                            boxShadow: (t) =>
                              `0 0 0 2px ${t.palette.background.paper}`,
                            display: isChatOnline ? 'block' : 'none',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 36,
                            height: 36,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {firstLetters}
                        </Avatar>
                      </Badge>

                      {/* Текстовый блок имени и статуса */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
                        >
                          {activeCompanionName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isChatOnline
                              ? isChatAway
                                ? 'warning.main'
                                : 'success.main'
                              : 'text.disabled',
                            fontWeight: 'semibold',
                            fontSize: '0.75rem',
                          }}
                        >
                          {isChatOnline
                            ? isChatAway
                              ? 'отошел'
                              : 'в сети'
                            : 'офлайн'}
                        </Typography>
                      </Box>
                    </>
                  );
                })()}
              </Box>

              {/* Лента компактных сообщений */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: 'auto',
                  bgcolor: 'grey.50',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <div
                  ref={topLoaderRef}
                  style={{ height: '5px', visibility: 'hidden' }}
                />
                {historyLoading && localMessages.length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      my: 'auto',
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                ) : (
                  localMessages.map((msg, index) => {
                    const isMe = msg.senderId === user?.id;

                    const parsedMsgDate = isNaN(Number(msg.createdAt))
                      ? new Date(msg.createdAt)
                      : new Date(Number(msg.createdAt));

                    const msgDate = isNaN(parsedMsgDate.getTime())
                      ? 'Сегодня'
                      : parsedMsgDate.toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        });

                    const prevMsg = index > 0 ? localMessages[index - 1] : null;
                    let prevMsgDate = null;

                    if (prevMsg) {
                      const parsedPrevDate = isNaN(Number(prevMsg.createdAt))
                        ? new Date(prevMsg.createdAt)
                        : new Date(Number(prevMsg.createdAt));
                      prevMsgDate = isNaN(parsedPrevDate.getTime())
                        ? null
                        : parsedPrevDate.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          });
                    }

                    const showDateDivider = msgDate !== prevMsgDate;
                    return (
                      <Box key={msg.id} sx={{ width: '100%' }}>
                        {/* Красивая центрированная плашка даты */}
                        {showDateDivider && (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              my: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: 'grey.200',
                                color: 'text.secondary',
                                px: 1.5,
                                py: 0.25,
                                borderRadius: 3,
                                fontSize: '0.75rem',
                                fontWeight: 'medium',
                              }}
                            >
                              {msgDate}
                            </Typography>
                          </Box>
                        )}

                        {/* Баббл сообщения */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            width: '100%',
                            mb: 0.5,
                          }}
                        >
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              px: 1.5,
                              maxWidth: { xs: '85%', sm: '70%' },
                              borderRadius: isMe
                                ? '12px 12px 2px 12px'
                                : '12px 12px 12px 2px',
                              bgcolor: isMe
                                ? 'primary.main'
                                : 'background.paper',
                              color: isMe
                                ? 'primary.contrastText'
                                : 'text.primary',
                              boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                              borderColor: isMe ? 'primary.main' : 'grey.200',
                              position: 'relative',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-line',
                                fontSize: '0.875rem',
                                pr: isMe ? 3 : 0,
                              }}
                            >
                              {msg.text}
                            </Typography>

                            {/* Контейнер времени и статуса прочтения */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 0.5,
                                mt: 0.25,
                                opacity: 0.8,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.65rem',
                                  fontWeight: 'medium',
                                }}
                              >
                                {formatMessageTime(msg.createdAt)}
                              </Typography>

                              {/* 2. ГАЛОЧКИ ПРОЧТЕНИЯ (ТОЛЬКО ДЛЯ МОИХ СООБЩЕНИЙ) */}
                              {isMe && (
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: '0.85rem',
                                    lineHeight: 1,
                                    color: isMe
                                      ? 'primary.contrastText'
                                      : 'primary.main',
                                    fontWeight: 'bold',
                                    ml: 0.25,
                                  }}
                                >
                                  {/* Если в объекте сообщения от бэка пришло isRead: true — ставим две галочки, иначе одну */}
                                  {(msg as any).isRead ? '✓✓' : '✓'}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Нижняя компактная форма ввода */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  autoComplete="off"
                  slotProps={{
                    input: { sx: { borderRadius: 3, fontSize: '0.9rem' } },
                  }}
                />
                <IconButton
                  color="primary"
                  type="submit"
                  disabled={!messageText.trim()}
                  size="small"
                  sx={{
                    bgcolor: messageText.trim()
                      ? 'primary.main'
                      : 'transparent',
                    color: messageText.trim() ? 'white' : 'inherit',
                    '&:hover': { bgcolor: 'primary.dark' },
                    p: 1,
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                bgcolor: 'grey.50',
                flexDirection: 'column',
                p: 3,
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontWeight: 'bold', mb: 0.5 }}
              >
                Выберите диалог
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'center', maxWidth: 300 }}
              >
                Выберите сотрудника из списка слева, чтобы начать обсуждение.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
