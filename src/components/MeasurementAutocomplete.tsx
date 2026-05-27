import { AddCircleOutline } from '@mui/icons-material';
import {
  Box,
  TextField,
  Tooltip,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { useState } from 'react';
import MeasurementModal from './modals/MeasurementModal';

export default function MeasurementAutocomplete({
  value,
  onChange,
  measurementTypesList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Autocomplete
        sx={{ minWidth: 0 }}
        fullWidth
        multiple
        options={measurementTypesList}
        getOptionLabel={(option) => option.name}
        value={value}
        onChange={onChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Виды измерений"
            placeholder="Выберите вид измерения"
            size="small"
          />
        )}
      />

      <Tooltip title="Добавить вид измерений">
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
        }}
      />
    </Box>
  );
}
