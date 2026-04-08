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

export default function ScopeAutocomplete({
  value,
  onChange,
  scopesList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Autocomplete
        fullWidth // Чтобы поле занимало всё доступное место в Box
        multiple
        options={scopesList}
        getOptionLabel={(option) => option.name}
        value={value}
        onChange={onChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
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
