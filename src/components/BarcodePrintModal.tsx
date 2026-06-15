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
  const [labelSize, setLabelSize] = useState<'40x58' | '40x30'>('40x58');

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
          gap: 2,
          flexWrap: 'wrap',
          '@media print': { display: 'none' },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          🖨️ Маркировка оборудования ({deviceIds.length} шт.)
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Переключатель типа носителя */}
          <ToggleButtonGroup
            value={printMode}
            exclusive
            onChange={(_e, val) => {
              if (val) {
                setPrintMode(val);

                if (val === 'A4') {
                  setLabelSize('40x58');
                }
              }
            }}
            size="small"
            color="primary"
          >
            <ToggleButton
              value="A4"
              sx={{ textTransform: 'none', gap: 0.5, fontWeight: 'bold' }}
            >
              <GridOnIcon fontSize="small" /> А4
            </ToggleButton>
            <ToggleButton
              value="ROLL"
              sx={{ textTransform: 'none', gap: 0.5, fontWeight: 'bold' }}
            >
              <ToggleOnIcon fontSize="small" /> Лента
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
            >
              <ToggleButton
                value="40x58"
                sx={{ textTransform: 'none', gap: 0.5, fontSize: '0.8rem' }}
              >
                <AspectRatioIcon fontSize="small" /> 40x58 мм
              </ToggleButton>
              <ToggleButton
                value="40x30"
                sx={{ textTransform: 'none', gap: 0.5, fontSize: '0.8rem' }}
              >
                <AspectRatioIcon fontSize="small" /> 30x40 мм (x2)
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
                // ИСПРАВЛЕНО: Ширина колонок на А4 зависит от выбранного формата
                gridTemplateColumns:
                  printMode === 'A4'
                    ? labelSize === '40x30'
                      ? 'repeat(4, 40mm)'
                      : 'repeat(3, 58mm)'
                    : 'none',
                gap: printMode === 'A4' ? '5mm' : 0,
                p: printMode === 'A4' ? '10mm' : 0,
                m: 0,
              },
            }}
          >
            {devices.map((device, index) => {
              const deviceUrl = `${window.location.origin}/m/device/${device.id}`;
              const isLastDevice = index === devices.length - 1;

              const currentWidth = labelSize === '40x30' ? '40mm' : '58mm';
              const currentHeight = labelSize === '40x30' ? '30mm' : '40mm';

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
                // На 40х30 всё идет в колонку, на 58х40 — в ряд (горизонтально)
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

              // --- СЦЕНАРИЙ 1: ЛЕНТА И РАЗМЕР 40х30 мм (ВЫВОДИМ ДВЕ НАКЛЕЙКИ НА ПРИБОР) ---
              if (labelSize === '40x30' && printMode === 'ROLL') {
                return (
                  <React.Fragment key={device.id}>
                    {/* Бирка №1: Текстовый паспорт */}
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
                          {/* <Typography
                            sx={{
                              fontSize: '7.5pt',
                              fontWeight: 'bold',
                              color: 'primary.main',
                              lineHeight: 1,
                            }}
                          >
                            SI-TRACKER
                          </Typography> */}
                          <Typography
                            sx={{
                              fontSize: '7.5pt',
                              fontWeight: 'bold',
                              mt: 0.3,
                              overflow: 'hidden',
                            }}
                            noWrap
                          >
                            {device.name}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '6.5pt', color: 'text.secondary' }}
                            noWrap
                          >
                            Мод: {device.model || '—'}
                          </Typography>
                          <Typography
                            sx={{ fontSize: '6.5pt', fontFamily: 'monospace' }}
                            //  noWrap
                          >
                            Зав. №: {device.serialNumber}
                          </Typography>
                        </Box>
                        <Box sx={{ borderTop: '0.5px solid #e0e0e0', pt: 0.3 }}>
                          <Typography
                            sx={{ fontSize: '6.5pt', color: 'text.secondary' }}
                            // noWrap
                          >
                            {device.controlType || 'Контроль'} •{' '}
                            {device.statusName || '—'}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '7pt',
                              fontWeight: 'bold',
                              color: 'error.main',
                            }}
                          >
                            ГОДЕН ДО: {formatLabelDate(device.validUntil)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Бирка №2: Изолированный QR-код */}
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
                            fontSize: '5pt',
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

              // --- СЦЕНАРИЙ 2: БОЛЬШАЯ БИРКА 58х40 мм (ИЛИ ВЫВОД НА А4) ---
              return (
                <Box key={device.id} sx={getLabelContainerStyles(true)}>
                  {/* Левая часть: Текстовая информация */}
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
                      {/* <Typography
                        sx={{
                          fontSize: '8pt',
                          fontWeight: 'bold',
                          color: 'primary.main',
                          lineHeight: 1.1,
                        }}
                      >
                        SI-TRACKER
                      </Typography> */}
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
                        // noWrap
                      >
                        Мод: {device.model || '—'}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '7pt',
                          fontFamily: 'monospace',
                          mt: 0.25,
                          overflow: 'hidden',
                        }}
                        // noWrap
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
                        ГОДЕН ДО: {formatLabelDate(device.validUntil)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Правая часть: QR-код */}
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
        sx={{ p: 2, bgcolor: 'grey.50', '@media print': { display: 'none' } }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || devices.length === 0}
          sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
        >
          Пустить в печать
        </Button>
      </DialogActions>
    </Dialog>
  );
};
