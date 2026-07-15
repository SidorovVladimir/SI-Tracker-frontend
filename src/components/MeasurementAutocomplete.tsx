// import { AddCircleOutline } from '@mui/icons-material';
import { Box, TextField, Autocomplete } from '@mui/material';
// import { useState } from 'react';
// import MeasurementModal from './modals/MeasurementModal';
import { cleanSpaces } from '../utils/capitalize';

export default function MeasurementAutocomplete({
  value,
  onChange,
  measurementTypesList,
}: any) {
  // const [isModalOpen, setIsModalOpen] = useState(false);
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
        fullWidth
        multiple
        options={measurementTypesList}
        getOptionLabel={(option) => cleanSpaces(option.name)}
        value={value}
        onChange={onChange}
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
            label="Виды измерений"
            placeholder="Выберите вид измерения"
            size="small"
          />
        )}
      />

      {/* <Tooltip title="Добавить вид измерений">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <MeasurementModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newMeasurementType: string) => {
          onChange(null, [...value, newMeasurementType]);
        }} */}
      {/* /> */}
    </Box>
  );
}
