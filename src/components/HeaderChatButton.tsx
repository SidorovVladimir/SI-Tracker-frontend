// import React, { useEffect } from 'react';
// import { Badge, IconButton, Tooltip } from '@mui/material';
// import { Forum } from '@mui/icons-material';
// import { useQuery } from '@apollo/client/react';
// import { GetTotalUnreadCountDocument } from '../graphql/types/__generated__/graphql';
// import { useSocketApp } from '../context/SocketContext';
// import { Link, useLocation } from 'react-router';
// import routes from '../utils/routes';

// export const HeaderChatButton: React.FC = () => {
//   const location = useLocation();
//   const { socket } = useSocketApp();

//   // 1. Запрашиваем количество непрочитанных из базы данных
//   const { data, refetch } = useQuery(GetTotalUnreadCountDocument, {
//     fetchPolicy: 'cache-and-network',
//     nextFetchPolicy: 'network-only', // Заставляет компонент перерисовываться при фоновом рефетче сокета
//     notifyOnNetworkStatusChange: true,
//   });

//   const unreadCount = data?.getTotalUnreadCount ?? 0;

//   // 2. Слушаем сокет: если кто-то написал, мгновенно увеличиваем счетчик
//   useEffect(() => {
//     if (!socket) return;

//     socket.on('newMessage', () => {
//       refetch(); // Обновляем точное число из базы
//     });

//     return () => {
//       socket.off('newMessage');
//     };
//   }, [socket, refetch]);

//   const isChatActive = location.pathname === '/chat';

//   return (
//     <Tooltip
//       title={
//         unreadCount > 0
//           ? `Непрочитанных сообщений: ${unreadCount}`
//           : 'Открыть чат'
//       }
//     >
//       <IconButton
//         component={Link}
//         to={routes.chat()}
//         color="inherit"
//         sx={{
//           color: isChatActive ? 'primary.main' : 'inherit',
//           p: 1,
//         }}
//       >
//         {/* 🎯 Badge теперь сидит прямо на иконке чата */}
//         <Badge badgeContent={unreadCount} color="error" max={99}>
//           <Forum />
//         </Badge>
//       </IconButton>
//     </Tooltip>
//   );
// };

// import React, { useEffect } from 'react';
// import { Badge, IconButton, Tooltip } from '@mui/material';
// import { Forum, WifiOff } from '@mui/icons-material'; // 🎯 Добавили иконку обрыва связи
// import { useQuery } from '@apollo/client/react';
// import { GetTotalUnreadCountDocument } from '../graphql/types/__generated__/graphql';
// import { useSocketApp } from '../context/SocketContext';
// import { Link, useLocation } from 'react-router';

// export const HeaderChatButton: React.FC = () => {
//   const location = useLocation();

//   // 🎯 Извлекаем не только сокет, но и флаг проверки соединения isConnected
//   const { socket, isConnected } = useSocketApp();

//   const { data, refetch } = useQuery(GetTotalUnreadCountDocument, {
//     fetchPolicy: 'cache-and-network',
//     nextFetchPolicy: 'network-only',
//   });

//   const unreadCount = data?.getTotalUnreadCount ?? 0;

//   useEffect(() => {
//     if (!socket) return;

//     const handleGlobalMessage = () => {
//       refetch();
//     };

//     socket.on('newMessage', handleGlobalMessage);

//     return () => {
//       socket.off('newMessage', handleGlobalMessage);
//     };
//   }, [socket, refetch]);

//   // 🎯 Автоматический рефетч при восстановлении сети:
//   // Как только интернет появится и сокет переподключится, кнопка сама заберет свежие счетчики
//   useEffect(() => {
//     if (isConnected) {
//       refetch();
//     }
//   }, [isConnected, refetch]);

//   const isChatActive = location.pathname === '/chat';

//   // 🎯 ДИНАМИЧЕСКИЙ ТУЛТИП В ЗАВИСИМОСТИ ОТ СТАТУСА СЕТИ
//   const getTooltipTitle = () => {
//     if (!isConnected) return '🔴 Соединение разорвано. Ожидание сети...';
//     return unreadCount > 0
//       ? `Непрочитанных сообщений: ${unreadCount}`
//       : 'Открыть чат';
//   };

//   return (
//     <Tooltip title={getTooltipTitle()} arrow>
//       <span>
//         {' '}
//         {/* Обертка для корректной работы тултипа при disabled */}
//         <IconButton
//           component={Link}
//           to="/chat"
//           color="inherit"
//           // Если сеть упала, иконка становится полупрозрачной (визуальный индикатор)
//           sx={{
//             color: !isConnected
//               ? 'text.disabled'
//               : isChatActive
//               ? 'primary.main'
//               : 'inherit',
//             p: 1,
//           }}
//         >
//           <Badge
//             badgeContent={unreadCount}
//             color={isConnected ? 'error' : 'default'} // Если сети нет, маркер становится серым
//             max={99}
//           >
//             {/* 🎯 Динамическая смена иконки при обрыве связи */}
//             {!isConnected ? (
//               <WifiOff fontSize="small" color="error" />
//             ) : (
//               <Forum />
//             )}
//           </Badge>
//         </IconButton>
//       </span>
//     </Tooltip>
//   );
// };
import React from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Forum, WifiOff } from '@mui/icons-material';
import { useSocketApp } from '../context/SocketContext';
import { Link, useLocation } from 'react-router';

export const HeaderChatButton: React.FC = () => {
  const location = useLocation();

  // 🎯 Берем готовую цифру unreadChatCount прямо из контекста сокетов!
  const { isConnected, unreadChatCount } = useSocketApp();

  const isChatActive = location.pathname === '/chat';

  const getTooltipTitle = () => {
    if (!isConnected) return '🔴 Соединение разорвано. Ожидание сети...';
    return unreadChatCount > 0
      ? `Непрочитанных сообщений: ${unreadChatCount}`
      : 'Открыть чат';
  };

  return (
    <Tooltip title={getTooltipTitle()} arrow>
      <span>
        <IconButton
          component={Link}
          to="/chat"
          color="inherit"
          sx={{
            color: !isConnected
              ? 'text.disabled'
              : isChatActive
              ? 'primary.main'
              : 'inherit',
            p: 1,
          }}
        >
          <Badge
            badgeContent={unreadChatCount} // 🎯 Выводим чистый стейт React
            color={isConnected ? 'error' : 'default'}
            max={99}
          >
            {!isConnected ? (
              <WifiOff fontSize="small" color="error" />
            ) : (
              <Forum />
            )}
          </Badge>
        </IconButton>
      </span>
    </Tooltip>
  );
};
