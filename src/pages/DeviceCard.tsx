import { useQuery } from '@apollo/client/react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { CalendarMonth, Close, Edit, ExpandMore } from '@mui/icons-material';

import { GetDeviceWithRelationDocument } from '../graphql/types/__generated__/graphql';
import { formatDate } from '../utils/date';
import { useAuth } from '../hooks/useAuth';
import { toCapital } from '../utils/capitalize';

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined | number;
}) => (
  <Box sx={{ mb: 1 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
      sx={{ lineHeight: 1.2 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.4,
        textTransform: 'uppercase',
        etterSpacing: '0.6px',
        fontSize: '0.9rem',
      }}
    >
      {value || '-'}
    </Typography>
  </Box>
);

export default function DeviceCard(props: {
  deviceId: string;
  closeDetails: () => void;
  onEdit: () => void;
}) {
  const { deviceId, closeDetails, onEdit } = props;
  const { user } = useAuth();
  const {
    data: deviceData,
    loading,
    error,
  } = useQuery(GetDeviceWithRelationDocument, {
    variables: {
      id: deviceId,
    },
    fetchPolicy: 'network-only',
  });

  const isMobileRoute = window.location.pathname.startsWith('/m/');

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Ошибка загрузки СИ: {error.message}
      </Alert>
    );
  if (!deviceData?.device) return <Alert>СИ не найдено</Alert>;

  const device = deviceData.device;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography
          variant="h6"
          gutterBottom
          color="primary"
          sx={{ fontWeight: 700 }}
        >
          Информация о СИ
        </Typography>
        <Stack direction="row" spacing={1}>
          {user?.role !== 'user' && !isMobileRoute && (
            <Tooltip title="Редактировать">
              <IconButton onClick={onEdit} size="small" color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {!isMobileRoute && (
            <Tooltip title="Закрыть">
              <IconButton onClick={closeDetails}>
                <Close />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <Box mb={2}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 0.5,
            fontSize: { xs: '1.15rem', sm: '1.25rem' },
          }}
        >
          {toCapital(device.name)}
        </Typography>
        <Chip
          label={device.status.name}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderColor:
              device.status.name === 'исправен'
                ? 'success.main'
                : device.status.name === 'забракован' ||
                  device.status.name === 'неисправен'
                ? 'error.main'
                : 'primary.main',
            color:
              device.status.name === 'исправен'
                ? 'success.dark'
                : device.status.name === 'забракован' ||
                  device.status.name === 'неисправен'
                ? 'error.dark'
                : 'primary.dark',
            bgcolor:
              device.status.name === 'исправен'
                ? '#f0fdf4'
                : device.status.name === 'забракован' ||
                  device.status.name === 'неисправен'
                ? '#fff1f2'
                : 'transparent',
          }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={0.5} mb={3}>
        <InfoRow label="Модель" value={device.model} />

        <InfoRow label="Зав. №" value={device.serialNumber} />
        <InfoRow label="Инвентарный номер" value={device.inventoryNumber} />
        <InfoRow label="ГРСИ" value={device.grsiNumber} />

        <InfoRow label="Изготовитель" value={device.manufacturer} />
        <InfoRow label="Номенклатура" value={device.nomenclature} />
        {device.comment && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
            <InfoRow label="Комментарий" value={device.comment} />
          </Box>
        )}
      </Stack>

      <Typography
        variant="overline"
        color="primary"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.8px',
        }}
      >
        Характеристики
      </Typography>
      <Box sx={{ bgcolor: '#f8f9fa', p: 1.5, borderRadius: 2, mt: 1, mb: 3 }}>
        <InfoRow label="Диапазон" value={device.measurementRange} />
        <InfoRow label="Точность" value={device.accuracy} />
        <InfoRow label="МПИ" value={device.verificationInterval} />
        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 1, fontWeight: 500 }}
        >
          Сферы государственного регулирования обеспечения единства измерения
          (ГРОЕИ)
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {device.scopes?.length > 0 ? (
            device.scopes.map((scope) => (
              <Chip
                key={scope.id}
                label={scope.name}
                size="small"
                variant="outlined"
                sx={{
                  height: 'auto',
                  '& .MuiChip-label': {
                    textTransform: 'uppercase',
                    letterSpacing: '0.55px',
                    display: 'block',
                    whiteSpace: 'normal',
                    py: 0.5,
                    fontSize: '0.75rem',
                  },
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.disabled">
              Не указаны
            </Typography>
          )}
        </Stack>
        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 1, fontWeight: 500 }}
        >
          Государственные первичные эталоны (ГПЭ)
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {device.primaryStandarts?.length > 0 ? (
            device.primaryStandarts.map((primaryStandart) => (
              <Chip
                key={primaryStandart.id}
                label={primaryStandart.name}
                size="small"
                variant="outlined"
                sx={{
                  height: 'auto',
                  '& .MuiChip-label': {
                    textTransform: 'uppercase',
                    display: 'block',
                    whiteSpace: 'normal',
                    py: 0.5,
                    fontSize: '0.75rem',
                    letterSpacing: '0.55px',
                  },
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.disabled">
              Не указаны
            </Typography>
          )}
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} mb={1}>
        <Box flex={1}>
          <InfoRow
            label="Дата выпуска"
            value={device?.releaseDate ? formatDate(device.releaseDate) : null}
          />
        </Box>
        <Box flex={1}>
          <InfoRow
            label="Дата ввода"
            value={device?.receiptDate ? formatDate(device.receiptDate) : null}
          />
        </Box>
      </Stack>

      <InfoRow label="Участок" value={device.productionSite.name} />
      <InfoRow label="Тип оборудования" value={device.equipmentType?.name} />

      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1, fontWeight: 500 }}
      >
        Вид измерений
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {device.measurementTypes?.length > 0 ? (
          device.measurementTypes.map((measurementType) => (
            <Chip
              key={measurementType.id}
              label={measurementType.name}
              size="small"
              variant="outlined"
              sx={{
                height: 'auto',
                '& .MuiChip-label': {
                  textTransform: 'uppercase',
                  display: 'block',
                  whiteSpace: 'normal',
                  py: 0.5,
                  fontSize: '0.75rem',
                  letterSpacing: '0.55px',
                },
              }}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.disabled">
            Не указаны
          </Typography>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CalendarMonth fontSize="small" /> История метрологического контроля
      </Typography>

      {device.verifications.map((v) => (
        <Accordion
          key={v.id}
          disableGutters
          elevation={0}
          sx={{
            mb: 1,
            border: '1px solid #e0e0e0',
            borderRadius: '8px !important',
            overflow: 'hidden',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore fontSize="small" />}
            sx={{
              minHeight: 48,
              '&.Mui-expanded': { minHeight: 48 },
              bgcolor: v.result === 'Годен' ? '#f0fdf4' : '#fff1f2',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ width: '100%', pr: 1 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                До {v?.validUntil ? formatDate(v.validUntil) : '-'}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5, borderTop: '1px solid #eee' }}>
            <Stack spacing={1}>
              <InfoRow
                label="Дата поверки"
                value={v?.date ? formatDate(v.date) : '-'}
              />
              <InfoRow label="№ Свидетельства" value={v.protocolNumber} />
              <InfoRow
                label="Поверитель"
                value={v.verificationOrganization?.name}
              />
              <InfoRow
                label="Вид контроля"
                value={v.metrologyControleType?.name}
              />
              <InfoRow label="Результат" value={v.result} />
              <InfoRow label="Стоимость" value={v.cost} />

              {v.comment && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
                  <InfoRow label="Комментарий" value={v.comment} />
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
