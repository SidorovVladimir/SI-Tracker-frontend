// src/modules/budget/components/InlinePriceEdit.tsx
import React, { useState } from 'react';
import { TextField, IconButton, Box, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

interface InlinePriceEditProps {
  itemId: string;
  initialPrice: number;
  disabled: boolean;
  onSave: (price: number) => Promise<void>;
}

export const InlinePriceEdit: React.FC<InlinePriceEditProps> = ({
  initialPrice,
  disabled,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(initialPrice.toString());
  const [loading, setLoading] = useState(false);

  if (disabled) {
    return (
      <Typography variant="body2">
        {initialPrice.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        })}
      </Typography>
    );
  }

  if (!isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">
          {initialPrice > 0
            ? initialPrice.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
              })
            : '0.00 ₽'}
        </Typography>
        <IconButton size="small" onClick={() => setIsEditing(true)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(parseFloat(price) || 0);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <TextField
        size="small"
        variant="standard"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        disabled={loading}
        sx={{ width: 100 }}
      />
      <IconButton
        size="small"
        color="success"
        onClick={handleSave}
        disabled={loading}
      >
        <CheckIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={() => setIsEditing(false)}
        disabled={loading}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
