import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { QRCodeSVG } from 'qrcode.react';
import PrintIcon from '@mui/icons-material/Print';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import GridOnIcon from '@mui/icons-material/GridOn';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { GetDevicesBarcodeDataDocument } from '../graphql/types/__generated__/graphql';
import { Layers } from '@mui/icons-material';

interface BarcodePrintModalProps {
  open: boolean;
  onClose: () => void;
  deviceIds: string[];
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  open,
  onClose,
  deviceIds,
}) => {
  const [printMode, setPrintMode] = useState<'A4' | 'ROLL'>('A4');
  // Контроль размера ленты термопринтера
  const [labelSize, setLabelSize] = useState<
    '40x58' | '40x30' | '40x30_double'
  >('40x58');

  const { data, loading } = useQuery(GetDevicesBarcodeDataDocument, {
    variables: { ids: deviceIds },
    skip: !open || deviceIds.length === 0,
    fetchPolicy: 'network-only',
  });

  const devices = data?.getDevicesBarcodeData ?? [];

  const handlePrint = () => {
    window.print();
  };

  const formatLabelDate = (dateStr: any) => {
    if (!dateStr) return '—';
    let timestamp = Number(dateStr);
    if (isNaN(timestamp)) {
      const parsedDate = new Date(dateStr);
      return isNaN(parsedDate.getTime())
        ? '—'
        : parsedDate.toLocaleDateString('ru-RU');
    }
    if (timestamp < 10000000000) timestamp *= 1000;
    return new Date(timestamp).toLocaleDateString('ru-RU');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: { sx: { '@media print': { display: 'none' } } },
      }}
      sx={{
        '@media print': {
          '& .MuiDialog-container': { display: 'block' },
          '& .MuiPaper-root': {
            boxShadow: 'none',
            m: 0,
            p: 0,
            maxWidth: 'none',
            width: 'auto',
          },
          position: 'absolute',
          left: 0,
          top: 0,
        },
      }}
    >
      {/* Шапка модального окна */}
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap', // Разрешаем перенос блоков на мобилках
          p: { xs: 1.5, sm: 2 }, // Меньше отступы на телефонах
          '@media print': { display: 'none' },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
        >
          🖨️ Маркировка ({deviceIds.length} шт.)
        </Typography>

        <Box
          display="flex"
          gap={1}
          flexWrap="wrap"
          sx={{
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          {/* Переключатель типа носителя */}
          <ToggleButtonGroup
            value={printMode}
            exclusive
            onChange={(_e, val) => {
              if (val) {
                setPrintMode(val);
                if (val === 'A4') setLabelSize('40x58');
              }
            }}
            size="small"
            color="primary"
          >
            <ToggleButton
              value="A4"
              sx={{
                textTransform: 'none',
                gap: 0.5,
                fontWeight: 'bold',
                py: 0.5,
              }}
            >
              <GridOnIcon fontSize="small" />
              <Box
                component="span"
                sx={{ display: { xs: 'none', sm: 'inline-block' } }}
              >
                А4
              </Box>
            </ToggleButton>
            <ToggleButton
              value="ROLL"
              sx={{
                textTransform: 'none',
                gap: 0.5,
                fontWeight: 'bold',
                py: 0.5,
              }}
            >
              <ToggleOnIcon fontSize="small" />
              <Box
                component="span"
                sx={{ display: { xs: 'none', sm: 'inline-block' } }}
              >
                Лента
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Переключатель размеров для термоленты */}
          {printMode === 'ROLL' && (
            <ToggleButtonGroup
              value={labelSize}
              exclusive
              onChange={(_e, val) => val && setLabelSize(val)}
              size="small"
              color="secondary"
              sx={{ flexWrap: 'wrap' }} // Защита от сжатия кнопок внутри группы
            >
              <ToggleButton
                value="40x58"
                sx={{
                  textTransform: 'none',
                  gap: 0.5,
                  fontSize: '0.8rem',
                  py: 0.5,
                }}
              >
                <AspectRatioIcon fontSize="small" />
                <Box
                  component="span"
                  sx={{ display: { xs: 'none', md: 'inline-block' } }}
                >
                  40x58 мм
                </Box>
              </ToggleButton>
              <ToggleButton
                value="40x30"
                sx={{
                  textTransform: 'none',
                  gap: 0.5,
                  fontSize: '0.8rem',
                  py: 0.5,
                }}
              >
                <AspectRatioIcon fontSize="small" />
                <Box
                  component="span"
                  sx={{ display: { xs: 'none', md: 'inline-block' } }}
                >
                  30x40 (x2)
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: 'inline-block', md: 'none' } }}
                >
                  x2
                </Box>
              </ToggleButton>
              <ToggleButton
                value="40x30_double"
                sx={{
                  textTransform: 'none',
                  gap: 0.5,
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  py: 0.5,
                }}
              >
                <Layers fontSize="small" />
                <Box
                  component="span"
                  sx={{ display: { xs: 'none', md: 'inline-block' } }}
                >
                  30x40 (2 в 1)
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: 'inline-block', md: 'none' } }}
                >
                  2в1
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          bgcolor: 'grey.50',
          '@media print': { bgcolor: 'transparent', p: 0, border: 'none' },
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 6,
              width: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : devices.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              ⚠️ Нет данных для печати.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'center',
              '@media print': {
                display: printMode === 'A4' ? 'grid' : 'block',
                gridTemplateColumns:
                  printMode === 'A4'
                    ? labelSize === '40x58'
                      ? 'repeat(3, 58mm)'
                      : 'repeat(4, 40mm)'
                    : 'none',
                gap: printMode === 'A4' ? '5mm' : 0,
                p: printMode === 'A4' ? '10mm' : 0,
                m: 0,
              },
            }}
          >
            {labelSize === '40x30_double'
              ? // Сценарий 3: Два прибора на одну бирку 30х40 мм + 2 отдельные бирки с QR
                devices.map((device, index) => {
                  if (index % 2 !== 0) return null;
                  const nextDevice = devices[index + 1];

                  const deviceUrl1 = `${window.location.origin}/m/device/${device.id}`;
                  const deviceUrl2 = nextDevice
                    ? `${window.location.origin}/m/device/${nextDevice.id}`
                    : '';

                  const getControlPrefix = (controlName?: string | null) => {
                    const name = controlName?.toLowerCase() || '';
                    if (name.includes('калибр')) return 'Калибровано до';
                    if (name.includes('осмотр') || name.includes('инспек'))
                      return 'Осмотрено до';
                    return 'Поверено до';
                  };

                  // Базовые стили для каждой из трех бирок в пачке
                  const qrLabelStyles = {
                    width: '40mm',
                    height: '30mm',
                    bgcolor: 'white',
                    border: printMode === 'A4' ? '1px dashed #b0bec5' : 'none',
                    borderRadius: 1,
                    p: '1mm 2mm',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    '@media print': {
                      width: '40mm',
                      height: '30mm',
                      m: 0,
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      pageBreakAfter: printMode === 'A4' ? 'auto' : 'always',
                      breakAfter: printMode === 'A4' ? 'auto' : 'page',
                    },
                  };

                  return (
                    <React.Fragment key={`double-${device.id}-${index}`}>
                      <Box
                        sx={{
                          width: '40mm',
                          height: '30mm',
                          bgcolor: 'white',
                          border:
                            printMode === 'A4' ? '1px dashed #b0bec5' : 'none',
                          borderRadius: 1,
                          p: '1mm 2mm',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxSizing: 'border-box',
                          '@media print': {
                            width: '40mm',
                            height: '30mm',
                            m: 0,
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid',
                            pageBreakAfter:
                              printMode === 'A4' ? 'auto' : 'always',
                            breakAfter: printMode === 'A4' ? 'auto' : 'page',
                          },
                        }}
                      >
                        {/* ПЕРВЫЙ ПРИБОР */}
                        <Box
                          sx={{
                            height: '13mm',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            borderBottom: nextDevice
                              ? '0.5px dashed #ccc'
                              : 'none',
                            pb: 0.25,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                            noWrap
                          >
                            {device.name?.toUpperCase()}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                            noWrap
                          >
                            Тип: {device.model.toUpperCase() || '—'}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                            noWrap
                          >
                            № {device.serialNumber.toUpperCase() || '—'}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                            noWrap
                          >
                            {getControlPrefix(device.controlType)}{' '}
                            {formatLabelDate(device.validUntil)}
                          </Typography>
                        </Box>

                        {/* ВТОРОЙ ПРИБОР */}
                        {nextDevice ? (
                          <Box
                            sx={{
                              height: '13mm',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              pt: 0.25,
                            }}
                          >
                            <Typography
                              sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                              noWrap
                            >
                              {nextDevice.name?.toUpperCase()}
                            </Typography>
                            <Typography
                              sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                              noWrap
                            >
                              Тип: {nextDevice.model.toUpperCase() || '—'}
                            </Typography>
                            <Typography
                              sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                              noWrap
                            >
                              № {nextDevice.serialNumber.toUpperCase() || '—'}
                            </Typography>
                            <Typography
                              sx={{ fontSize: '6.5pt', fontWeight: 'bold' }}
                            >
                              {getControlPrefix(nextDevice.controlType)}{' '}
                              {formatLabelDate(nextDevice.validUntil)}
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              height: '13mm',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '6.5pt',
                                color: 'text.disabled',
                                fontStyle: 'italic',
                              }}
                            >
                              [ Свободно ]
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* 📱 2. ОТДЕЛЬНАЯ БИРКА: QR-КОД ДЛЯ ПЕРВОГО ПРИБОРА */}
                      <Box sx={qrLabelStyles}>
                        <QRCodeSVG value={deviceUrl1} size={70} level="M" />
                        <Typography
                          sx={{
                            fontSize: '7.0pt',
                            color: 'text.secondary',
                            mt: 0.3,
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                          }}
                          noWrap
                        >
                          Зав.№ {device.serialNumber.toUpperCase() || '—'}
                        </Typography>
                      </Box>

                      {/* 📱 3. ОТДЕЛЬНАЯ БИРКА: QR-КОД ДЛЯ ВТОРОГО ПРИБОРА (ЕСЛИ СУЩЕСТВУЕТ) */}
                      {nextDevice && (
                        <Box sx={qrLabelStyles}>
                          <QRCodeSVG value={deviceUrl2} size={70} level="M" />
                          <Typography
                            sx={{
                              fontSize: '7.0pt',
                              color: 'text.secondary',
                              mt: 0.3,
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                            }}
                            noWrap
                          >
                            Зав.№ {nextDevice.serialNumber.toUpperCase() || '—'}
                          </Typography>
                        </Box>
                      )}
                    </React.Fragment>
                  );
                })
              : // Сценарии 1 и 2: Обычный маппинг по одному прибору (весь ваш старый devices.map от начала до конца)
                devices.map((device, index) => {
                  const deviceUrl = `${window.location.origin}/m/device/${device.id}`;
                  const isLastDevice = index === devices.length - 1;
                  const currentWidth = labelSize === '40x30' ? '40mm' : '58mm';
                  const currentHeight = labelSize === '40x30' ? '30mm' : '40mm';

                  const getControlPrefix = (controlName?: string | null) => {
                    const name = controlName?.toLowerCase() || '';
                    if (name.includes('калибр')) return 'Калибровано до';
                    if (name.includes('осмотр') || name.includes('инспек'))
                      return 'Осмотрено до';
                    return 'Поверено до';
                  };

                  const getLabelContainerStyles = (
                    isSecondPartForRoll = false
                  ) => ({
                    width: currentWidth,
                    height: currentHeight,
                    bgcolor: 'white',
                    border: printMode === 'A4' ? '1px dashed #b0bec5' : 'none',
                    borderRadius: 1,
                    p: '2mm',
                    display: 'flex',
                    flexDirection: labelSize === '40x30' ? 'column' : 'row',
                    gap: '2mm',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    '@media print': {
                      width: currentWidth,
                      height: currentHeight,
                      m: 0,
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      pageBreakAfter:
                        printMode === 'A4'
                          ? 'auto'
                          : isLastDevice && isSecondPartForRoll
                          ? 'auto'
                          : 'always',
                      breakAfter:
                        printMode === 'A4'
                          ? 'auto'
                          : isLastDevice && isSecondPartForRoll
                          ? 'auto'
                          : 'page',
                    },
                  });

                  if (labelSize === '40x30' && printMode === 'ROLL') {
                    return (
                      <React.Fragment key={`${device.id}-${index}`}>
                        {/* Ваша старая первая бирка (Текст) */}
                        <Box sx={getLabelContainerStyles(false)}>
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '8.5pt',
                                  lineHeight: '1.1',
                                  fontWeight: 'bold',
                                  mt: 0.3,
                                  overflow: 'hidden',
                                }}
                                noWrap
                              >
                                {device.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '7.5pt',
                                  color: 'text.secondary',
                                }}
                                noWrap
                              >
                                Тип: {device.model || '—'}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '7.5pt',
                                  fontFamily: 'monospace',
                                }}
                              >
                                Зав. №: {device.serialNumber}
                              </Typography>
                            </Box>
                            <Box
                              sx={{ borderTop: '0.5px solid #e0e0e0', pt: 0.3 }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '7.5pt',
                                  color: 'text.secondary',
                                }}
                              >
                                {device.controlType || 'Контроль'} •{' '}
                                {device.statusName || '—'}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '8pt',
                                  fontWeight: 'bold',
                                  color: 'error.main',
                                }}
                              >
                                {getControlPrefix(device.controlType)}{' '}
                                {formatLabelDate(device.validUntil)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        {/* Ваша старая вторая бирка (QR) */}
                        <Box sx={getLabelContainerStyles(true)}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                            }}
                          >
                            <QRCodeSVG value={deviceUrl} size={75} level="M" />
                            <Typography
                              sx={{
                                fontSize: '7.5pt',
                                color: 'text.secondary',
                                mt: 0.3,
                                fontFamily: 'monospace',
                              }}
                            >
                              Зав.№ {device.serialNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </React.Fragment>
                    );
                  }

                  // Ваш старый Сценарий 2: Большая совмещенная бирка 58х40 мм
                  return (
                    <Box
                      key={`${device.id}-${index}`}
                      sx={getLabelContainerStyles(true)}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                          minWidth: 0,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: '8pt',
                              fontWeight: 'bold',
                              mt: 0.25,
                              overflow: 'hidden',
                            }}
                            noWrap
                          >
                            {device.name}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '7pt', color: 'text.secondary' }}
                          >
                            Тип: {device.model || '—'}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '7pt',
                              fontFamily: 'monospace',
                              mt: 0.25,
                              overflow: 'hidden',
                            }}
                          >
                            Зав. №: {device.serialNumber}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            borderTop: '0.5px solid',
                            borderColor: 'divider',
                            pt: 0.25,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: '6.5pt', color: 'text.secondary' }}
                            noWrap
                          >
                            {device.controlType || 'Контроль'} •{' '}
                            {device.statusName || '—'}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '7.5pt',
                              fontWeight: 'bold',
                              color: 'error.main',
                              mt: 0.25,
                            }}
                          >
                            {getControlPrefix(device.controlType)}{' '}
                            {formatLabelDate(device.validUntil)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <QRCodeSVG value={deviceUrl} size={100} level="M" />
                      </Box>
                    </Box>
                  );
                })}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'grey.50',
          gap: 1,
          '@media print': { display: 'none' },
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          size="small"
          sx={{ textTransform: 'none', fontWeight: 'medium' }}
        >
          Отмена
        </Button>

        <Button
          variant="contained"
          onClick={handlePrint}
          disabled={loading || devices.length === 0}
          size="small"
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: { xs: '50%', sm: 2 }, // Круглая на мобилках, прямоугольная на ПК
            minWidth: { xs: 40, sm: 'auto' },
            width: { xs: 40, sm: 'auto' },
            height: { xs: 40, sm: 'auto' },
            p: { xs: 0, sm: '6px 16px' }, // Убираем внутренние отступы для идеального круга
          }}
        >
          <PrintIcon fontSize="small" />
          {/* Скрываем текст на телефонах, оставляя только круглую кнопку с иконкой принтера */}
          <Box
            component="span"
            sx={{ display: { xs: 'none', sm: 'inline-block' }, ml: 0.5 }}
          >
            Пустить в печать
          </Box>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
