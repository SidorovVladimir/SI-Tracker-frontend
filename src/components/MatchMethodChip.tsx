// src/modules/budget/components/MatchMethodChip.tsx
import React from 'react';
import { Chip } from '@mui/material';

interface MatchMethodChipProps {
  method: string;
}

export const MatchMethodChip: React.FC<MatchMethodChipProps> = ({ method }) => {
  switch (method) {
    case 'grsi':
      return (
        <Chip label="ГРСИ" color="success" size="small" variant="outlined" />
      );
    case 'csm_code':
      return (
        <Chip label="Код СИ" color="primary" size="small" variant="outlined" />
      );
    case 'model_exact':
      return (
        <Chip
          label="Модель (Точно)"
          color="info"
          size="small"
          variant="outlined"
        />
      );
    case 'text_fuzzy':
      return (
        <Chip
          label="Нечеткий поиск"
          color="warning"
          size="small"
          variant="outlined"
        />
      );
    case 'manual':
      return <Chip label="Ручной ввод" color="secondary" size="small" />;
    case 'not_found':
    default:
      return <Chip label="НЕ НАЙДЕНО" color="error" size="small" />;
  }
};
