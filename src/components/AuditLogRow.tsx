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

  // const actionConfig: Record<
  //   'create' | 'update' | 'delete',
  //   { color: 'success' | 'info' | 'error'; label: string }
  // > = {
  //   create: { color: 'success' as const, label: 'Создание' },
  //   update: { color: 'info' as const, label: 'Изменение' },
  //   delete: { color: 'error' as const, label: 'Удаление' },
  // };
  const actionConfig: Record<
    'create' | 'update' | 'delete' | 'assign_batch' | 'remove_batch' | 'verify',
    {
      color: 'success' | 'info' | 'error' | 'secondary' | 'warning' | 'primary';
      label: string;
    }
  > = {
    create: { color: 'success' as const, label: 'Создание' },
    update: { color: 'info' as const, label: 'Изменение' },
    delete: { color: 'error' as const, label: 'Удаление' },

    // 🎯 НОВЫЕ ЦВЕТА И МЕТКИ ДЛЯ ПЛАНИРОВЩИКА ПОВЕРОК:
    assign_batch: { color: 'secondary' as const, label: '📦 В партию' },
    remove_batch: { color: 'warning' as const, label: '↩️ Из партии' },
    verify: { color: 'primary' as const, label: '✅ Поверен' },
  };

  const fallbackAction = { color: 'default' as const, label: log.action };
  const currentAction =
    actionConfig[log.action as keyof typeof actionConfig] || fallbackAction;

  // const currentAction =
  //   actionConfig[log.action as 'create' | 'update' | 'delete'];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'action.hover',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
          borderColor: 'primary.main',
        },
      }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={currentAction.label}
            color={currentAction.color}
            size="small"
            sx={{ fontWeight: 600, minWidth: 85, height: 24 }}
          />
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: 'text.primary' }}
          >
            {log.description}
          </Typography>
        </Box>

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
            color="text.light"
            sx={{ color: 'text.disabled' }}
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

      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
      >
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
