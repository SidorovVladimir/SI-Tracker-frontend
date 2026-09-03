import { AddCircleOutline } from '@mui/icons-material';
import {
  Box,
  TextField,
  Tooltip,
  IconButton,
  MenuItem,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import ProductionSiteModal from './modals/ProductionSiteModal';
import { cleanSpaces } from '../utils/capitalize';
import CityModal from './modals/CityModal';
import CompanyModal from './modals/CompanyModal';

export default function ProductionSiteTextField({
  onChange,
  form,
  onCityChange,
  onCompanyChange,
  citiesList,
  companiesList,
  productionSiteList,
  isSubmitted,
}: any) {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);

  const filteredSites = productionSiteList.filter(
    (site: { id: string; name: string; cityId: string; companyId: string }) =>
      site.cityId === form.cityId && site.companyId === form.companyId
  );
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          select
          label="Город"
          name="cityId"
          size="small"
          fullWidth
          onChange={onCityChange}
          value={form.cityId}
          required
          error={isSubmitted && !form.cityId}
          helperText={
            isSubmitted && !form.cityId
              ? 'Обязательное поле. Выберите город из списка или добавьте новый'
              : ''
          }
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
          {citiesList.map(({ id, name }: { id: string; name: string }) => (
            <MenuItem
              key={id}
              value={id}
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.77rem',
                letterSpacing: '0.55px',
                fontWeight: 500,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: 1.3,
                py: 1,
              }}
            >
              {cleanSpaces(name)}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title="Добавить город">
          <IconButton
            color="primary"
            onClick={() => setIsCityModalOpen(true)}
            sx={{ p: '8px' }}
          >
            <AddCircleOutline />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          select
          label="Организация"
          name="companyId"
          size="small"
          fullWidth
          onChange={onCompanyChange}
          value={form.companyId}
          disabled={!form.cityId}
          required
          error={isSubmitted && !form.companyId}
          helperText={
            isSubmitted && !form.companyId
              ? 'Обязательное поле. Выберите организацию из списка или добавьте новую'
              : ''
          }
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
          {companiesList.map(({ id, name }: { id: string; name: string }) => (
            <MenuItem
              key={id}
              value={id}
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.77rem',
                letterSpacing: '0.55px',
                fontWeight: 500,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: 1.3,
                py: 1,
              }}
            >
              {cleanSpaces(name)}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title="Добавить организацию">
          <IconButton
            color="primary"
            onClick={() => setIsCompanyModalOpen(true)}
            sx={{ p: '8px' }}
          >
            <AddCircleOutline />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          id="outlined-select-currency"
          select
          label="Производственный участок"
          name="productionSiteId"
          size="small"
          fullWidth
          onChange={onChange}
          value={form.productionSiteId}
          disabled={!form.cityId || !form.companyId}
          required
          error={isSubmitted && !form.productionSiteId}
          helperText={
            isSubmitted && !form.productionSiteId
              ? 'Обязательное поле. Выберите участок из списка или добавьте новый'
              : ''
          }
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
          {filteredSites.map(({ id, name }: { id: string; name: string }) => (
            <MenuItem
              key={id}
              value={id}
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.77rem',
                letterSpacing: '0.55px',
                fontWeight: 500,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: 1.3,
                py: 1,
              }}
            >
              {cleanSpaces(name)}
            </MenuItem>
          ))}
        </TextField>

        <Tooltip title="Добавить производственный участок">
          <IconButton
            color="primary"
            onClick={() => setIsSiteModalOpen(true)}
            disabled={!form.cityId || !form.companyId}
            sx={{ p: '8px' }}
          >
            <AddCircleOutline />
          </IconButton>
        </Tooltip>

        <CityModal
          open={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          onChange={onChange}
        />
        <CompanyModal
          open={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          onChange={onChange}
        />

        <ProductionSiteModal
          open={isSiteModalOpen}
          onClose={() => setIsSiteModalOpen(false)}
          defaultCityId={form.cityId}
          defaultCompanyId={form.companyId}
          onChange={onChange}
        />
      </Box>
    </Stack>
  );
}
