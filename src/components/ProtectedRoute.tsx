import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router';

interface Props {
  allowedRoles?: string[];
}

// export default function ProtectedRoute() {
//   const { isAuthenticated, isLoading } = useAuth();
//   if (isLoading)
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="100vh"
//       >
//         <CircularProgress />
//       </Box>
//     );
//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
// }

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

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
