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
