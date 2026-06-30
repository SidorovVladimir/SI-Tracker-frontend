import React from 'react';
import { Chip } from '@mui/material';

interface MatchMethodChipProps {
  method: string;
}

export const MatchMethodChip: React.FC<MatchMethodChipProps> = ({ method }) => {
  // Выносим цвета и стили в явном виде для каждого статуса
  const config: Record<string, { label: string; text: string; bg: string }> = {
    grsi: {
      label: 'ГРСИ',
      text: 'success.dark',
      bg: 'success.light',
    },
    csm_code: {
      label: 'Код СИ',
      text: 'primary.dark',
      bg: 'primary.light',
    },
    model_exact: {
      label: 'Модель',
      text: 'info.dark',
      bg: 'info.light',
    },
    text_fuzzy: {
      label: 'Текст',
      text: '#663c00',
      bg: '#fff5e6',
    },
    historical: {
      label: 'История',
      text: 'info.dark',
      bg: 'transparent',
    },
    history: {
      label: 'История',
      text: 'info.dark',
      bg: 'transparent',
    },
    manual: {
      label: 'Ручной',
      text: 'secondary.dark',
      bg: 'transparent',
    },
    not_found: {
      label: 'НЕТ ЦЕНЫ',
      text: 'error.dark',
      bg: 'error.light',
    },
  };

  const current = config[method] || config['not_found'];

  // Если у метода прозрачный фон (bg === 'transparent'), то это будет 'outlined' чип
  const isOutlined = current.bg === 'transparent';

  return (
    <Chip
      label={current.label}
      size="small"
      variant={isOutlined ? 'outlined' : 'filled'}
      sx={{
        fontWeight: 'bold',
        fontSize: '0.72rem',
        borderRadius: 1.5,
        height: 20,
        letterSpacing: '0.3px',
        color: current.text,
        bgcolor: current.bg,
        // Если этоoutlined-чип, подкрасим его границы в цвет текста
        ...(isOutlined && {
          borderColor: current.text,
        }),
      }}
    />
  );
};
