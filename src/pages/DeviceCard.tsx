import { useQuery } from '@apollo/client/react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  CalendarMonth,
  CheckCircleOutline,
  Close,
  ContentCopy,
  Delete,
  Edit,
  ExpandMore,
  FileUpload,
  HighlightOff,
  InsertDriveFile,
} from '@mui/icons-material';

import { GetDeviceWithRelationDocument } from '../graphql/types/__generated__/graphql';
import { formatDate } from '../utils/date';
import { useAuth } from '../hooks/useAuth';
import { formatSentenceCase, toCapital } from '../utils/capitalize';
import { useState } from 'react';
import { API_ROUTES } from '../config';
import { useSnackbar } from 'notistack';

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const InfoRow = ({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string | null | undefined | number;
  isLink?: boolean;
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
      component={isLink && value ? 'a' : 'p'}
      href={isLink && value ? String(value) : undefined}
      target={isLink ? '_blank' : undefined}
      rel={isLink ? 'noopener noreferrer' : undefined}
      sx={{
        fontWeight: 500,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.4,
        textTransform: isLink ? undefined : 'uppercase',
        fontSize: '0.9rem',
        color: isLink ? 'primary.main' : 'inherit',
        textDecoration: isLink ? 'underline' : 'none',
        display: 'block',
      }}
    >
      {value || '-'}
    </Typography>
  </Box>
);
// const InfoRow = ({
//   label,
//   value,
//   isLink,
// }: {
//   label: string;
//   value: string | null | undefined | number;
//   isLink?: boolean;
// }) => (
//   <Box
//     sx={{
//       mb: 1,
//       display: 'flex',
//       flexDirection: { xs: 'column', sm: 'row' }, // На мобилках вертикально, на ПК — в одну строку
//       alignItems: { xs: 'flex-start', sm: 'center' },
//       justifyContent: 'space-between', // Параметр влево, значение вправо
//       gap: { xs: 0.5, sm: 2 },
//     }}
//   >
//     <Typography
//       variant="caption"
//       color="text.secondary"
//       display="block"
//       sx={{
//         lineHeight: 1.2,
//         flexShrink: 0,
//       }}
//     >
//       {label}
//     </Typography>
//     <Typography
//       variant="body2"
//       component={isLink && value ? 'a' : 'p'}
//       href={isLink && value ? String(value) : undefined}
//       target={isLink ? '_blank' : undefined}
//       rel={isLink ? 'noopener noreferrer' : undefined}
//       sx={{
//         fontWeight: 500, // Вернули исходную насыщенность
//         whiteSpace: 'pre-wrap',
//         wordBreak: 'break-word',
//         lineHeight: 1.4,
//         textTransform: isLink ? undefined : 'uppercase',
//         fontSize: '0.9rem', // Вернули исходный размер шрифта
//         color: isLink ? 'primary.main' : 'inherit',
//         textDecoration: isLink ? 'underline' : 'none',
//         display: 'block',
//         textAlign: { xs: 'left', sm: 'right' }, // На ПК прижимаем текст вправо
//       }}
//     >
//       {value || '-'}
//     </Typography>
//   </Box>
// );

export default function DeviceCard(props: {
  deviceId: string;
  closeDetails: () => void;
  onEdit: () => void;
  onDuplicate?: (device: any) => void;
}) {
  const { deviceId, closeDetails, onEdit, onDuplicate } = props;
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [fileUploading, setFileUploading] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const {
    data: deviceData,
    loading,
    error,
    refetch,
  } = useQuery(GetDeviceWithRelationDocument, {
    variables: {
      id: deviceId,
    },
    fetchPolicy: 'network-only',
  });

  const isMobileRoute = window.location.pathname.startsWith('/m/');

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    docType: 'manual' | 'passport'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !deviceData?.device) return;

    const MAX_FILE_SIZE_MB = 20;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      enqueueSnackbar(
        `Файл слишком тяжелый! Максимальный размер: ${MAX_FILE_SIZE_MB} МБ. Ваш файл: ${formatBytes(
          file.size
        )}`,
        { variant: 'info' }
      );
      event.target.value = '';
      return;
    }

    setFileUploading(true);
    const device = deviceData.device;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);

    const defaultName =
      docType === 'manual'
        ? `РЭ ${device.name} ${device.model}` // Для РЭ автоимя — это хорошо, оно стандартизирует инструкции
        : file.name; // Для паспортов, фото и актов берем оригинальное имя загружаемого файла!

    formData.append('name', defaultName);

    if (docType === 'passport') {
      formData.append('deviceId', device.id);
    } else {
      formData.append('modelName', device.model);
      if (device.grsiNumber) formData.append('grsiNumber', device.grsiNumber);
    }

    try {
      const response = await fetch(API_ROUTES.upload, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        enqueueSnackbar('Не удалось загрузить файл', { variant: 'error' });
      }
      enqueueSnackbar('Файл успешно загружен', { variant: 'success' });
      await refetch();
    } catch (err: any) {
      enqueueSnackbar(`Ошибка загрузки: ${err.message}`, { variant: 'error' });
    } finally {
      setFileUploading(false);
    }
  };

  // Функция удаления файла через REST API
  const handleFileDelete = async (documentId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот документ?'))
      return;
    try {
      const response = await fetch(API_ROUTES.delete(documentId), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        enqueueSnackbar('Не удалось удалить файл', { variant: 'error' });
      }
      enqueueSnackbar('Файл успешно удален', { variant: 'success' });
      await refetch();
    } catch (err: any) {
      enqueueSnackbar(`Ошибка при удалении: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  // const handleOpenDocument = async (
  //   e: React.MouseEvent<HTMLAnchorElement>,
  //   fileUrl: string
  // ) => {
  //   e.preventDefault();

  //   try {
  //     const response = await fetch(fileUrl, {
  //       method: 'HEAD',
  //       credentials: 'include',
  //     });

  //     if (response.status === 404) {
  //       enqueueSnackbar(
  //         'Этот файл физически отсутствует на сервере. Возможно, он был удален.',
  //         {
  //           variant: 'warning',
  //         }
  //       );
  //     } else {
  //       window.open(fileUrl, '_blank', 'noopener,noreferrer');
  //     }
  //   } catch (err) {
  //     window.open(fileUrl, '_blank', 'noopener,noreferrer');
  //   }
  // };

  const handleOpenDocument = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    fileUrl: string,
    mimeType?: string | null,
    fileName?: string
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(fileUrl, {
        method: 'HEAD',
        credentials: 'include',
      });

      if (response.status === 404) {
        enqueueSnackbar(
          'Этот файл физически отсутствует на сервере. Возможно, он был удален.',
          { variant: 'warning' }
        );
        return; // Останавливаем выполнение, если файла нет
      }

      // 1. ПРОВЕРЯЕМ: Картинка это или документ?
      // Проверяем по mimeType ИЛИ по расширению в имени файла (на случай моков)
      const isImage =
        mimeType?.startsWith('image/') || fileName?.match(/\.(jpg|jpeg|png)$/i);

      if (isImage) {
        // Если картинка — просто открываем её в нашей всплывающей модалке прямо в приложении!
        setPreviewImage(fileUrl);
        return;
      }

      // 2. ЕСЛИ ЭТО ДОКУМЕНТ (PDF/WORD) — ПРОВЕРЯЕМ РЕЖИМ ЭКРАНА «ДОМОЙ» (PWA)
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        // В PWA-режиме для PDF создаем скрытую ссылку, чтобы заставить смартфон скачать файл в память
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = fileName || 'document';
        downloadLink.target = '_self';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        // В обычном браузере на ПК открываем PDF как обычно в новой вкладке
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      // Резервный вариант на случай сбоя сети
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

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

  const formatUserName = (
    user: { firstName?: string; lastName?: string } | null
  ) => {
    if (!user) return 'Система';
    const firstInit = user.firstName ? `${user.firstName.charAt(0)}.` : '';
    return `${user.lastName || ''} ${firstInit}`.trim();
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        // alignItems="center"
        alignItems="flex-start"
        mb={1}
      >
        {/* <Typography
          variant="h6"
          gutterBottom
          color="primary"
          sx={{ fontWeight: 700 }}
        >
          Информация о СИ
        </Typography> */}

        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            Информация о СИ
          </Typography>

          {user?.role !== 'user' && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              rowGap={0.2}
              sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Создан: {device.createdAt ? formatDate(device.createdAt) : '—'}{' '}
                ({formatUserName(device.createdBy)})
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  fontSize: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Изменен: {device.updatedAt ? formatDate(device.updatedAt) : '—'}{' '}
                ({formatUserName(device.updatedBy)})
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          {user?.role !== 'user' && !isMobileRoute && onDuplicate && (
            <Tooltip title="Создать дубликат">
              <IconButton
                onClick={() => onDuplicate(device)}
                size="small"
                color="primary"
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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

      {/* <Box mb={2}>
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
        
      </Box> */}
      <Box mb={2.5}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 1,
            fontSize: { xs: '1.15rem', sm: '1.25rem' },
          }}
        >
          {toCapital(device.name)}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
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

          {user?.role !== 'user' && (
            <Chip
              size="small"
              label={
                device.scheduleStatus === 'paused_verification'
                  ? '🛠️ Только ТО (Без поверок)'
                  : device.scheduleStatus === 'paused_all'
                  ? '⏸️ Плановая пауза'
                  : '📅 В полном плане'
              }
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor:
                  device.scheduleStatus === 'paused_verification'
                    ? '#fff7ed' // Мягкий оранжевый
                    : device.scheduleStatus === 'paused_all'
                    ? '#f3f4f6' // Нейтральный серый
                    : '#eff6ff', // Мягкий синий
                color:
                  device.scheduleStatus === 'paused_verification'
                    ? '#c2410c'
                    : device.scheduleStatus === 'paused_all'
                    ? '#4b5563'
                    : '#1d4ed8',
                border: '1px solid',
                borderColor:
                  device.scheduleStatus === 'paused_verification'
                    ? '#ffedd5'
                    : device.scheduleStatus === 'paused_all'
                    ? '#e5e7eb'
                    : '#dbeafe',
              }}
            />
          )}
        </Stack>

        {user?.role !== 'user' && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1-fr 1fr' },
              gap: 1.5,
            }}
          >
            {/* Блок Поверки / Калибровки */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CalendarMonth
                fontSize="small"
                color={
                  device.scheduleStatus === 'active' ? 'primary' : 'disabled'
                }
                sx={{ mt: 0.2 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', fontWeight: 500, lineHeight: 1 }}
                >
                  Следующая поверка / калибровка:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    // Если прибор активен и просрочен — подсветим дату красным
                    color:
                      device.scheduleStatus !== 'paused_all'
                        ? 'text.primary'
                        : 'text.disabled',
                  }}
                >
                  {device.scheduleStatus === 'active'
                    ? device.nextVerificationDate
                      ? formatDate(device.nextVerificationDate)
                      : 'Не назначена'
                    : '⏸️ Контроль отключен (Пауза)'}
                </Typography>
              </Box>
            </Box>

            {/* Блок Цехового Осмотра (ТО) */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <AccessTime
                fontSize="small"
                color={
                  device.scheduleStatus !== 'paused_all'
                    ? 'success'
                    : 'disabled'
                }
                sx={{ mt: 0.2 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', fontWeight: 500, lineHeight: 1 }}
                >
                  Следующий цеховой осмотр (ТО):
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    color:
                      device.scheduleStatus !== 'paused_all'
                        ? 'text.primary'
                        : 'text.disabled',
                  }}
                >
                  {device.scheduleStatus !== 'paused_all'
                    ? device.nextInspectionDate
                      ? formatDate(device.nextInspectionDate)
                      : 'Не проводился / Разовый'
                    : '⏸️ Обходы заморожены'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={0.5} mb={3}>
        <InfoRow label="Тип" value={device.model} />

        <InfoRow label="Зав. №" value={device.serialNumber} />
        <InfoRow label="Инвентарный номер" value={device.inventoryNumber} />
        <InfoRow label="ГРСИ" value={device.grsiNumber} />
        <InfoRow label="Код СИ" value={device.csmCode} />

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

      <InfoRow label="Город" value={device.productionSite.city.name} />
      <InfoRow label="Организация" value={device.productionSite.company.name} />

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
      <Accordion
        variant="outlined"
        sx={{ mb: 2, borderRadius: '8px !important', overflow: 'hidden' }}
      >
        <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <InsertDriveFile fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Документация прибора ({device.documents.length || 0})
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, px: { xs: 1.5, sm: 2 }, pb: 2 }}>
          {fileUploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="caption">
                Сохранение файла на сервере...
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 2.5, mt: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontWeight: 600, mb: 0.5, letterSpacing: '0.3px' }}
            >
              РУКОВОДСТВО ПО ЭКСПЛУАТАЦИИ
            </Typography>
            {device.documents?.find((d: any) => d.type === 'manual') ? (
              (() => {
                const manual = device.documents.find(
                  (d: any) => d.type === 'manual'
                )!;
                return (
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{
                      p: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      bgcolor: '#fbfbfb',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      sx={{ width: '100%' }}
                    >
                      <InsertDriveFile
                        fontSize="small"
                        color="primary"
                        sx={{ mt: 0.3, flexShrink: 0 }}
                      />
                      <Typography
                        variant="body2"
                        component="a"
                        href="#"
                        // onClick={(e) => handleOpenDocument(e, manual.fileUrl)}
                        onClick={(e) =>
                          handleOpenDocument(
                            e,
                            manual.fileUrl,
                            manual.mimeType,
                            manual.name
                          )
                        }
                        sx={{
                          fontWeight: 500,
                          color: 'primary.main',
                          cursor: 'pointer',
                        }}
                      >
                        {manual.name}{' '}
                        {manual.fileSize && `(${formatBytes(manual.fileSize)})`}
                      </Typography>
                    </Stack>
                    {user?.role !== 'user' && (
                      <Tooltip title="Удалить руководство">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleFileDelete(manual.id)}
                          sx={{ p: 0.5, flexShrink: 0 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                );
              })()
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: 'italic',
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  }}
                >
                  Не загружено
                </Typography>
                {user?.role !== 'user' && (
                  <Button
                    variant="outlined"
                    size="small"
                    component="label"
                    startIcon={<FileUpload />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      py: 0.2,
                      px: 1,
                      flexShrink: 0,
                    }}
                  >
                    Загрузить
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={(e) => handleFileUpload(e, 'manual')}
                      disabled={fileUploading}
                    />
                  </Button>
                )}
              </Stack>
            )}
          </Box>

          <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontWeight: 600, mb: 0.5, letterSpacing: '0.3px' }}
            >
              ДОКУМЕНТЫ, ФОТО И АКТЫ ЭКЗЕМПЛЯРА
            </Typography>
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              {device.documents
                ?.filter((d: any) => d.type === 'passport')
                .map((doc: any) => {
                  const isImage =
                    doc.mimeType?.startsWith('image/') ||
                    doc.name.match(/\.(jpg|jpeg|png)$/i);

                  return (
                    <Stack
                      key={doc.id}
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{
                        p: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        bgcolor: '#fbfbfb',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        sx={{ width: '100%' }}
                      >
                        <InsertDriveFile
                          fontSize="small"
                          color={isImage ? 'success' : 'action'}
                          sx={{ mt: 0.3, flexShrink: 0 }}
                        />
                        <Typography
                          variant="body2"
                          component="a"
                          href="#"
                          // onClick={(e) => handleOpenDocument(e, doc.fileUrl)}
                          onClick={(e) =>
                            handleOpenDocument(
                              e,
                              doc.fileUrl,
                              doc.mimeType,
                              doc.name
                            )
                          }
                          sx={{
                            fontWeight: 500,
                            color: 'primary.main',
                            cursor: 'pointer',
                          }}
                        >
                          {doc.name}{' '}
                          {doc.fileSize && `(${formatBytes(doc.fileSize)})`}
                        </Typography>
                      </Stack>
                      {user?.role !== 'user' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleFileDelete(doc.id)}
                          sx={{ p: 0.5, flexShrink: 0 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  );
                })}
              {device.documents?.filter((d: any) => d.type === 'passport')
                .length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: 'italic',
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  }}
                >
                  Файлы не загружены
                </Typography>
              )}
            </Stack>
            {user?.role !== 'user' && (
              <Button
                variant="outlined"
                size="small"
                component="label"
                startIcon={<FileUpload />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.2,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Добавить документ / фото
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  hidden
                  onChange={(e) => handleFileUpload(e, 'passport')}
                  disabled={fileUploading}
                />
              </Button>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

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

      {/* {device.verifications.map((v) => (
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
              bgcolor: v.result === 'годен' ? '#f0fdf4' : '#fff1f2',
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
                label="Дата контроля"
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
              {v.documentUrl && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
                  <InfoRow
                    label="Ссылка на документ"
                    value={v.documentUrl}
                    isLink
                  />
                </Box>
              )}
              <InfoRow label="Стоимость" value={v.cost} />

              {v.comment && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
                  <InfoRow label="Комментарий" value={v.comment} />
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))} */}
      {device.verifications.map((v: any) => {
        const isSingleControl = !v.validUntil;
        const controlName = v.metrologyControleType?.name || 'контроль';
        const isSuccess = v.result === 'годен';

        // Вычисляем красивый цвет для бейджа типа контроля
        const getBadgeStyles = (name: string) => {
          const lowerName = name.toLowerCase().trim();
          if (lowerName.includes('осмотр') || lowerName.includes('инспек')) {
            return {
              bgcolor: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
            };
          }
          if (lowerName.includes('калибр')) {
            return {
              bgcolor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
            };
          }
          if (lowerName.includes('аттест')) {
            return {
              bgcolor: '#f3e8ff',
              color: '#6b21a8',
              border: '1px solid #e9d5ff',
            };
          }
          return {
            bgcolor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          };
        };

        const badgeStyle = getBadgeStyles(controlName);

        return (
          <Accordion
            key={v.id}
            disableGutters
            elevation={0}
            sx={{
              mb: 1,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '8px !important',
              overflow: 'hidden',
              '&:before': { display: 'none' },
              borderLeft: '4px solid',
              borderLeftColor: isSuccess ? 'success.main' : 'error.main',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMore fontSize="small" sx={{ color: 'text.secondary' }} />
              }
              sx={{
                minHeight: 48,
                '&.Mui-expanded': { minHeight: 48 },
                bgcolor: 'background.paper',
                px: 1.5,
                '&:hover': { bgcolor: 'grey.50' },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%', pr: 1 }}
              >
                {/* Левая часть: Тип контроля + Сроки */}
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.3,
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      ...badgeStyle,
                    }}
                  >
                    {controlName}
                  </Box>

                  {/* Текст сроков дедлайна */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '0.82rem',
                    }}
                  >
                    {isSingleControl
                      ? `📋 Разовый от ${v?.date ? formatDate(v.date) : '—'}`
                      : `📅 Действует до: ${formatDate(v.validUntil)}`}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  {isSuccess ? (
                    <CheckCircleOutline color="success" sx={{ fontSize: 18 }} />
                  ) : (
                    <HighlightOff color="error" sx={{ fontSize: 18 }} />
                  )}
                </Stack>
              </Stack>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'grey.100',
                bgcolor: 'grey.50/30',
              }}
            >
              <Stack spacing={1}>
                <InfoRow
                  label="Дата контроля"
                  value={v?.date ? formatDate(v.date) : '-'}
                />
                <InfoRow
                  label="№ Свидетельства / Акта"
                  value={v.protocolNumber || '—'}
                />
                <InfoRow
                  label="Организация"
                  value={
                    v.verificationOrganization?.name || 'Внутренняя служба'
                  }
                />
                <InfoRow
                  label="Вид контроля"
                  value={formatSentenceCase(controlName)}
                />
                <InfoRow label="Результат" value={v.result} />

                {v.documentUrl && (
                  <Box
                    sx={{
                      mt: 1,
                      pt: 1,
                      borderTop: '1px dashed',
                      borderColor: 'grey.200',
                    }}
                  >
                    <InfoRow
                      label="Ссылка на документ"
                      value={v.documentUrl}
                      isLink
                    />
                  </Box>
                )}

                <InfoRow
                  label="Стоимость"
                  value={
                    parseFloat(v.cost) > 0
                      ? `${v.cost} руб.`
                      : controlName === 'осмотр'
                      ? 'Бесплатно (Внутреннее ТО)'
                      : 'Не указано'
                  }
                />

                {v.comment && (
                  <Box
                    sx={{
                      mt: 1,
                      pt: 1,
                      borderTop: '1px dashed',
                      borderColor: 'grey.200',
                    }}
                  >
                    <InfoRow label="Комментарий" value={v.comment} />
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Modal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 0.5,
            maxWidth: '95vw',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Кнопка быстрого закрытия фото в углу */}
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
              boxShadow: 1,
              zIndex: 10,
            }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>

          {/* Само изображение прибора или комплектности */}
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Просмотр документа"
              sx={{
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 8px)',
                objectFit: 'contain', // Картинка никогда не исказится и полностью влезет в экран телефона
                borderRadius: '10px',
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
