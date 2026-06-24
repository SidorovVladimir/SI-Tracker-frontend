import { AddCircleOutline } from '@mui/icons-material';
import {
  Box,
  Autocomplete,
  TextField,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import ScopeModal from './modals/ScopeModal';
import { cleanSpaces } from '../utils/capitalize';

export default function ScopeAutocomplete({
  value,
  onChange,
  scopesList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Autocomplete
        sx={{
          minWidth: 0,
          '& .MuiInputBase-input, & .MuiChip-label': {
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '0.6px',
            fontWeight: 500,
          },
          '& .MuiChip-root': {
            height: 24,
          },
        }}
        fullWidth // Чтобы поле занимало всё доступное место в Box
        multiple
        options={scopesList}
        getOptionLabel={(option) => cleanSpaces(option.name)}
        value={value}
        onChange={onChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        slotProps={{
          paper: {
            sx: {
              // 1. Ограничение для внешней обертки окна
              maxHeight: { xs: 250, md: 'none' },

              // 2. Ограничение для внутреннего списка элементов
              '& .MuiAutocomplete-listbox': {
                maxHeight: { xs: 250, md: 'none' }, // 'none' убирает лимиты на ПК, 'auto' вернет дефолт MUI
              },

              // Опционально: делаем кастомный тонкий скроллбар на мобилке
              '& ::-webkit-scrollbar': {
                width: '4px',
              },
              '& ::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.16)',
                borderRadius: '4px',
              },
            },
          },
        }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li
              key={key}
              {...optionProps}
              style={{
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '0.6px',
                fontWeight: 500,
              }}
            >
              {cleanSpaces(option.name)}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Сферы применения"
            placeholder="Выберите сферы"
            size="small"
          />
        )}
      />

      <Tooltip title="Добавить сферу">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <ScopeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newScope: string) => {
          onChange(null, [...value, newScope]);
        }}
      />
    </Box>
  );
}
