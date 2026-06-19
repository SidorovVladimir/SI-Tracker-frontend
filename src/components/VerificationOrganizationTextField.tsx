import { AddCircleOutline } from '@mui/icons-material';
import { Box, TextField, Tooltip, IconButton, MenuItem } from '@mui/material';
import { useState } from 'react';
import VerificationOrganizationModal from './modals/VerificationOrganizationModal';
import { toCapital } from '../utils/capitalize';

export default function VerificationOrganizationTextField({
  value,
  onChange,
  verificationOrganizationsList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        id="outlined-select-currency"
        select
        label="Организация поверитель"
        name="verificationOrganizationId"
        size="small"
        fullWidth
        onChange={onChange}
        value={value}
      >
        <MenuItem value="">
          <em>Не выбрано</em>
        </MenuItem>
        {verificationOrganizationsList.map(
          ({ id, name }: { id: string; name: string }) => (
            <MenuItem key={id} value={id}>
              {toCapital(name)}
            </MenuItem>
          )
        )}
      </TextField>

      <Tooltip title="Добавить организацию-поверитель">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <VerificationOrganizationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}
