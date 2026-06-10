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
import AndroidIcon from '@mui/icons-material/Android';
import PushPinIcon from '@mui/icons-material/PushPin';

interface PlanningPoolTableProps {
  devices: any[];
  loading: boolean;
  selectedDeviceIds: string[];
  onDeviceSelect: (id: string) => void;
  onDeviceClick: (id: string) => void;
}

export const PlanningPoolTable: React.FC<PlanningPoolTableProps> = ({
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
        В этом разделе пула пока нет оборудования.
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
      {/* 🖥️ ДЕСКТОПНАЯ ВЕРСИЯ: Отображается строго от разрешения md (планшеты/ПК) */}
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
              <TableCell>Наименование / Модель</TableCell>
              <TableCell>Заводской №</TableCell>
              <TableCell>Тип Контроля</TableCell>
              <TableCell>Годен до</TableCell>
              <TableCell>Расчет</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => {
              const isChecked = selectedDeviceIds.includes(device.id);
              const isAssigned = device.targetBatchId !== null;

              let rowBgColor = 'inherit';
              if (device.isManualPlacement)
                rowBgColor = '#f3e5f5'; // Фиолетовый для ручных
              else if (device.isOverdue) rowBgColor = '#ffebee'; // Мягкий красный для долгов

              return (
                <TableRow
                  key={device.id}
                  hover
                  sx={{ bgcolor: rowBgColor }}
                  onClick={() => onDeviceClick(device.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      disabled={isAssigned}
                      onChange={() => onDeviceSelect(device.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {device.name}
                      </Typography>
                      {device.isOverdue && !device.isManualPlacement && (
                        <Tooltip
                          title="Срок действия поверки этого СИ уже истек!"
                          arrow
                        >
                          <ErrorOutlineIcon
                            color="error"
                            sx={{ fontSize: 18, cursor: 'pointer' }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {device.model}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  >
                    {device.serialNumber}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={device.controlType}
                      size="small"
                      color={
                        device.controlType.toLowerCase() === 'индикатор'
                          ? 'warning'
                          : 'primary'
                      }
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '0.8rem',
                      color: device.isOverdue ? 'error.main' : 'inherit',
                      fontWeight: device.isOverdue ? 'bold' : 'normal',
                    }}
                  >
                    {device.validUntil
                      ? new Date(device.validUntil).toLocaleDateString('ru-RU')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        device.isManualPlacement
                          ? 'Закреплено вручную за черновиком'
                          : device.isOverdue
                          ? 'Автоматический долг прошлых периодов'
                          : 'Автоматический плановый расчет'
                      }
                      arrow
                    >
                      <Chip
                        icon={
                          device.isManualPlacement ? (
                            <PushPinIcon style={{ fontSize: 14 }} />
                          ) : (
                            <AndroidIcon style={{ fontSize: 14 }} />
                          )
                        }
                        label={
                          device.isManualPlacement
                            ? 'В партии'
                            : device.isOverdue
                            ? 'Долг'
                            : 'Авто'
                        }
                        size="small"
                        color={
                          device.isManualPlacement
                            ? 'secondary'
                            : device.isOverdue
                            ? 'error'
                            : 'success'
                        }
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ: Карточки, отображаются строго на экранах меньше md (смартфоны) */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          gap: 1.5,
          p: 0.5,
          overflow: 'visible',
        }}
      >
        {devices.map((device) => {
          const isChecked = selectedDeviceIds.includes(device.id);
          const isAssigned = device.targetBatchId !== null;

          let cardBgColor = 'background.paper';
          if (device.isManualPlacement) cardBgColor = '#f3e5f5';
          else if (device.isOverdue) cardBgColor = '#ffebee';

          return (
            <Paper
              key={device.id}
              variant="outlined"
              onClick={() => onDeviceClick(device.id)}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: cardBgColor,
                borderLeft: 4,
                borderLeftColor: device.isManualPlacement
                  ? 'secondary.main'
                  : device.isOverdue
                  ? 'error.main'
                  : 'success.main',
              }}
            >
              {/* Верхняя строка карточки */}
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
                    size="medium" // Крупнее для удобного нажатия пальцем
                    checked={isChecked}
                    disabled={isAssigned}
                    onChange={() => onDeviceSelect(device.id)}
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
                  label={device.controlType}
                  size="small"
                  variant="outlined"
                  color={
                    device.controlType.toLowerCase() === 'индикатор'
                      ? 'warning'
                      : 'primary'
                  }
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              </Box>

              {/* Паспортные данные в центре */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {device.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Модель: {device.model}
              </Typography>

              {/* Нижняя строчка с датами и маркером расчета */}
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
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: device.isOverdue ? 'bold' : 'normal',
                    color: device.isOverdue ? 'error.main' : 'text.primary',
                  }}
                >
                  {device.isOverdue ? '⚠️ Просрочен до: ' : 'Годен до: '}
                  {device.validUntil
                    ? new Date(device.validUntil).toLocaleDateString('ru-RU')
                    : '—'}
                </Typography>

                <Chip
                  label={
                    device.isManualPlacement
                      ? 'В партии'
                      : device.isOverdue
                      ? 'Долг'
                      : 'Авто'
                  }
                  size="small"
                  color={
                    device.isManualPlacement
                      ? 'secondary'
                      : device.isOverdue
                      ? 'error'
                      : 'success'
                  }
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }}
                />
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};
