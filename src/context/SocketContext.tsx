import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
// import { enqueueSnackbar } from 'notistack'; // На будущее для всплывающих алертов
import { API_BASE_URL } from '../config';
import { useApolloClient } from '@apollo/client/react';
import {
  GetChatDialogsDocument,
  GetSystemNotificationsDocument,
  // GetTotalUnreadCountDocument,
  GetUnreadNotificationsCountDocument,
  GetVerificationBatchesDocument,
} from '../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';

interface OnlineUserPayload {
  userId: string;
  isIdle: boolean;
}

interface JobProgressData {
  jobId: string;
  batchId?: string;
  name: 'arshin-sync' | 'device-import' | 'db-restore';
  current: number;
  total: number;
  percentage: number;
  status: 'active' | 'completed' | 'failed';
  error?: string;
}

//  Добавили unreadChatCount и функцию его изменения в интерфейс контекста
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadChatCount: number;
  setUnreadChatCount: React.Dispatch<React.SetStateAction<number>>;
  // onlineUserIds: string[];
  onlineUsers: OnlineUserPayload[];
  runningJobs: Record<string, JobProgressData>;
  isMaintenance: boolean;
  addRunningJob: (
    jobId: string,
    name: 'db-restore' | 'arshin-sync' | 'device-import'
  ) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  unreadChatCount: 0,
  // onlineUserIds: [],
  onlineUsers: [],
  setUnreadChatCount: () => {},
  runningJobs: {},
  isMaintenance: false,
  addRunningJob: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);

  // Добавили локальный стейт для хранения точной цифры непрочитанных
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  // const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserPayload[]>([]);

  const [runningJobs, setRunningJobs] = useState<
    Record<string, JobProgressData>
  >({});

  const addRunningJob = (
    jobId: string,
    name: 'db-restore' | 'arshin-sync' | 'device-import'
  ) => {
    setRunningJobs((prev) => ({
      ...prev,
      [jobId]: {
        jobId,
        name,
        current: 0,
        total: 100,
        percentage: 0,
        status: 'active',
      },
    }));
  };

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
      // console.log('📡 Веб-сокет успешно подключен!');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    //  ГЛОБАЛЬНЫЙ СЛУШАТЕЛЬ ЧАТА (РАБОТАЕТ ВСЕГДА И ВЕЗДЕ!)
    socketInstance.on('newMessage', async () => {
      // console.log(
      //   '📨 Получено новое сообщение, обновляем счетчики приложения...'
      // );

      // Заставляем Apollo обновить списки диалогов, если открыта страница чата
      await client
        .refetchQueries({
          include: [GetChatDialogsDocument, 'GetChatHistory'],
        })
        .catch(() => {});
    });

    //  НОВЫЙ СОКЕТНЫЙ СЛУШАТЕЛЬ СЧЕТЧИКА: Принимает готовую цифру от бэкенда.
    // Срабатывает мгновенно, даже если пользователь на странице графиков СИ!
    // socketInstance.on('updateUnreadCount', (data: { count: number }) => {
    //   setUnreadChatCount(data.count);
    // });

    // socketInstance.on('updateOnlineStatus', (userIds: string[]) => {
    //   setOnlineUserIds(userIds.map((id) => id.toLowerCase()));
    // });

    socketInstance.on(
      'updateOnlineStatus',
      (usersList: OnlineUserPayload[]) => {
        // Приводим все ID к нижнему регистру для защиты от багов UUID
        const formatted = usersList.map((u) => ({
          userId: u.userId.toLowerCase(),
          isIdle: u.isIdle,
        }));
        setOnlineUsers(formatted);
      }
    );
    socketInstance.on(
      'updateNotificationCount',
      // async (data: { count: number }) => {
      async () => {
        // console.log(
        //   '🔔 Сокет прислал команду обновить счетчик колокольчика:',
        //   data.count
        // );
        try {
          // Принудительно заставляем Apollo перерисовать Badge на колокольчике
          await client
            .refetchQueries({
              include: [GetUnreadNotificationsCountDocument],
            })
            .catch(() => {});
        } catch (err) {
          console.error(err);
        }
      }
    );

    socketInstance.on(
      'updateUnreadCount',
      async (data: { count: number; forceRefetchDialogs?: boolean }) => {
        setUnreadChatCount(data.count);

        if (data.forceRefetchDialogs) {
          await client
            .refetchQueries({ include: [GetChatDialogsDocument] })
            .catch(() => {});
        }
      }
    );

    // Слушатель системных уведомлений (колокольчика)
    socketInstance.on(
      'systemAlertReceived',
      // async (alert: {
      //   title: string;
      //   message: string;
      //   type: 'info' | 'success' | 'warning' | 'error';
      // }) => {
      async () => {
        // Вызываем всплывающее окошко при системных логах
        // enqueueSnackbar(`${alert.title}: ${alert.message}`, {
        //   variant: alert.type || 'info',
        //   anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        // });

        await client
          .refetchQueries({
            include: [
              GetSystemNotificationsDocument,
              GetUnreadNotificationsCountDocument,
            ],
          })
          .catch(() => {});
      }
    );

    socketInstance.on('job-progress', (data: JobProgressData) => {
      setRunningJobs((prev) => ({
        ...prev,
        [data.jobId]: {
          ...data,
          status: 'active',
        },
      }));
    });

    socketInstance.on('job-status-changed', async (data: any) => {
      if (data.name === 'device-import' && data.status === 'completed') {
        // 1. Принудительно просим Apollo обновить таблицы оборудования на экранах
        // (Подставьте имя вашего документа запроса списка девайсов, например GetDevicesWithRelations)
        // client.refetchQueries({ include: ["GetDevicesWithRelations"] }).catch(() => {});

        const { importedCount, total } = data.result || {
          importedCount: 0,
          total: 0,
        };

        // 2. Переключаем тост на успех с точными цифрами из Excel-воркера!
        enqueueSnackbar(
          `✅ Импорт завершен! Успешно добавлено ${importedCount} из ${total} приборов в систему учета СИ.`,
          {
            variant: 'success',
            key: 'db-import-toast',
            autoHideDuration: 6000,
          }
        );
      }

      if (data.name === 'device-import' && data.status === 'failed') {
        enqueueSnackbar(
          `❌ Фоновый импорт Excel завершился критической ошибкой: ${data.error}`,
          {
            variant: 'error',
            key: 'db-import-toast',
          }
        );
      }
      if (data.name === 'db-restore' && data.status === 'completed') {
        enqueueSnackbar(
          '✅ База данных успешно восстановлена! Все таблицы обновлены. Перезагрузка интерфейса...',
          {
            variant: 'success',
            key: 'db-restore-toast', // Снова тот же ключ
            autoHideDuration: 4000,
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          }
        );

        // Даем суперадмину 3 секунды посмотреть на зеленую плашку успеха и перезагружаем вкладку
        setTimeout(() => {
          window.location.reload();
        }, 3500);
      }
      if (data.status === 'completed' && data.name === 'arshin-sync') {
        // Подтягиваем имя документа, который отвечает за загрузку вашего журнала партий
        await client
          .refetchQueries({
            include: [GetVerificationBatchesDocument], // Заставит Apollo перевыполнить этот запрос к бэку
          })
          .catch((err) =>
            console.error('Ошибка refetchQueries после сокетов:', err)
          );

        const { syncedCount, totalCount } = data.result || {
          syncedCount: 0,
          totalCount: 0,
        };

        enqueueSnackbar(
          `Пакетная проверка завершена: успешно обновлено ${syncedCount} из ${totalCount} приборов.`,
          {
            // Если обновился хотя бы один прибор — плашка зеленая (success), если ноль — информационная (info)
            variant: syncedCount > 0 ? 'success' : 'info',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            autoHideDuration: 6000, // Показываем 6 секунд, чтобы метролог успел прочитать
          }
        );

        if (data.status === 'failed' && data.name === 'arshin-sync') {
          enqueueSnackbar(
            `Критический сбой синхронизации: ${
              data.error || 'Неизвестная ошибка'
            }`,
            {
              variant: 'error',
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            }
          );
        }
      }
      setRunningJobs((prev) => {
        // Находим задачу в стейте по любому совпадению ID (как строка или как число)

        const targetKey = Object.keys(prev).find(
          (key) =>
            String(key) === String(data.jobId) ||
            String(data.jobId).includes(String(key))
        );

        const currentJob = targetKey ? prev[targetKey] : null;

        // Если задачи почему-то нет в стейте, мы всё равно её запишем, чтобы сработал триггер успеха
        const baseJob = currentJob || {
          current: 100,
          total: 100,
          percentage: 100,
          name: 'arshin-sync',
        };

        // Плавно скрываем плашку через 4 секунды после успеха
        setTimeout(() => {
          setRunningJobs((latest) => {
            const copy = { ...latest };
            // Удаляем по обоим возможным ключам для надежности
            delete copy[data.jobId];
            if (targetKey) delete copy[targetKey];
            return copy;
          });
        }, 4000);

        return {
          ...prev,
          [data.jobId]: {
            ...baseJob,
            status: data.status,
            percentage:
              data.status === 'completed' ? 100 : baseJob.percentage || 0,
            error: data.error,
          },
        };
      });
    });

    socketInstance.on(
      'maintenance-status',
      (data: { isMaintenance: boolean }) => {
        setIsMaintenance(data.isMaintenance);
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
        unreadChatCount,
        // onlineUserIds,
        onlineUsers,
        setUnreadChatCount,
        runningJobs,
        isMaintenance,
        addRunningJob,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketApp = () => useContext(SocketContext);
