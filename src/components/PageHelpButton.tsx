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

  // Безопасный поиск конфигурации страницы по текущему URL
  const helpData =
    helpConfig[currentPath] ||
    Object.entries(helpConfig).find(([key]) =>
      currentPath.startsWith(key)
    )?.[1];

  // Если для текущей страницы нет справки (например, главная) — кнопка полностью исчезает, не занимая место
  if (!helpData) return null;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
      <Tooltip title="Справка по текущему разделу" arrow>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'primary.light',
            width: 30,
            height: 30,
            color: 'primary.main',
            bgcolor: 'primary.50',
            '&:hover': { bgcolor: 'primary.100' },
          }}
        >
          <HelpOutline sx={{ fontSize: '1.1rem' }} />
        </IconButton>
      </Tooltip>

      {/* 📋 ОРИГИНАЛЬНЫЙ КОМПАКТНЫЙ ПОПОВЕР (БЕЗ ОШИБОК ГИДРАЦИИ) */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Открываем вниз-вправо от левого угла хедера
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ zIndex: 1600 }} // Поверх абсолютно любых мобильных меню и шторок
        slotProps={{
          paper: {
            sx: {
              p: 3,
              mt: 1,
              maxWidth: { xs: 290, sm: 380 },
              maxHeight: { xs: '60vh', sm: '80vh' },
              borderRadius: 3,
              boxShadow: 5,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: 'primary.main' }}
          >
            ❓ {helpData.title}
          </Typography>
        </Box>

        <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 0.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.5, fontSize: '0.825rem' }}
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
