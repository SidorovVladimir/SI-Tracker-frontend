import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router';

export function MainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        component="main"
        sx={{
          minHeight: 'calc(100dvh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, flexGrow: 1 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
