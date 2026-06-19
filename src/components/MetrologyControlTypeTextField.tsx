import { AddCircleOutline } from '@mui/icons-material';
import { Box, TextField, Tooltip, IconButton, MenuItem } from '@mui/material';
import { useState } from 'react';
import MetrologyControlTypeModal from './modals/MetrologyControlTypeModal';
import { toCapital } from '../utils/capitalize';

export default function MetrologyControlTypeTextField({
  value,
  onChange,
  metrologyControlTypeList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        id="outlined-select-currency"
        select
        label="Вид метрологического контроля"
        name="verificationOrganizationId"
        size="small"
        fullWidth
        onChange={onChange}
        value={value}
      >
        <MenuItem value="">
          <em>Не выбрано</em>
        </MenuItem>
        {metrologyControlTypeList.map(
          ({ id, name }: { id: string; name: string }) => (
            <MenuItem key={id} value={id}>
              {toCapital(name)}
            </MenuItem>
          )
        )}
      </TextField>

      <Tooltip title="Добавить вид метрологического контроля">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <MetrologyControlTypeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}
