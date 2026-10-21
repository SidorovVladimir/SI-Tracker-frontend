// import {
//   Box,
//   Typography,
//   Paper,
//   Chip,
//   Tooltip,
//   IconButton,
// } from '@mui/material';
// import { formatLogDate } from '../utils/auditMap';
// import { useState } from 'react';
// import { Visibility, DeleteOutline } from '@mui/icons-material';
// import AuditDetailsModal from './modals/AuditDetailsModal';
// import { toCapital } from '../utils/capitalize';
// import { useAuth } from '../hooks/useAuth';

// export function AuditLogRow({ log, onDelete }: any) {
//   const { user } = useAuth();
//   const [isDetailsOpen, setIsDetailsOpen] = useState(false);

//   // const actionConfig: Record<
//   //   'create' | 'update' | 'delete',
//   //   { color: 'success' | 'info' | 'error'; label: string }
//   // > = {
//   //   create: { color: 'success' as const, label: 'Создание' },
//   //   update: { color: 'info' as const, label: 'Изменение' },
//   //   delete: { color: 'error' as const, label: 'Удаление' },
//   // };
//   const actionConfig: Record<
//     | 'create'
//     | 'update'
//     | 'delete'
//     | 'create_batch'
//     | 'delete_batch'
//     | 'assign_device_to_batch'
//     | 'remove_device_to_batch'
//     | 'verify'
//     | 'create_repair_batch'
//     | 'assign_device_to_repair_batch'
//     | 'remove_device_to_repair_batch'
//     | 'delete_repair_batch'
//     | 'device_scrap'
//     | 'inspection_batch_create'
//     | 'inspection_doc_save',
//     {
//       color: 'success' | 'info' | 'error' | 'secondary' | 'warning' | 'primary';
//       label: string;
//     }
//   > = {
//     create: { color: 'success' as const, label: '📦 Создание' },
//     create_batch: { color: 'success' as const, label: '📋 Создание партии' },
//     create_repair_batch: {
//       color: 'success' as const,
//       label: '📋 Создание ремонтной ведомости',
//     },
//     inspection_batch_create: {
//       color: 'success' as const,
//       label: '📋 Создание ведомости осмотров',
//     },

//     update: { color: 'info' as const, label: '📝 Изменение' },
//     delete: { color: 'error' as const, label: '🗑️ Удаление' },
//     delete_batch: { color: 'error' as const, label: '🗑️ Удаление партии' },

//     assign_device_to_batch: {
//       color: 'secondary' as const,
//       label: '📦 В партию',
//     },
//     remove_device_to_batch: {
//       color: 'warning' as const,
//       label: '↩️ Из партии',
//     },
//     verify: { color: 'primary' as const, label: '✅ Поверен' },

//     assign_device_to_repair_batch: {
//       color: 'secondary' as const,
//       label: '📦 В ремонтную ведомость',
//     },
//     remove_device_to_repair_batch: {
//       color: 'warning' as const,
//       label: '↩️ Из ремонтной ведомости',
//     },
//     delete_repair_batch: {
//       color: 'error' as const,
//       label: '🗑️ Удаление ремонтной ведомости',
//     },
//     device_scrap: {
//       color: 'error' as const,
//       label: '🗑️ Списан',
//     },
//     inspection_doc_save: {
//       color: 'primary' as const,
//       label: '✅ Осмотрен',
//     },
//   };

//   const fallbackAction = { color: 'default' as const, label: log.action };
//   const currentAction =
//     actionConfig[log.action as keyof typeof actionConfig] || fallbackAction;

//   // const currentAction =
//   //   actionConfig[log.action as 'create' | 'update' | 'delete'];

//   return (
//     <Paper
//       variant="outlined"
//       sx={{
//         p: 1.5,
//         mb: 1.5,
//         borderRadius: 2,
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         gap: 3,
//         transition: 'all 0.2s ease-in-out',
//         '&:hover': {
//           bgcolor: 'action.hover',
//           boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
//           borderColor: 'primary.main',
//         },
//       }}
//     >
//       <Box
//         sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}
//       >
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 1.5,
//             flexWrap: 'wrap',
//           }}
//         >
//           <Chip
//             label={currentAction.label}
//             color={currentAction.color}
//             size="small"
//             sx={{ fontWeight: 600, minWidth: 85, height: 24 }}
//           />
//           <Typography
//             variant="body1"
//             sx={{ fontWeight: 500, color: 'text.primary' }}
//           >
//             {log.description}
//           </Typography>
//         </Box>

//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 2,
//             flexWrap: 'wrap',
//           }}
//         >
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{
//               fontSize: '0.8rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 0.5,
//             }}
//           >
//             📅 {formatLogDate(log.createdAt)}
//           </Typography>

//           <Typography
//             variant="caption"
//             color="text.light"
//             sx={{ color: 'text.disabled' }}
//           >
//             •
//           </Typography>

//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{
//               fontSize: '0.8rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 0.5,
//             }}
//           >
//             👤 Автор:{' '}
//             <strong style={{ color: 'var(--mui-palette-text-primary)' }}>
//               {log.user
//                 ? `${toCapital(log.user.lastName)} ${toCapital(
//                     log.user.firstName
//                   )}`
//                 : 'Система'}
//             </strong>
//           </Typography>
//         </Box>
//       </Box>

//       <Box
//         sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
//       >
//         <Tooltip title="Посмотреть слепок данных">
//           <IconButton
//             color="primary"
//             size="medium"
//             onClick={() => setIsDetailsOpen(true)}
//             sx={{ borderRadius: 1.5 }}
//           >
//             <Visibility fontSize="small" />
//           </IconButton>
//         </Tooltip>

//         {onDelete && (
//           <Tooltip title="Удалить лог">
//             <IconButton
//               color="error"
//               size="medium"
//               disabled={!(user?.role === 'superadmin')}
//               onClick={() => onDelete(log.id)}
//               sx={{ borderRadius: 1.5 }}
//             >
//               <DeleteOutline fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         )}
//       </Box>

//       <AuditDetailsModal
//         open={isDetailsOpen}
//         onClose={() => setIsDetailsOpen(false)}
//         title={log.description}
//         oldData={log.oldData}
//         newData={log.newData}
//       />
//     </Paper>
//   );
// }
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { formatLogDate } from '../utils/auditMap';
import { useState } from 'react';
import { Visibility, DeleteOutline } from '@mui/icons-material';
import AuditDetailsModal from './modals/AuditDetailsModal';
import { toCapital } from '../utils/capitalize';
import { useAuth } from '../hooks/useAuth';

export function AuditLogRow({ log, onDelete }: any) {
  const { user } = useAuth();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const actionConfig: Record<
    | 'create'
    | 'update'
    | 'delete'
    | 'create_batch'
    | 'delete_batch'
    | 'assign_device_to_batch'
    | 'remove_device_to_batch'
    | 'verify'
    | 'create_repair_batch'
    | 'assign_device_to_repair_batch'
    | 'remove_device_to_repair_batch'
    | 'repair_batch_close'
    | 'delete_repair_batch'
    | 'device_scrap'
    | 'inspection_batch_create'
    | 'inspection_doc_save',
    {
      color:
        | 'success'
        | 'info'
        | 'error'
        | 'secondary'
        | 'warning'
        | 'primary'
        | 'default';
      label: string;
    }
  > = {
    create: { color: 'success', label: '📦 Создание' },
    create_batch: { color: 'success', label: '📋 Создание партии' },
    create_repair_batch: {
      color: 'success',
      label: '📋 Создание ремонтной ведомости',
    },
    inspection_batch_create: {
      color: 'success',
      label: '📋 Создание ведомости осмотров',
    },
    update: { color: 'info', label: '📝 Изменение' },
    delete: { color: 'error', label: '🗑️ Удаление' },
    delete_batch: { color: 'error', label: '🗑️ Удаление партии' },
    assign_device_to_batch: { color: 'secondary', label: '📦 В партию' },
    remove_device_to_batch: { color: 'warning', label: '↩️ Из партии' },
    verify: { color: 'primary', label: '✅ Поверен' },
    assign_device_to_repair_batch: {
      color: 'secondary',
      label: '📦 В ремонтную ведомость',
    },
    remove_device_to_repair_batch: {
      color: 'warning',
      label: '↩️ Из ремонтной ведомости',
    },
    repair_batch_close: { color: 'success', label: '✅ Ремонт завершен' },
    delete_repair_batch: {
      color: 'error',
      label: '🗑️ Удаление ремонтной ведомости',
    },
    device_scrap: { color: 'error', label: '🗑️ Списан' },
    inspection_doc_save: { color: 'primary', label: '✅ Осмотрен' },
  };

  const fallbackAction = { color: 'default' as const, label: log.action };
  const currentAction =
    actionConfig[log.action as keyof typeof actionConfig] || fallbackAction;

  const ACTIONS_WITH_DETAILS: string[] = [
    'create', // Добавление нового СИ (показывает стартовый паспорт)
    'update', // Изменение карточки СИ (классическое Было / Стало)
    'verify', // Результаты контроля (показывает прикрепленную поверку Аршин)
    'inspection_doc_save', // Фиксация акта ТО (показывает результат годен/не годен и интервал)
  ];

  // Проверяем, входит ли экшен текущего лога в наш разрешенный список
  const hasDetails = ACTIONS_WITH_DETAILS.includes(log.action);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        display: 'flex',
        // На мобильных перестраиваемся в колонку, на десктопе — в линию
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        minWidth: 0, // Позволяет Flexbox правильно рассчитывать ширину для текста
        gap: { xs: 1.5, sm: 3 },
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'action.hover',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
          borderColor: 'primary.main',
        },
      }}
    >
      {/* КОНТЕНТНАЯ ЧАСТЬ (Информационные блоки лога) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={currentAction.label}
            color={currentAction.color as any}
            size="small"
            sx={{ fontWeight: 600, minWidth: 95, height: 24, flexShrink: 0 }}
          />
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              // Автоматический перенос текста (моделей, серийников), защищающий от сжатия кнопок
              wordBreak: 'break-word',
              minWidth: 0,
            }}
          >
            {log.description}
          </Typography>
        </Box>

        {/* МЕТАДАННЫЕ: Дата и Автор */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            📅 {formatLogDate(log.createdAt)}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              display: { xs: 'none', sm: 'inline' },
            }}
          >
            •
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            👤 Автор:{' '}
            <strong style={{ color: 'var(--mui-palette-text-primary)' }}>
              {log.user
                ? `${toCapital(log.user.lastName)} ${toCapital(
                    log.user.firstName
                  )}`
                : 'Система'}
            </strong>
          </Typography>
        </Box>
      </Box>

      {/* УПРАВЛЕНИЕ: Кнопки действий (Слепок и Удаление) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          //  Жесткий запрет на сжатие кнопок контентом слева
          flexShrink: 0,
          justifyContent: { xs: 'flex-end', sm: 'flex-start' },
          borderTop: { xs: '1px solid', sm: 'none' },
          borderColor: 'divider',
          pt: { xs: 1, sm: 0 },
        }}
      >
        {hasDetails && (
          <Tooltip title="Посмотреть слепок данных">
            <IconButton
              color="primary"
              size="medium"
              onClick={() => setIsDetailsOpen(true)}
              sx={{ borderRadius: 1.5 }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Удалить лог">
            <IconButton
              color="error"
              size="medium"
              disabled={!(user?.role === 'superadmin')}
              onClick={() => onDelete(log.id)}
              sx={{ borderRadius: 1.5 }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <AuditDetailsModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={log.description}
        oldData={log.oldData}
        newData={log.newData}
      />
    </Paper>
  );
}
