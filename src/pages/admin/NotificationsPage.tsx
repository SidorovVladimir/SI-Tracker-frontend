// import { useState } from 'react';
// import {
//   Container,
//   Box,
//   Typography,
//   Stack,
//   CircularProgress,
//   Card,
//   TablePagination,
//   Button,
//   Divider,
// } from '@mui/material';
// import { useQuery, useMutation } from '@apollo/client/react';
// import { useSnackbar } from 'notistack';
// import DoneAllIcon from '@mui/icons-material/DoneAll';
// import {
//   GetSystemNotificationsDocument,
//   MarkAllNotificationsAsReadDocument,
// } from '../../graphql/types/__generated__/graphql';

// // Предполагаем, что у вас есть GraphQL документы для полной истории с пагинацией
// // Если используется тот же запрос, просто передавайте в него limit и offset

// export default function NotificationsPage() {
//   const { enqueueSnackbar } = useSnackbar();
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(15); // По умолчанию 15 строк

//   // Запрашиваем данные с учетом текущей страницы и лимита
//   const { data, loading, refetch } = useQuery(GetSystemNotificationsDocument, {
//     variables: {
//       limit: rowsPerPage,
//       offset: page * rowsPerPage,
//     },
//     fetchPolicy: 'network-only',
//   });

//   const [markAllAsRead] = useMutation(MarkAllNotificationsAsReadDocument, {
//     onCompleted: () => {
//       refetch();
//       enqueueSnackbar('Все уведомления отмечены как прочитанные', {
//         variant: 'success',
//       });
//     },
//   });

//   const items = data?.getSystemNotifications?.items || [];
//   const totalCount = data?.getSystemNotifications?.totalCount || 0;

//   const formatNotificationDate = (dateStr: string) => {
//     try {
//       const parsedDate = isNaN(Number(dateStr))
//         ? new Date(dateStr)
//         : new Date(Number(dateStr));
//       return isNaN(parsedDate.getTime())
//         ? '---'
//         : parsedDate.toLocaleString('ru-RU');
//     } catch {
//       return '---';
//     }
//   };

//   const getAlertColor = (type: string) => {
//     if (type === 'success') return '#16a34a';
//     if (type === 'error') return '#dc2626';
//     if (type === 'warning') return '#ca8a04';
//     return '#2563eb';
//   };
//   return (
//     <Container
//       maxWidth="md"
//       sx={{
//         py: { xs: 1, sm: 2 },
//         height: { xs: 'calc(100dvh - 200px)', sm: 'calc(100dvh - 120px)' },
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'hidden',
//       }}
//     >
//       {/* Шапка страницы */}
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           pb: 1.5,
//           borderBottom: '1px solid',
//           borderColor: 'divider',
//         }}
//       >
//         <Typography variant="h5" sx={{ fontWeight: 700 }}>
//           История системных уведомлений
//         </Typography>
//         <Button
//           size="small"
//           variant="outlined"
//           startIcon={<DoneAllIcon />}
//           onClick={() => markAllAsRead()}
//           sx={{ textTransform: 'none', borderRadius: 1.5 }}
//         >
//           Прочитать всё
//         </Button>
//       </Box>

//       {/* Список уведомлений со скроллбаром */}
//       <Box sx={{ flexGrow: 1, overflowY: 'auto', my: 2, pr: 0.5 }}>
//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
//             <CircularProgress />
//           </Box>
//         ) : items.length === 0 ? (
//           <Card sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
//             Уведомлений пока нет
//           </Card>
//         ) : (
//           <Stack spacing={1.5}>
//             {items.map((item: any) => (
//               <Card
//                 key={item.id}
//                 variant="outlined"
//                 sx={{
//                   p: 2,
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: 0.5,
//                   borderLeft: '5px solid',
//                   borderColor: getAlertColor(item.type),
//                   bgcolor: item.isRead ? 'background.paper' : 'action.hover',
//                 }}
//               >
//                 <Typography
//                   variant="subtitle2"
//                   sx={{ fontWeight: 'bold', color: 'text.primary' }}
//                 >
//                   {item.title}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: 'text.secondary',
//                     whiteSpace: 'pre-line',
//                     wordBreak: 'break-word',
//                   }}
//                 >
//                   {item.message}
//                 </Typography>
//                 <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Typography variant="caption" color="text.disabled">
//                     📅 {formatNotificationDate(item.createdAt)}
//                   </Typography>
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontWeight: 600,
//                       color: item.isRead ? 'text.disabled' : 'primary.main',
//                     }}
//                   >
//                     {item.isRead ? '✓ Прочитано' : '● Новое'}
//                   </Typography>
//                 </Box>
//               </Card>
//             ))}
//           </Stack>
//         )}
//       </Box>

//       {/* Фиксированная пагинация */}
//       {!loading && items.length > 0 && (
//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'flex-end',
//             mt: 'auto',
//             pt: 1,
//             borderTop: '1px solid',
//             borderColor: 'divider',
//             bgcolor: 'background.paper',
//           }}
//         >
//           <TablePagination
//             component="div"
//             count={totalCount}
//             page={page}
//             onPageChange={(_, newPage) => setPage(newPage)}
//             rowsPerPage={rowsPerPage}
//             onRowsPerPageChange={(e) => {
//               setRowsPerPage(parseInt(e.target.value, 10));
//               setPage(0);
//             }}
//             rowsPerPageOptions={[15, 30, 50]}
//             labelRowsPerPage="Строк:"
//           />
//         </Box>
//       )}
//     </Container>
//   );
// }
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
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  GetSystemNotificationsDocument,
  MarkAllNotificationsAsReadDocument,
} from '../../graphql/types/__generated__/graphql';

// Импортируем сгенерированный документ запроса

export default function NotificationsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15); // По 15 алертов на страницу

  // Запрашиваем порцию данных для текущей страницы
  const { data, loading, refetch } = useQuery(GetSystemNotificationsDocument, {
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
    fetchPolicy: 'network-only',
  });

  const [markAllAsRead] = useMutation(MarkAllNotificationsAsReadDocument, {
    onCompleted: () => {
      refetch();
      enqueueSnackbar('Все уведомления отмечены как прочитанные', {
        variant: 'success',
      });
    },
  });

  // Безопасно достаем данные из новой GraphQL структуры-обертки
  const response = data?.getSystemNotifications;
  const items = response?.items || [];
  const totalCount = response?.totalCount || 0;

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
    if (type === 'success') return '#16a34a'; // Зеленый для поверок/успешного старта
    if (type === 'error') return '#dc2626'; // Красный для списания
    if (type === 'warning') return '#ca8a04'; // Желтый для предупреждений
    return '#2563eb'; // Синий для дефолтных info
  };
  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 1, sm: 2 },
        // Фиксированная высота скролл-области для предотвращения двойных скроллбаров на странице
        height: { xs: 'calc(100dvh - 200px)', sm: 'calc(100dvh - 120px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Шапка страницы */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          История системных уведомлений
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DoneAllIcon />}
          onClick={() => markAllAsRead()}
          sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8rem' }}
        >
          Прочитать всё
        </Button>
      </Box>

      {/* Основной скроллируемый контейнер */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', my: 2, pr: 0.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            Уведомлений пока нет
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {items.map((item: any) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  borderLeft: '5px solid',
                  borderColor: getAlertColor(item.type),
                  bgcolor: item.isRead ? 'background.paper' : 'action.hover',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
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

      {/* Пагинация, привязанная к точному totalCount из Postgres */}
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
          />
        </Box>
      )}
    </Container>
  );
}
