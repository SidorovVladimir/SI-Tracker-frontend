import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router';
import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';

interface Props {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated && !isLoading) {
      enqueueSnackbar(
        'Время сессии истекло. Пожалуйста, авторизуйтесь снова.',
        {
          variant: 'warning',
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        }
      );
    }

    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, isLoading, enqueueSnackbar]);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role!)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
