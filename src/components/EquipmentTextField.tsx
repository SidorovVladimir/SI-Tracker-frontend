import { AddCircleOutline } from '@mui/icons-material';
import { Box, TextField, Tooltip, IconButton, MenuItem } from '@mui/material';
import { useState } from 'react';
import EquipmentModal from './modals/EquipmentModal';

export default function EquipmentTextField({
  value,
  onChange,
  equipmentTypesList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        id="outlined-select-currency"
        select
        label="Тип оборудования"
        name="equipmentTypeId"
        size="small"
        fullWidth
        onChange={onChange}
        value={value}
      >
        {equipmentTypesList.map(
          ({ id, name }: { id: string; name: string }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          )
        )}
      </TextField>

      <Tooltip title="Добавить тип оборудования">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <EquipmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}
