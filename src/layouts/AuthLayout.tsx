import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 10,
      }}
    >
      <Container maxWidth="sm">{children}</Container>
    </Box>
  );
}
