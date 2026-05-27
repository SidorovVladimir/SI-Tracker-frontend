import { Box, Typography, Paper, Chip } from '@mui/material';
import {
  // FIELD_TRANSLATIONS,
  // formatAuditValue,
  formatLogDate,
} from '../utils/auditMap';

// interface AuditLogRowProps {
//   log: {
//     action: 'create' | 'update' | 'delete';
//     description: string;
//     createdAt: string;
//     oldData?: string | null;
//     newData?: string | null;
//     user?: { firstName: string; lastName: string } | null;
//   };
// }

// export function AuditLogRow({ log }: AuditLogRowProps) {
//   const oldFields = log.oldData ? JSON.parse(log.oldData) : {};
//   const newFields = log.newData ? JSON.parse(log.newData) : {};

//   const actionConfig = {
//     create: { color: 'success' as const, label: 'Создание', bg: '#f1fcf5' },
//     update: { color: 'info' as const, label: 'Изменение', bg: '#f4f9ff' },
//     delete: { color: 'error' as const, label: 'Удаление', bg: '#fff5f5' },
//   };

//   const currentAction = actionConfig[log.action];

//   return (
//     <Paper
//       variant="outlined"
//       sx={{
//         p: 2.5,
//         mb: 2,
//         borderRadius: 2,
//         boxShadow: '0px 2px 4px rgba(0,0,0,0.02)',
//       }}
//     >
//       {/* Шапка лога */}
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           mb: 1.5,
//           flexWrap: 'wrap',
//           gap: 1,
//         }}
//       >
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//           <Chip
//             label={currentAction.label}
//             color={currentAction.color}
//             size="small"
//             sx={{ fontWeight: 600 }}
//           />
//           <Typography
//             variant="subtitle1"
//             sx={{ fontWeight: 600, color: 'text.primary' }}
//           >
//             {log.description}
//           </Typography>
//         </Box>
//         <Typography
//           variant="caption"
//           color="text.secondary"
//           sx={{ fontSize: '0.85rem' }}
//         >
//           📅 {formatLogDate(log.createdAt)} — 👤{' '}
//           <strong>
//             {log.user
//               ? `${log.user.lastName} ${log.user.firstName}`
//               : 'Система'}
//           </strong>
//         </Typography>
//       </Box>

//       {/* Если это обновление, показываем детальный diff полей */}
//       {/* {log.action === 'update' && Object.keys(newFields).length > 0 && (
//         <Box
//           sx={{
//             mt: 1.5,
//             pl: 2,
//             borderLeft: '3px solid #2196f3',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 1,
//           }}
//         >
//           {Object.keys(newFields).map((key) => (
//             <Box
//               key={key}
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 flexWrap: 'wrap',
//                 gap: 0.5,
//               }}
//             >
//               <Typography
//                 variant="body2"
//                 sx={{
//                   fontWeight: 500,
//                   color: 'text.secondary',
//                   minWidth: '150px',
//                 }}
//               >
//                 {FIELD_TRANSLATIONS[key] || key}:
//               </Typography>

//               <Typography
//                 variant="body2"
//                 sx={{
//                   color: '#d32f2f',
//                   textDecoration: 'line-through',
//                   bgcolor: '#ffebee',
//                   px: 0.8,
//                   py: 0.2,
//                   borderRadius: 1,
//                 }}
//               >
//                 {formatAuditValue(oldFields[key])}
//               </Typography>

//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 sx={{ mx: 0.5 }}
//               >
//                 →
//               </Typography>

//               <Typography
//                 variant="body2"
//                 sx={{
//                   color: '#2e7d32',
//                   fontWeight: 600,
//                   bgcolor: '#e8f5e9',
//                   px: 0.8,
//                   py: 0.2,
//                   borderRadius: 1,
//                 }}
//               >
//                 {formatAuditValue(newFields[key])}
//               </Typography>
//             </Box>
//           ))}
//         </Box>
//       )} */}
//       {log.action === 'update' && Object.keys(newFields).length > 0 && (
//         <Box
//           sx={{
//             mt: 1.5,
//             pl: 2,
//             borderLeft: '3px solid #2196f3',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 1,
//           }}
//         >
//           {Object.keys(newFields).map((key) => {
//             // 1. ОТОБРАЖЕНИЕ ИЗМЕНЕНИЙ СВЯЗЕЙ (массивов ID)
//             if (
//               ['scopes', 'measurementTypes', 'primaryStandarts'].includes(key)
//             ) {
//               const addedIds = newFields[key]?.added || [];
//               const removedIds = oldFields[key]?.removed || [];

//               return (
//                 <Box
//                   key={key}
//                   sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{ fontWeight: 600, color: 'text.secondary' }}
//                   >
//                     {FIELD_TRANSLATIONS[key] || key}:
//                   </Typography>
//                   {addedIds.map((id: string) => (
//                     <Typography
//                       key={id}
//                       variant="caption"
//                       sx={{
//                         color: '#2e7d32',
//                         bgcolor: '#e8f5e9',
//                         px: 1,
//                         py: 0.2,
//                         borderRadius: 1,
//                         width: 'fit-content',
//                       }}
//                     >
//                       ➕ Добавлен ID: {id}
//                     </Typography>
//                   ))}
//                   {removedIds.map((id: string) => (
//                     <Typography
//                       key={id}
//                       variant="caption"
//                       sx={{
//                         color: '#d32f2f',
//                         bgcolor: '#ffebee',
//                         px: 1,
//                         py: 0.2,
//                         borderRadius: 1,
//                         width: 'fit-content',
//                         textDecoration: 'line-through',
//                       }}
//                     >
//                       ➖ Удален ID: {id}
//                     </Typography>
//                   ))}
//                 </Box>
//               );
//             }

//             // 2. ОТОБРАЖЕНИЕ ИЗМЕНЕНИЙ В ПОВЕРКАХ
//             if (key === 'verifications') {
//               const changesList = newFields[key] || [];

//               return (
//                 <Box
//                   key={key}
//                   sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
//                 >
//                   <Typography
//                     variant="body2"
//                     sx={{ fontWeight: 600, color: 'text.secondary' }}
//                   >
//                     Изменения в поверках:
//                   </Typography>
//                   {changesList.map((ch: any, idx: number) => (
//                     <Box key={idx} sx={{ pl: 1 }}>
//                       {ch.type === 'added' && (
//                         <Typography
//                           variant="caption"
//                           sx={{ color: '#2e7d32', display: 'block' }}
//                         >
//                           🟢 Добавлена новая поверка:{' '}
//                           <strong>{ch.label}</strong>
//                         </Typography>
//                       )}
//                       {ch.type === 'removed' && (
//                         <Typography
//                           variant="caption"
//                           sx={{
//                             color: '#d32f2f',
//                             display: 'block',
//                             textDecoration: 'line-through',
//                           }}
//                         >
//                           🔴 Удалена поверка: <strong>{ch.label}</strong>
//                         </Typography>
//                       )}
//                       {ch.type === 'updated' && (
//                         <Box>
//                           <Typography
//                             variant="caption"
//                             sx={{ color: '#0288d1', fontWeight: 600 }}
//                           >
//                             🔵 В поверке {ch.label} изменены поля:
//                           </Typography>
//                           {Object.keys(ch.changes).map((field) => (
//                             <Typography
//                               key={field}
//                               variant="caption"
//                               sx={{ display: 'block', pl: 2 }}
//                             >
//                               • {field}:{' '}
//                               <span
//                                 style={{
//                                   textDecoration: 'line-through',
//                                   color: '#d32f2f',
//                                 }}
//                               >
//                                 {String(ch.changes[field].from || 'пусто')}
//                               </span>{' '}
//                               →{' '}
//                               <span
//                                 style={{ color: '#2e7d32', fontWeight: 600 }}
//                               >
//                                 {String(ch.changes[field].to || 'пусто')}
//                               </span>
//                             </Typography>
//                           ))}
//                         </Box>
//                       )}
//                     </Box>
//                   ))}
//                 </Box>
//               );
//             }

//             // 3. ОТОБРАЖЕНИЕ ОБЫЧНЫХ СКАЛЯРНЫХ ПОЛЕЙ
//             return (
//               <Box
//                 key={key}
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   flexWrap: 'wrap',
//                   gap: 0.5,
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     fontWeight: 500,
//                     color: 'text.secondary',
//                     minWidth: '150px',
//                   }}
//                 >
//                   {FIELD_TRANSLATIONS[key] || key}:
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: '#d32f2f',
//                     textDecoration: 'line-through',
//                     bgcolor: '#ffebee',
//                     px: 0.8,
//                     py: 0.2,
//                     borderRadius: 1,
//                   }}
//                 >
//                   {formatAuditValue(oldFields[key])}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   sx={{ mx: 0.5 }}
//                 >
//                   →
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: '#2e7d32',
//                     fontWeight: 600,
//                     bgcolor: '#e8f5e9',
//                     px: 0.8,
//                     py: 0.2,
//                     borderRadius: 1,
//                   }}
//                 >
//                   {formatAuditValue(newFields[key])}
//                 </Typography>
//               </Box>
//             );
//           })}
//         </Box>
//       )}
//     </Paper>
//   );
// }
interface AuditLogRowProps {
  log: {
    action: 'create' | 'update' | 'delete';
    description: string;
    createdAt: string;
    user?: { firstName: string; lastName: string } | null;
  };
}

export function AuditLogRow({ log }: AuditLogRowProps) {
  // Цветовая разметка для типов действий
  const actionConfig = {
    create: { color: 'success' as const, label: 'Создание' },
    update: { color: 'info' as const, label: 'Изменение' },
    delete: { color: 'error' as const, label: 'Удаление' },
  };

  const currentAction = actionConfig[log.action];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        '&:hover': { bgcolor: 'action.hover' }, // лёгкий эффект при наведении
      }}
    >
      {/* Левая часть: Что произошло */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          label={currentAction.label}
          color={currentAction.color}
          size="small"
          sx={{ fontWeight: 600, minWidth: 85 }}
        />
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {log.description}
        </Typography>
      </Box>

      {/* Правая часть: Кто и когда */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.85rem', textAlign: 'right' }}
      >
        📅 {formatLogDate(log.createdAt)} — 👤{' '}
        <strong>
          {log.user ? `${log.user.lastName} ${log.user.firstName}` : 'Система'}
        </strong>
      </Typography>
    </Paper>
  );
}
