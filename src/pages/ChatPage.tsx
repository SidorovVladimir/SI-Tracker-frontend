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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // 🎯 Иконка назад для мобилок
import { useMutation, useQuery, useApolloClient } from '@apollo/client/react';
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
  const { user } = useAuth();
  const { socket, setUnreadChatCount } = useSocketApp();
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

  // 🎯 НОВОЕ ДЛЯ МОБИЛОК: 'LIST' — показываем список контактов, 'CHAT' — окно переписки
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

  const { data: historyData, loading: historyLoading } = useQuery(
    GetChatHistoryDocument,
    {
      variables: { recipientId: activeCompanionId ?? '', limit: 50, offset: 0 },
      skip: !activeCompanionId,
      // fetchPolicy: 'network-only',
      fetchPolicy: 'no-cache',
    }
  );

  const [markAsRead] = useMutation(MarkAsReadDocument);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Синхронизация истории сообщений
  useEffect(() => {
    if (historyData?.getChatHistory) {
      const reversed = [...historyData.getChatHistory].reverse();
      setLocalMessages(reversed);
      setTimeout(scrollToBottom, 50);
    }
  }, [historyData]);

  // Автоматическое прочтение при клике/смене пользователя
  useEffect(() => {
    const handleMarkRead = async () => {
      if (activeCompanionId) {
        try {
          await markAsRead({ variables: { senderId: activeCompanionId } });
          await refetchDialogs();

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

    socket.on('newMessage', async (newMessage: MessageLocal) => {
      const currentCompanionId = companionIdRef.current;

      if (
        currentCompanionId &&
        newMessage.senderId.toLowerCase() === currentCompanionId.toLowerCase()
      ) {
        setLocalMessages((prev) => [...prev, newMessage]);
        await markAsRead({ variables: { senderId: currentCompanionId } });
        setTimeout(scrollToBottom, 50);
        // await client.refetchQueries({ include: [GetTotalUnreadCountDocument] });
      }
    });

    socket.on('messageSentConfirmation', async (sentMessage: MessageLocal) => {
      const currentCompanionId = companionIdRef.current;

      if (
        currentCompanionId &&
        sentMessage.recipientId.toLowerCase() ===
          currentCompanionId.toLowerCase()
      ) {
        setLocalMessages((prev) => [...prev, sentMessage]);
        setTimeout(scrollToBottom, 50);
      }

      await refetchDialogs();
      await refetchUsers();
    });

    socket.on('userCreated', async () => {
      await refetchUsers();
    });

    return () => {
      socket.off('newMessage');
      socket.off('messageSentConfirmation');
    };
  }, [socket, markAsRead, client]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeCompanionId || !socket) return;

    socket.emit('sendMessage', {
      recipientId: activeCompanionId,
      text: messageText.trim(),
    });

    setMessageText('');
  };

  // 🎯 БЕЗОПАСНОЕ ФОРМАТИРОВАНИЕ ВРЕМЕНИ ДЛЯ ПОДДЕРЖКИ ЛЮБЫХ ФОРМАТОВ БАЗЫ ДАННЫХ
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
            // 🎯 МОБИЛЬНАЯ АДАПТИВНОСТЬ: Прячем панель списка на мобилках, если открыт чат
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
                          setMobileActivePanel('CHAT'); // 🎯 Уводим мобилку на экран чата
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
                        </ListItemAvatar>
                        <ListItemText
                          primary={fullName}
                          secondary={
                            u.role === 'admin' ? '⚙️ Админ' : '🔧 Метролог'
                          }
                          slotProps={{
                            primary: { variant: 'body2', fontWeight: 'medium' },
                            secondary: { variant: 'caption' },
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
                  const isSelected = dialog.companionId === activeCompanionId;
                  const nameParts = dialog.companionName.trim().split(/\s+/);
                  const fLetter = nameParts[0]?.[0] || '';
                  const lLetter = nameParts[1]?.[0] || '';
                  const firstLetters =
                    `${fLetter}${lLetter}`.toUpperCase() || '??';

                  return (
                    <ListItem
                      key={dialog.companionId}
                      onClick={() => {
                        if (dialog.companionId !== activeCompanionId) {
                          setLocalMessages([]);
                        }
                        setActiveCompanionId(dialog.companionId);
                        setActiveCompanionName(dialog.companionName);
                        setMobileActivePanel('CHAT'); // 🎯 Переключаем мобильный таб на чат
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
                          <Avatar
                            sx={{
                              bgcolor: isSelected ? 'primary.main' : 'grey.400',
                              fontSize: '0.75rem',
                              width: 36,
                              height: 36,
                            }}
                          >
                            {firstLetters}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={dialog.companionName}
                        secondary={dialog.lastMessageText}
                        slotProps={{
                          primary: {
                            variant: 'body2',
                            fontWeight:
                              dialog.unreadCount > 0 ? 'bold' : 'medium',
                            noWrap: true,
                          },
                          secondary: {
                            variant: 'caption',
                            noWrap: true,
                            color:
                              dialog.unreadCount > 0
                                ? 'text.primary'
                                : 'text.secondary',
                            fontWeight:
                              dialog.unreadCount > 0 ? 'bold' : 'regular',
                          },
                        }}
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
            // 🎯 МОБИЛЬНАЯ АДАПТИВНОСТЬ: Прячем чат на мобилках, если открыт список
            display: {
              xs: mobileActivePanel === 'CHAT' ? 'flex' : 'none',
              md: 'flex',
            },
            flexDirection: 'column',
          }}
        >
          {activeCompanionId ? (
            <>
              {/* Шапка чата с кнопкой "Назад" для телефонов */}
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5, // Немного увеличили отступ для аватарки
                }}
              >
                <IconButton
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                  onClick={() => setMobileActivePanel('LIST')}
                  size="small"
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>

                {/* 🎯 ДОБАВИЛИ: Красивая аватарка собеседника в шапку переписки */}
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {(() => {
                    const parts = activeCompanionName.trim().split(/\s+/);
                    return (
                      `${parts[0]?.[0] || ''}${
                        parts[1]?.[0] || ''
                      }`.toUpperCase() || '??'
                    );
                  })()}
                </Avatar>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {activeCompanionName}
                </Typography>
              </Box>

              {/* Лента компактных сообщений */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: { xs: 1.5, sm: 3 },
                  overflowY: 'auto',
                  bgcolor: 'grey.50',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1, // Снизили отступы между облачками
                }}
              >
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
                  localMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          width: '100%',
                        }}
                      >
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1, // Ультра-компактные внутренние отступы
                            px: 1.5,
                            maxWidth: { xs: '85%', sm: '70%' },
                            borderRadius: isMe
                              ? '12px 12px 2px 12px'
                              : '12px 12px 12px 2px', // Изящные скругления
                            bgcolor: isMe ? 'primary.main' : 'background.paper',
                            color: isMe
                              ? 'primary.contrastText'
                              : 'text.primary',
                            boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                            borderColor: isMe ? 'primary.main' : 'grey.200',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-line',
                              fontSize: '0.875rem',
                            }}
                          >
                            {msg.text}
                          </Typography>

                          {/* 🎯 ТЕПЕРЬ ТУТ БЕЗОПАСНОЕ И КРАСИВОЕ ВРЕМЯ */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              textAlign: 'right',
                              mt: 0.25,
                              opacity: 0.7,
                              fontSize: '0.65rem',
                              fontWeight: 'medium',
                            }}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </Typography>
                        </Paper>
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
