import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Box,
  Container,
  Avatar,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { LogoutDocument } from '../graphql/types/__generated__/graphql';
import routes from '../utils/routes';

export default function NavBar() {
  const { isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logout] = useMutation(LogoutDocument);
  const client = useApolloClient();

  const navigate = useNavigate();
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout failed', error);
    } finally {
      await client.resetStore();
      navigate(routes.login());
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        height: '64px',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1, // Чтобы был поверх сайдбара
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to={routes.home()}
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            SI-Tracker
          </Typography>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={handleMenu}
                sx={{ p: 0.5, border: '1px solid', borderColor: 'divider' }}
              >
                <Avatar sx={{ width: 32, height: 32 }} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{ paper: { sx: { width: 200, mt: 1.5 } } }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <MenuItem
                  component={Link}
                  to={routes.profile()}
                  onClick={handleClose}
                >
                  Профиль
                </MenuItem>
                <MenuItem
                  component={Link}
                  to={routes.admin.root()}
                  onClick={handleClose}
                >
                  Панель администратора
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Выход
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              component={Link}
              to={routes.login()}
              variant="contained"
              size="small"
            >
              Вход
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
