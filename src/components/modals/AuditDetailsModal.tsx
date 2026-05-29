import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  Stack,
} from '@mui/material';
import { ListAlt } from '@mui/icons-material';
import {
  FIELD_TRANSLATIONS,
  formatAuditValue,
  VerificationsList,
} from '../../utils/auditMap';

// --- КОМПОНЕНТ ВЛОЖЕННОЙ МОДАЛКИ ПОВЕРОК (АДАПТИВНЫЙ) ---
interface VerificationsSubModalProps {
  open: boolean;
  onClose: () => void;
  oldVerifications: any[];
  newVerifications: any[];
}

function VerificationsSubModal({
  open,
  onClose,
  oldVerifications = [],
  newVerifications = [],
}: VerificationsSubModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          borderBottom: '1px solid #e2e8f0',
          fontSize: '1.05rem',
        }}
      >
        Сравнение списков поверок прибора
      </DialogTitle>

      <DialogContent sx={{ p: 2, bgcolor: '#f8fafc' }}>
        {/* Сетка перестраивается: на мобилках в одну колонку (xs: 12), на ПК в две (md: 6) */}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Левая колонка — Состояние БЫЛО */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 1, pl: 0.5 }}>
              <Typography
                variant="subtitle2"
                color="error.main"
                sx={{ fontWeight: 700, fontSize: '0.85rem' }}
              >
                Было (До изменений) — {oldVerifications?.length || 0} шт.
              </Typography>
            </Box>
            <VerificationsList items={oldVerifications} type="old" />
          </Grid>

          {/* Правая колонка — Состояние СТАЛО */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 1, pl: 0.5 }}>
              <Typography
                variant="subtitle2"
                color="success.main"
                sx={{ fontWeight: 700, fontSize: '0.85rem' }}
              >
                Стало (После изменений) — {newVerifications?.length || 0} шт.
              </Typography>
            </Box>
            <VerificationsList items={newVerifications} type="new" />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{ p: 1.5, borderTop: '1px solid #e2e8f0', bgcolor: '#ffffff' }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Вернуться к слепку прибора
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- ГЛАВНЫЙ КОМПОНЕНТ МОДАЛЬНОГО ОКНА ИСТОРИИ ИЗМЕНЕНИЙ ---
interface AuditDetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  oldData: string | null;
  newData: string | null;
}

export default function AuditDetailsModal({
  open,
  onClose,
  title,
  oldData,
  newData,
}: AuditDetailsModalProps) {
  const [subModalOpen, setSubModalOpen] = useState(false);

  const oldObj = oldData ? JSON.parse(oldData) : {};
  const newObj = newData ? JSON.parse(newData) : {};

  // Формируем уникальный список ключей характеристик без учета системных полей

  const allKeys = Array.from(
    new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  ).filter(
    (key) =>
      !['updatedAt', 'createdAt', 'id'].includes(key) &&
      !key.endsWith('Id') &&
      !key.endsWith('ToDevices')
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 600,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          Полный слепок состояния прибора
        </DialogTitle>

        <DialogContent sx={{ mt: 2, p: 0 }}>
          <Box sx={{ px: 3, mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>

          {/* ================= ВАРИАНТ ДЛЯ ПК: СТАНДАРТНАЯ ТАБЛИЦА ================= */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              border: 'none',
              borderRadius: 0,
              maxHeight: '65vh',
              display: { xs: 'none', sm: 'block' }, // Скрываем на мобильных, показываем на sm и выше
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'background.default',
                      width: '30%',
                    }}
                  >
                    Характеристика
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'background.default',
                      color: '#c62828',
                      width: '35%',
                    }}
                  >
                    Было (До изменения)
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'background.default',
                      color: '#2e7d32',
                      width: '35%',
                    }}
                  >
                    Стало (После изменения)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allKeys.map((key) => {
                  const oldValRaw = oldObj[key];
                  const newValRaw = newObj[key];

                  // Специальная компактная строка для Поверок на ПК
                  if (key === 'verifications') {
                    const isVerificationsChanged =
                      JSON.stringify(oldValRaw) !== JSON.stringify(newValRaw);
                    const oldLength = Array.isArray(oldValRaw)
                      ? oldValRaw.length
                      : 0;
                    const newLength = Array.isArray(newValRaw)
                      ? newValRaw.length
                      : 0;

                    return (
                      <TableRow
                        key={key}
                        sx={{
                          bgcolor: isVerificationsChanged
                            ? 'action.hover'
                            : 'inherit',
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: isVerificationsChanged ? 600 : 400,
                            color: 'text.secondary',
                          }}
                        >
                          {FIELD_TRANSLATIONS[key] || key}{' '}
                          {isVerificationsChanged && '✏️'}
                        </TableCell>
                        <TableCell colSpan={2} sx={{ py: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '0.85rem' }}
                            >
                              Было поверок: <b>{oldLength}</b> → Стало:{' '}
                              <b>{newLength}</b>
                            </Typography>
                            <Button
                              variant="contained"
                              color={
                                isVerificationsChanged ? 'warning' : 'inherit'
                              }
                              size="small"
                              startIcon={<ListAlt fontSize="small" />}
                              onClick={() => setSubModalOpen(true)}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                py: 0.4,
                              }}
                            >
                              Посмотреть списки ({oldLength + newLength})
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  const oldValFormatted = formatAuditValue(oldValRaw);
                  const newValFormatted = formatAuditValue(newValRaw);
                  const isFieldChanged = oldValFormatted !== newValFormatted;

                  return (
                    <TableRow
                      key={key}
                      hover
                      sx={{
                        bgcolor: isFieldChanged ? 'action.hover' : 'inherit',
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: isFieldChanged ? 600 : 400,
                          color: 'text.secondary',
                        }}
                      >
                        {FIELD_TRANSLATIONS[key] || key}{' '}
                        {isFieldChanged && '✏️'}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: isFieldChanged ? '#d32f2f' : 'text.primary',
                          textDecoration: isFieldChanged
                            ? 'line-through'
                            : 'none',
                          verticalAlign: 'top',
                        }}
                      >
                        {oldValFormatted}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: isFieldChanged ? '#2e7d32' : 'text.primary',
                          fontWeight: isFieldChanged ? 600 : 400,
                          verticalAlign: 'top',
                        }}
                      >
                        {newValFormatted}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {/* ================= ВАРИАНТ ДЛЯ МОБИЛОК: ВЕРТИКАЛЬНЫЙ СПИСОК КАРТОЧЕК ================= */}
          <Box
            sx={{
              display: { xs: 'block', sm: 'none' }, // Показываем исключительно на маленьких экранах
              maxHeight: '65vh',
              overflowY: 'auto',
              px: 2,
              pb: 2,
            }}
          >
            <Stack spacing={1.5}>
              {allKeys.map((key) => {
                const oldValRaw = oldObj[key];
                const newValRaw = newObj[key];

                // Карточка Поверок на мобильном
                if (key === 'verifications') {
                  const isVerificationsChanged =
                    JSON.stringify(oldValRaw) !== JSON.stringify(newValRaw);
                  const oldLength = Array.isArray(oldValRaw)
                    ? oldValRaw.length
                    : 0;
                  const newLength = Array.isArray(newValRaw)
                    ? newValRaw.length
                    : 0;

                  return (
                    <Box
                      key={key}
                      sx={{
                        p: 1.5,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isVerificationsChanged
                          ? 'warning.main'
                          : '#e0e0e0',
                        bgcolor: isVerificationsChanged ? '#fffbeb' : '#ffffff',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                      >
                        {FIELD_TRANSLATIONS[key] || key}{' '}
                        {isVerificationsChanged && '✏️'}
                      </Typography>
                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Было поверок:
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {oldLength} шт.
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Стало поверок:
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {newLength} шт.
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color={isVerificationsChanged ? 'warning' : 'inherit'}
                          size="small"
                          fullWidth
                          startIcon={<ListAlt fontSize="small" />}
                          onClick={() => setSubModalOpen(true)}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            mt: 0.5,
                          }}
                        >
                          Сравнить списки поверок
                        </Button>
                      </Stack>
                    </Box>
                  );
                }

                // Карточки стандартных текстовых характеристик на мобильном
                const oldValFormatted = formatAuditValue(oldValRaw);
                const newValFormatted = formatAuditValue(newValRaw);
                const isFieldChanged = oldValFormatted !== newValFormatted;

                return (
                  <Box
                    key={key}
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isFieldChanged ? 'divider' : '#e0e0e0',
                      bgcolor: isFieldChanged ? 'action.hover' : '#ffffff',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                    >
                      {FIELD_TRANSLATIONS[key] || key} {isFieldChanged && '✏️'}
                    </Typography>

                    <Grid container spacing={1}>
                      {/* Было (До) */}
                      <Grid size={{ xs: 4 }}>
                        <Typography
                          variant="caption"
                          color="error.main"
                          sx={{ fontWeight: 500 }}
                        >
                          Было:
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 8 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isFieldChanged ? '#d32f2f' : 'text.primary',
                            textDecoration: isFieldChanged
                              ? 'line-through'
                              : 'none',
                            wordBreak: 'break-word',
                          }}
                        >
                          {oldValFormatted}
                        </Typography>
                      </Grid>

                      {/* Стало (После) */}
                      <Grid size={{ xs: 4 }}>
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ fontWeight: 500 }}
                        >
                          Стало:
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 8 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isFieldChanged ? '#2e7d32' : 'text.primary',
                            fontWeight: isFieldChanged ? 600 : 400,
                            wordBreak: 'break-word',
                          }}
                        >
                          {newValFormatted}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{
              // На мобилках (xs) ширина 100%, от планшетов (sm) и выше — автоматическая
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Закрыть слепок
          </Button>
        </DialogActions>
      </Dialog>

      {/* Вызов дочернего окна сравнения поверок */}
      <VerificationsSubModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        oldVerifications={oldObj.verifications}
        newVerifications={newObj.verifications}
      />
    </>
  );
}
