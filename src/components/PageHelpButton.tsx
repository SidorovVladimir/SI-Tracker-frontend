import { useState } from 'react';
import { useLocation } from 'react-router';
import {
  IconButton,
  Popover,
  Box,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { helpConfig } from '../config/helpConfig';

export default function PageHelpButton() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const currentPath = location.pathname;

  // Ищем совпадение пути
  const helpData =
    helpConfig[currentPath] ||
    Object.entries(helpConfig).find(([key]) =>
      currentPath.startsWith(key)
    )?.[1];

  if (!helpData) return null;

  return (
    <Box>
      <Tooltip title="Справка по разделу" arrow>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          color="primary"
          sx={{ border: '1px solid', borderColor: 'primary.light' }}
        >
          <HelpOutline fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 3,
              mt: 1,
              maxWidth: { xs: 320, sm: 380 },
              maxHeight: { xs: '65vh', sm: '80vh' },
              borderRadius: 3,
              boxShadow: 4,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Фиксированная шапка подсказки */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ mb: 1, color: 'primary.main' }}
        >
          ❓ {helpData.title}
        </Typography>

        {/* 🌟 СКРОЛЛИРУЕМЫЙ КОНТЕЙНЕР ДЛЯ ТЕКСТА: */}
        <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 0.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.5 }}
          >
            {helpData.description}
          </Typography>

          <Stack spacing={1.5}>
            {helpData.bullets.map((bullet, idx) => (
              <Box
                key={idx}
                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
              >
                <Typography
                  variant="body2"
                  color="primary.main"
                  fontWeight="bold"
                  sx={{ mt: -0.2 }}
                >
                  •
                </Typography>
                <Typography
                  variant="caption"
                  color="text.primary"
                  sx={{ lineHeight: 1.4, fontSize: '0.78rem' }}
                >
                  {bullet}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
