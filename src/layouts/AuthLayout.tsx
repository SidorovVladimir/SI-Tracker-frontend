import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Центр по вертикали
        alignItems: 'center', // Центр по горизонтали
        // Используем 100dvh (динамический vh), вычитая примерную высоту навбара
        minHeight: 'calc(100dvh - 64px)',
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <Container
        maxWidth="xs" // Для форм логина идеально 444px
        sx={{
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}
