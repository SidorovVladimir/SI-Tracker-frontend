import React, { useState } from 'react';
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

interface CatalogItem {
  id: string;
  name: string;
}

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    validUntil: string;
    protocolNumber: string;
    result: string;
    metrologyControleTypeId: string;
    verificationOrganizationId: string;
    comment: string;
    cost: number;
  }) => void;
  deviceName: string;
  verificationInterval?: number | null;
  controlTypes: CatalogItem[];
  organizations: CatalogItem[];
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  open,
  onClose,
  onSubmit,
  deviceName,
  controlTypes,
  organizations,
}) => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]!
  );
  const [validUntil, setValidUntil] = useState<string>('');
  const [protocolNumber, setProtocolNumber] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [result, setResult] = useState<string>('Годен');
  const [selectedControlType, setSelectedControlType] = useState<string>('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [cost, setCost] = useState<string>('');

  const handleFormSubmit = () => {
    if (
      !protocolNumber.trim() ||
      !date ||
      !selectedControlType ||
      !selectedOrg ||
      !cost
    ) {
      alert('Заполните все обязательные поля!');
      return;
    }
    if (result === 'Годен' && !validUntil) {
      alert('Для годного прибора обязательна дата окончания срока!');
      return;
    }

    onSubmit({
      date,
      validUntil,
      protocolNumber,
      result,
      metrologyControleTypeId: selectedControlType,
      verificationOrganizationId: selectedOrg,
      comment,
      cost: cost ? parseFloat(cost) : 0,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
        📝 Внесение результатов контроля
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{ mb: 2, fontWeight: 'bold' }}
        >
          Прибор: {deviceName}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField
            label="Номер свидетельства / извещения"
            size="small"
            required
            value={protocolNumber}
            onChange={(e) => setProtocolNumber(e.target.value)}
          />

          <TextField
            select
            label="Результат контроля"
            size="small"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            <MenuItem value="Годен">🟢 Годен (Выдать свидетельство)</MenuItem>
            <MenuItem value="Не годен">
              🔴 Не годен (Извещение о непригодности)
            </MenuItem>
          </TextField>

          <TextField
            select
            label="Тип метрологического контроля"
            size="small"
            required
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
            select
            label="Где проводился контроль?"
            size="small"
            required
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Стоимость (руб., без НДС)"
            type="text"
            required
            size="small"
            value={cost}
            onChange={(e) => {
              let val = e.target.value;
              val = val.replace(',', '.');
              if (/^\d*\.?\d{0,2}$/.test(val)) {
                setCost(val);
              }
            }}
            slotProps={{
              htmlInput: { min: 0, step: '0.01' },
            }}
            fullWidth
          />

          <TextField
            label="Дата проведения контроля"
            type="date"
            size="small"
            required
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {result === 'Годен' && (
            <TextField
              label="Дата окончания действия (Годен до)"
              type="date"
              size="small"
              required
              slotProps={{
                inputLabel: { shrink: true },
              }}
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          )}

          <TextField
            label="Примечание"
            size="small"
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
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
          color="success"
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Сохранить в паспорт
        </Button>
      </DialogActions>
    </Dialog>
  );
};
