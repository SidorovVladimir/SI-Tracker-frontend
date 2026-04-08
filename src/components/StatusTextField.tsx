import { AddCircleOutline } from '@mui/icons-material';
import { Box, TextField, Tooltip, IconButton, MenuItem } from '@mui/material';
import { useState } from 'react';
import StatusModal from './modals/StatusModal';

export default function StatusTextField({
  value,
  onChange,
  statusesList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        id="outlined-select-currency"
        select
        label="Состояние"
        name="statusId"
        size="small"
        fullWidth
        onChange={onChange}
        value={value}
        required
      >
        {statusesList.map(({ id, name }: { id: string; name: string }) => (
          <MenuItem key={id} value={id}>
            {name}
          </MenuItem>
        ))}
      </TextField>

      <Tooltip title="Добавить состояние">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <StatusModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
}
