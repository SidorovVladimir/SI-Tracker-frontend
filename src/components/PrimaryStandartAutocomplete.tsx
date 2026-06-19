import { AddCircleOutline } from '@mui/icons-material';
import {
  Box,
  Autocomplete,
  TextField,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import PrimaryStandartModal from './modals/PrimaryStandartModal';
import { toCapital } from '../utils/capitalize';

export default function PrimaryStandartAutocomplete({
  value,
  onChange,
  primaryStandartsList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Autocomplete
        sx={{ minWidth: 0 }}
        fullWidth // Чтобы поле занимало всё доступное место в Box
        multiple
        options={primaryStandartsList}
        getOptionLabel={(option) => toCapital(option.name)}
        value={value}
        onChange={onChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              {toCapital(option.name)}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Первичные эталоны"
            placeholder="Выберите первичные эталоны"
            size="small"
          />
        )}
      />

      <Tooltip title="Добавить первичный эталон">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <PrimaryStandartModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newPrimaryStandart: string) => {
          onChange(null, [...value, newPrimaryStandart]);
        }}
      />
    </Box>
  );
}
