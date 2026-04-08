import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
