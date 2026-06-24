import { AddCircleOutline } from '@mui/icons-material';
import { Box, TextField, Tooltip, IconButton, MenuItem } from '@mui/material';
import { useState } from 'react';
import MetrologyControlTypeModal from './modals/MetrologyControlTypeModal';
import { cleanSpaces } from '../utils/capitalize';

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
        slotProps={{
          select: {
            MenuProps: {
              PaperProps: {
                sx: {
                  maxHeight: { xs: 250, md: 500 },

                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.16)',
                    borderRadius: '4px',
                  },
                },
              },
            },
          },
        }}
        sx={{
          '& .MuiInputBase-input': {
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '0.6px',
            fontWeight: 500,
          },
        }}
      >
        <MenuItem value="">
          <em>Не выбрано</em>
        </MenuItem>
        {metrologyControlTypeList.map(
          ({ id, name }: { id: string; name: string }) => (
            <MenuItem
              key={id}
              value={id}
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.77rem',
                letterSpacing: '0.55px',
                fontWeight: 500,
              }}
            >
              {cleanSpaces(name)}
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
