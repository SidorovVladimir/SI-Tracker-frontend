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
import BuildIcon from '@mui/icons-material/Build';
import PushPinIcon from '@mui/icons-material/PushPin'; // Иконка для занятых приборов
import { formatSentenceCase, formatStrictUpper } from '../utils/capitalize';

interface RepairPlanningPoolTableProps {
  devices: any[];
  loading: boolean;
  selectedDeviceIds: string[];
  onDeviceSelect: (id: string) => void;
  onDeviceClick: (id: string) => void;
}

export const RepairPlanningPoolTable: React.FC<
  RepairPlanningPoolTableProps
> = ({
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
        В очереди на ремонт пока нет оборудования.
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
        overflow: 'visible',
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
              <TableCell>Тип Контроля</TableCell>
              <TableCell>Дата дефекта</TableCell>
              <TableCell>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => {
              // 🌟 ФИКС: Проверяем маркер блокировки, пришедший с бэкенда
              const isAssigned = device.targetBatchId !== null;
              const isChecked = selectedDeviceIds.includes(device.id);

              // Если прибор в ремонте — подсвечиваем фиолетовым, если ждет ремонта — желтым дефектом
              const rowBgColor = isAssigned ? '#f3e5f5' : '#fffde7';

              return (
                <TableRow
                  key={device.id}
                  hover
                  sx={{ bgcolor: rowBgColor, cursor: 'pointer' }}
                  onClick={() => onDeviceClick(device.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      // 🌟 ФИКС: Чекбокс горит активным, если прибор уже заблокирован в ремонте
                      checked={isChecked || isAssigned}
                      disabled={isAssigned} // Намертво блокируем от двойного добавления
                      onChange={() => onDeviceSelect(device.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatSentenceCase(device.name)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatStrictUpper(device.model)}
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
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {device.validUntil
                      ? new Date(device.validUntil).toLocaleDateString('ru-RU')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        isAssigned
                          ? 'Оборудование уже распределено в ремонтную ведомость'
                          : 'Оборудование требует проведения ремонта КИПиА'
                      }
                      arrow
                    >
                      <Chip
                        icon={
                          isAssigned ? (
                            <PushPinIcon style={{ fontSize: 12 }} />
                          ) : (
                            <BuildIcon style={{ fontSize: 12 }} />
                          )
                        }
                        label={isAssigned ? 'В ведомости' : 'Дефект'}
                        size="small"
                        color={isAssigned ? 'secondary' : 'warning'}
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      />
                    </Tooltip>
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
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {devices.map((device) => {
          const isAssigned = device.targetBatchId !== null;
          const isChecked = selectedDeviceIds.includes(device.id);
          const cardBgColor = isAssigned ? '#f3e5f5' : '#fffde7';

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
                borderLeftColor: isAssigned ? 'secondary.main' : 'warning.main',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
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
                    checked={isChecked || isAssigned}
                    disabled={isAssigned} // 🌟 БЛОКИРОВКА ПОВТОРНОГО НАЖАТИЯ НА СМАРТФОНАХ
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

              <Typography
                variant="body1"
                sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '0.95rem' }}
              >
                {formatSentenceCase(device.name)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5, fontSize: '0.85rem' }}
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
                <Typography
                  variant="caption"
                  sx={{ color: 'text.primary', fontSize: '0.75rem' }}
                >
                  📋 Дата дефекта:{' '}
                  {device.validUntil
                    ? new Date(device.validUntil).toLocaleDateString('ru-RU')
                    : '—'}
                </Typography>

                <Chip
                  label={isAssigned ? 'В ведомости' : 'Ремонт'}
                  size="small"
                  color={isAssigned ? 'secondary' : 'warning'}
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
