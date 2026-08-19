import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  TextField,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';

interface InspectionSaveModalProps {
  open: boolean;
  onClose: () => void;
  selectedDevices: any[];
  onSave: (
    items: { deviceId: string; isSuccess: boolean }[],
    interval: number
  ) => void;
  loading: boolean;
}

export const InspectionSaveModal: React.FC<InspectionSaveModalProps> = ({
  open,
  onClose,
  selectedDevices,
  onSave,
  loading,
}) => {
  const [interval, setInterval] = useState<number>(12);
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      const initialResults: Record<string, boolean> = {};
      selectedDevices.forEach((d) => {
        initialResults[d.id] = true;
      });
      setResults(initialResults);
    }
  }, [open, selectedDevices]);

  const handleSubmit = () => {
    const items = selectedDevices.map((d) => ({
      deviceId: d.id,
      isSuccess: results[d.id] ?? true,
    }));
    onSave(items, interval);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Фиксация результатов осмотра
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Периодичность повторного осмотра"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value, 10))}
          >
            <MenuItem value={1}>1 месяц</MenuItem>
            <MenuItem value={3}>3 месяца</MenuItem>
            <MenuItem value={6}>6 месяцев</MenuItem>
            <MenuItem value={12}>1 год (12 мес.)</MenuItem>
          </TextField>
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Список оборудования:
        </Typography>
        <List disablePadding>
          {selectedDevices.map((device) => (
            <ListItem
              key={device.id}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="caption"
                    color={results[device.id] ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {results[device.id] ? 'ГОДЕН' : 'БРАК'}
                  </Typography>
                  <Switch
                    size="small"
                    color="success"
                    checked={results[device.id] ?? true}
                    onChange={(e) =>
                      setResults((prev) => ({
                        ...prev,
                        [device.id]: e.target.checked,
                      }))
                    }
                  />
                </Box>
              }
              sx={{ px: 0, borderBottom: '1px solid #eee' }}
            >
              <ListItemText
                primary={device.name}
                secondary={`Зав. № ${device.serialNumber}`}
                slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          size="small"
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Сохранить акт осмотра
        </Button>
      </DialogActions>
    </Dialog>
  );
};
