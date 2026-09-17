import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';

interface CatalogItem {
  id: string;
  name: string;
}

interface RepairModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    validUntil: string;
    protocolNumber: string | null;
    result: string;
    metrologyControleTypeId: string;
    comment: string;
  }) => void;
  deviceName: string;
  controlTypes: CatalogItem[];
}

export const RepairModal: React.FC<RepairModalProps> = ({
  open,
  onClose,
  onSubmit,
  deviceName,
  controlTypes,
}) => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]!
  );
  const [validUntil, setValidUntil] = useState<string>('');
  const [protocolNumber, setProtocolNumber] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [result, setResult] = useState<string>('годен');
  const [selectedControlType, setSelectedControlType] = useState<string>('');

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split('T')[0]!);
      setValidUntil('');
      setProtocolNumber('');
      setComment('');
      setResult('годен');
      setSelectedControlType('');
    }
  }, [open]);

  useEffect(() => {
    if (result === 'не годен') {
      setValidUntil('');
    }
  }, [result]);

  // Вычисляем, является ли выбранный тип контроля Осмотром (ТО)
  const isInspection = React.useMemo(() => {
    const found = controlTypes.find((t) => t.id === selectedControlType);
    return found?.name?.toLowerCase().trim().includes('осмотр') ?? false;
  }, [selectedControlType, controlTypes]);

  const handleFormSubmit = () => {
    // 🌟 ФИКС: Номер документа обязателен ТОЛЬКО если это НЕ осмотр!
    if (!isInspection && !protocolNumber.trim()) {
      enqueueSnackbar(
        'Для Поверки и Калибровки поле "Номер свидетельства/протокола" обязательно!',
        {
          variant: 'error',
        }
      );
      return;
    }
    if (!date || !selectedControlType) {
      enqueueSnackbar('Заполните обязательные поля (Дата и Вид контроля)!', {
        variant: 'error',
      });
      return;
    }
    if (result === 'годен' && !validUntil) {
      enqueueSnackbar('Укажите дату окончания действия контроля!', {
        variant: 'error',
      });
      return;
    }

    onSubmit({
      date,
      validUntil: result === 'не годен' ? '' : validUntil,
      // Если это осмотр и поле пустое — пишем заглушку «б/н» (без номера)
      protocolNumber:
        isInspection && !protocolNumber.trim() ? null : protocolNumber.trim(),
      result,
      metrologyControleTypeId: selectedControlType,
      comment,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
        🔧 Фиксация ремонта и контроля
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography
          variant="subtitle2"
          color="warning.main"
          sx={{ mb: 2, fontWeight: 'bold' }}
        >
          Прибор: {deviceName}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField
            select
            required
            label="Вид закрывающего контроля"
            size="small"
            value={selectedControlType}
            onChange={(e) => setSelectedControlType(e.target.value)}
          >
            {controlTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            // 🌟 Номер скрывает звёздочку «required», если выбран Осмотр
            label="Номер акта / протокола"
            size="small"
            required={!isInspection}
            value={protocolNumber}
            onChange={(e) => setProtocolNumber(e.target.value)}
          />

          <TextField
            select
            label="Результат ремонта"
            size="small"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            <MenuItem value="годен">🟢 Отремонтирован (Исправен)</MenuItem>
            <MenuItem value="не годен">🔴 Брак (Неремонтопригоден)</MenuItem>
          </TextField>

          <TextField
            label="Дата проведения ремонта"
            type="date"
            size="small"
            required
            slotProps={{ inputLabel: { shrink: true } }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {result === 'годен' && (
            <TextField
              label="Срок действия контроля до"
              type="date"
              size="small"
              required
              slotProps={{ inputLabel: { shrink: true } }}
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          )}

          <TextField
            label="Что было сделано (Примечание)"
            size="small"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Замена прокладок, калибровка нуля, чистка контактов..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleFormSubmit}
          variant="contained"
          color="warning"
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Подтвердить ремонт
        </Button>
      </DialogActions>
    </Dialog>
  );
};
