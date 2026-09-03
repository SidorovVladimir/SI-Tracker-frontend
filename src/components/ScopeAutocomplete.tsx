// import { AddCircleOutline } from '@mui/icons-material';
import { Box, Autocomplete, TextField } from '@mui/material';
// import { useState } from 'react';
// import ScopeModal from './modals/ScopeModal';
import { cleanSpaces } from '../utils/capitalize';

interface ScopeAutocompleteProps {
  value: any[];
  onChange: (event: any, newValue: any[]) => void;
  scopesList: any[];
  isSubmitted: boolean;
}

export default function ScopeAutocomplete({
  value,
  onChange,
  scopesList,
  isSubmitted,
}: ScopeAutocompleteProps) {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const handleInternalChange = (event: any, newValue: any[]) => {
    const lastSelected = newValue[newValue.length - 1];

    if (lastSelected) {
      const lastSelectedName = lastSelected.name.toLowerCase().trim();

      if (
        lastSelectedName === 'не гр' ||
        lastSelectedName === 'вне сферы государственного регулирования (не гр)'
      ) {
        onChange(event, [lastSelected]);
        return;
      }

      const filteredValue = newValue.filter((scope) => {
        const name = scope.name.toLowerCase().trim();
        return (
          name !== 'не гр' &&
          name !== 'вне сферы государственного регулирования (не гр)'
        );
      });

      onChange(event, filteredValue);
      return;
    }

    // Если массив очистили полностью, просто прокидываем его дальше
    onChange(event, newValue);
  };

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
        onChange={handleInternalChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        slotProps={{
          paper: {
            sx: {
              // 1. Ограничение для внешней обертки окна
              maxHeight: { xs: 250, md: 500 },

              // 2. Ограничение для внутреннего списка элементов
              '& .MuiAutocomplete-listbox': {
                maxHeight: { xs: 250, md: 500 }, // 'none' убирает лимиты на ПК, 'auto' вернет дефолт MUI
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
            required={value.length === 0}
            error={isSubmitted && value.length === 0}
            helperText={
              isSubmitted && value.length === 0
                ? 'Обязательное поле. Выберите сферы из списка'
                : ''
            }
          />
        )}
      />

      {/* <Tooltip title="Добавить сферу">
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
      /> */}
    </Box>
  );
}
