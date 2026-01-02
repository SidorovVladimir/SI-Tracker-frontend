import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100dvh - 130px)',
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
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
