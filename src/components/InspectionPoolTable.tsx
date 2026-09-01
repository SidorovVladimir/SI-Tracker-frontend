import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Paper,
  Tooltip,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import UpdateIcon from '@mui/icons-material/Update';
import { formatSentenceCase, formatStrictUpper } from '../utils/capitalize';
import { Search } from '@mui/icons-material';
import { formatDate } from '../utils/date';

interface InspectionPoolTableProps {
  devices: any[];
  loading: boolean;
  selectedDeviceIds: string[];
  onDeviceSelect: (id: string) => void;
  onDeviceClick: (id: string) => void;
}

export const InspectionPoolTable: React.FC<InspectionPoolTableProps> = ({
  devices,
  loading,
  selectedDeviceIds,
  onDeviceSelect,
  onDeviceClick,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (devices.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ p: 4, textAlign: 'center' }}
      >
        В этом месяце нет оборудования, требующего планового осмотра.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'auto', md: 0 },
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      {/* 🖥️ ДЕСКТОПНАЯ ВЕРСИЯ */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          display: { xs: 'none', md: 'block' },
          flex: 1,
          borderRadius: 2,
          overflowY: 'auto',
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Выбор</TableCell>
              <TableCell>Наименование / Тип</TableCell>
              <TableCell>Заводской №</TableCell>
              <TableCell>Последний осмотр</TableCell>
              <TableCell>Статус плана</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => {
              const isChecked = selectedDeviceIds.includes(device.id);
              return (
                <TableRow
                  key={device.id}
                  hover
                  sx={{
                    bgcolor: device.isOverdue ? '#ffebee' : 'inherit',
                    cursor: 'pointer',
                  }}
                  onClick={() => onDeviceClick(device.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      onChange={() => onDeviceSelect(device.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatSentenceCase(device.name)}
                      </Typography>
                      {device.isOverdue && (
                        <Tooltip
                          title="Регламентный внутренний осмотр оборудования просрочен!"
                          arrow
                        >
                          <ErrorOutlineIcon
                            color="error"
                            sx={{ fontSize: 18 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatStrictUpper(device.model)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  >
                    {device.serialNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {device.lastInspectionDate
                      ? formatDate(device.lastInspectionDate)
                      : 'Ни разу не проводился'}
                  </TableCell>
                  {/* <TableCell>
                    <Chip
                      icon={
                        device.isOverdue ? (
                          <ErrorOutlineIcon style={{ fontSize: 14 }} />
                        ) : (
                          <UpdateIcon style={{ fontSize: 14 }} />
                        )
                      }
                      label={device.isOverdue ? 'Просрочен ТО' : 'Плановое ТО'}
                      size="small"
                      color={device.isOverdue ? 'error' : 'success'}
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell> */}
                  <TableCell>
                    {device.isManualExtra ? (
                      // 🔥 Если прибор добавлен вручную на лету — вешаем крутой синий бейдж
                      <Chip
                        icon={<Search style={{ fontSize: 13 }} />}
                        label="Вне плана (СИ/СК)"
                        size="small"
                        color="primary"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                        }}
                      />
                    ) : (
                      // Ваша стандартная плановая логика (уже написанная у вас)
                      <Chip
                        icon={
                          device.isOverdue ? (
                            <ErrorOutlineIcon style={{ fontSize: 14 }} />
                          ) : (
                            <UpdateIcon style={{ fontSize: 14 }} />
                          )
                        }
                        label={
                          device.isOverdue ? 'Просрочен ТО' : 'Плановое ТО'
                        }
                        size="small"
                        color={device.isOverdue ? 'error' : 'success'}
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          gap: 1.5,
          p: 0.5,
        }}
      >
        {devices.map((device) => {
          const isChecked = selectedDeviceIds.includes(device.id);
          return (
            <Paper
              key={device.id}
              variant="outlined"
              onClick={() => onDeviceClick(device.id)}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: device.isOverdue ? '#ffebee' : 'background.paper',
                borderLeft: 4,
                borderLeftColor: device.isOverdue
                  ? 'error.main'
                  : 'success.main',
              }}
            >
              {/* <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Checkbox
                    size="medium"
                    checked={isChecked}
                    onChange={() => onDeviceSelect(device.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: 0 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace', ml: 1 }}
                  >
                    № {device.serialNumber}
                  </Typography>
                </Box>
                <Chip
                  label={device.isOverdue ? 'Долг ТО' : 'План ТО'}
                  size="small"
                  color={device.isOverdue ? 'error' : 'success'}
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }}
                />
              </Box> */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Checkbox
                    size="medium"
                    checked={isChecked}
                    onChange={() => onDeviceSelect(device.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: 0 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace', ml: 1 }}
                  >
                    № {device.serialNumber}
                  </Typography>
                </Box>

                <Chip
                  label={
                    device.isManualExtra
                      ? 'Вне плана'
                      : device.isOverdue
                      ? 'Долг ТО'
                      : 'План ТО'
                  }
                  size="small"
                  color={
                    device.isManualExtra
                      ? 'primary'
                      : device.isOverdue
                      ? 'error'
                      : 'success'
                  }
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }}
                />
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {formatSentenceCase(device.name)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Тип: {formatStrictUpper(device.model)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 1,
                  borderTop: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Был осмотрен:{' '}
                  {device.lastInspectionDate
                    ? formatDate(device.lastInspectionDate)
                    : '—'}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};
