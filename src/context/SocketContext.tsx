import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { enqueueSnackbar } from 'notistack'; // На будущее для всплывающих алертов
import { API_BASE_URL } from '../config';
import { useApolloClient } from '@apollo/client/react';
import {
  GetChatDialogsDocument,
  GetSystemNotificationsDocument,
  // GetTotalUnreadCountDocument,
  GetUnreadNotificationsCountDocument,
} from '../graphql/types/__generated__/graphql';

// 🎯 Добавили unreadChatCount и функцию его изменения в интерфейс контекста
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadChatCount: number;
  setUnreadChatCount: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  unreadChatCount: 0,

  setUnreadChatCount: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 🎯 Добавили локальный стейт для хранения точной цифры непрочитанных
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  const client = useApolloClient(); // Получаем доступ к глобальному кэшу Apollo

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setUnreadChatCount(0); // Сбрасываем счетчик при выходе
      }
      return;
    }

    const socketUrl = API_BASE_URL;
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('📡 Веб-сокет успешно подключен!');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // 🎯 ГЛОБАЛЬНЫЙ СЛУШАТЕЛЬ ЧАТА (РАБОТАЕТ ВСЕГДА И ВЕЗДЕ!)
    socketInstance.on('newMessage', async () => {
      console.log(
        '📨 Получено новое сообщение, обновляем счетчики приложения...'
      );

      // Заставляем Apollo обновить списки диалогов, если открыта страница чата
      await client.refetchQueries({
        include: [GetChatDialogsDocument],
      });
    });

    // 🎯 НОВЫЙ СОКЕТНЫЙ СЛУШАТЕЛЬ СЧЕТЧИКА: Принимает готовую цифру от бэкенда.
    // Срабатывает мгновенно, даже если пользователь на странице графиков СИ!
    socketInstance.on('updateUnreadCount', (data: { count: number }) => {
      setUnreadChatCount(data.count);
    });

    // Слушатель системных уведомлений (колокольчика)
    socketInstance.on(
      'systemAlertReceived',
      async (alert: {
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
      }) => {
        // Вызываем всплывающее окошко при системных логах
        enqueueSnackbar(`${alert.title}: ${alert.message}`, {
          variant: alert.type || 'info',
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        });

        await client.refetchQueries({
          include: [
            GetSystemNotificationsDocument,
            GetUnreadNotificationsCountDocument,
          ],
        });
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, client]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadChatCount, // 🎯 Передаем стейт в приложение

        setUnreadChatCount, // 🎯 Передаем функцию изменения в приложение
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketApp = () => useContext(SocketContext);
