import { AddCircleOutline } from '@mui/icons-material';
import { Box, TextField, Tooltip, IconButton, MenuItem } from '@mui/material';
import { useState } from 'react';
import ProductionSiteModal from './modals/ProductionSiteModal';

export default function ProductionSiteTextField({
  value,
  onChange,
  productionSiteList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        id="outlined-select-currency"
        select
        label="Производственный участок"
        name="productionSiteId"
        size="small"
        fullWidth
        onChange={onChange}
        value={value}
        required
      >
        {productionSiteList.map(
          ({ id, name }: { id: string; name: string }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          )
        )}
      </TextField>

      <Tooltip title="Добавить производственный участок">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <ProductionSiteModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}
