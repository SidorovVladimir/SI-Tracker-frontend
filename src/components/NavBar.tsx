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
  ListItemText,
  Tooltip,
  ListItemIcon,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { LogoutDocument } from '../graphql/types/__generated__/graphql';
import routes from '../utils/routes';
import {
  KeyboardArrowDown,
  Settings,
  CalendarMonth,
  BarChart,
  Assessment,
  CloudUpload,
  Terminal,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { HeaderNotificationsBell } from './HeaderNotificationsBell';
import { HeaderChatButton } from './HeaderChatButton';
import { useSocketApp } from '../context/SocketContext';

const pulseKeyframes = {
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
  '100%': { transform: 'scale(1)' },
};

export default function NavBar() {
  const { isAuthenticated, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { socket } = useSocketApp();

  // 🎯 Новое состояние для админ-меню
  const [adminAnchorEl, setAdminAnchorEl] = useState<null | HTMLElement>(null);

  const [logout] = useMutation(LogoutDocument);
  const client = useApolloClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setAnchorEl(null);
      setAdminAnchorEl(null);
    }
  }, [isAuthenticated]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 🎯 Функции для админ-меню
  const handleAdminMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAdminAnchorEl(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminAnchorEl(null);
  };

  // const handleLogout = async () => {
  //   setAnchorEl(null);
  //   setAdminAnchorEl(null);
  //   try {
  //     await logout();
  //   } catch (error) {
  //     console.warn('Logout failed', error);
  //   } finally {
  //     // try {
  //     //   if (socket) {
  //     //     socket.disconnect();
  //     //   }
  //     //   // client.stop();

  //     //   await client.clearStore();
  //     //   client.writeQuery({
  //     //     query: GetMeDocument,
  //     //     data: { me: null },
  //     //   });
  //     // } catch (clearError) {}
  //     // navigate(routes.login());
  //     if (socket) {
  //       socket.disconnect();
  //     }

  //     window.location.href = routes.login();
  //   }
  // };

  const handleLogout = async () => {
    setAnchorEl(null);
    setAdminAnchorEl(null);

    try {
      if (socket) {
        socket.disconnect();
      }
      await logout();
    } catch (error) {
      console.warn('Logout failed', error);
    } finally {
      try {
        await client.resetStore().catch(() => {});
      } catch (e) {}

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
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Tooltip
            title="На главную"
            arrow
            placement="bottom-start"
            enterDelay={500}
          >
            <Typography
              variant="h6"
              component={Link}
              to={routes.home()}
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 800,
                letterSpacing: { xs: '0.5px', sm: '2px' },
                fontSize: { xs: '1rem', sm: '1.25rem' },
                display: 'inline-block',
                width: 'fit-content',
                cursor: 'pointer',
                animation: 'pulse-once 0.8s ease-in-out',
                '@keyframes pulse-once': pulseKeyframes,
                '&:hover': {
                  color: 'primary.main',
                  transition: 'opacity 0.2s',
                },
              }}
            >
              ЭТАЛОН
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'inline' },
                }}
              >
                -ТРЕКЕР
              </Box>
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                  display: { xs: 'inline', sm: 'none' },
                }}
              >
                ·Т
              </Box>
            </Typography>
          </Tooltip>

          {isAuthenticated && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1.5 },
              }}
            >
              {/* 🎯 КНОПКА «УПРАВЛЕНИЕ» ДЛЯ АДМИНОВ И МЕТРОЛОГОВ */}
              {user?.role !== 'user' && (
                <Box>
                  <Button
                    id="admin-nav-button"
                    aria-controls={
                      Boolean(adminAnchorEl) ? 'admin-nav-menu' : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={Boolean(adminAnchorEl) ? 'true' : undefined}
                    variant="text"
                    color="inherit"
                    onClick={handleAdminMenuOpen}
                    endIcon={<KeyboardArrowDown />}
                    startIcon={<Settings />}
                    size="small"
                    sx={{
                      display: { xs: 'none', sm: 'inline-flex' },
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 1.5,
                      height: 36,
                    }}
                  >
                    Управление
                  </Button>
                  <IconButton
                    id="admin-nav-button-mobile"
                    color="inherit"
                    onClick={handleAdminMenuOpen}
                    sx={{ display: { xs: 'flex', sm: 'none' }, p: 1 }}
                  >
                    <Settings />
                  </IconButton>

                  <Menu
                    id="admin-nav-menu"
                    anchorEl={adminAnchorEl}
                    open={Boolean(adminAnchorEl)}
                    onClose={handleAdminMenuClose}
                    sx={{ mt: 1 }}
                    slotProps={{
                      paper: {
                        sx: { borderRadius: 2, boxShadow: 4, minWidth: 250 },
                      },
                    }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <MenuItem
                      component={Link}
                      to={routes.planning()}
                      onClick={handleAdminMenuClose}
                    >
                      <ListItemIcon sx={{ color: 'primary.main' }}>
                        <CalendarMonth fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        slotProps={{ primary: { sx: { fontWeight: 'bold' } } }}
                      >
                        📅 Планировщик поверок
                      </ListItemText>
                    </MenuItem>

                    <MenuItem
                      component={Link}
                      to={routes.analytics()}
                      onClick={handleAdminMenuClose}
                    >
                      <ListItemIcon sx={{ color: 'success.main' }}>
                        <BarChart fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        slotProps={{ primary: { sx: { fontWeight: 'bold' } } }}
                      >
                        📊 Аналитика и бюджет затрат
                      </ListItemText>
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to={routes.budget()}
                      onClick={handleAdminMenuClose}
                    >
                      <ListItemIcon sx={{ color: 'primary.main' }}>
                        <AccountBalanceWallet fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        slotProps={{ primary: { sx: { fontWeight: 'bold' } } }}
                      >
                        💰 Планирование бюджета поверок
                      </ListItemText>
                    </MenuItem>

                    <MenuItem
                      component={Link}
                      to={routes.productionAnalytics()}
                      onClick={handleAdminMenuClose}
                    >
                      <ListItemIcon sx={{ color: 'info.main' }}>
                        <Assessment fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        slotProps={{ primary: { sx: { fontWeight: 'bold' } } }}
                      >
                        📋 Объемы СИ и мониторинг
                      </ListItemText>
                    </MenuItem>

                    {user?.role === 'superadmin' && [
                      // 1. Разделительная линия
                      <Box
                        key="superadmin-divider"
                        sx={{
                          my: 0.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      />,

                      // 2. Пункт импорта
                      <MenuItem
                        key="superadmin-import"
                        component={Link}
                        to={routes.import()}
                        onClick={handleAdminMenuClose}
                      >
                        <ListItemIcon sx={{ color: 'warning.main' }}>
                          <CloudUpload fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          slotProps={{
                            primary: { sx: { fontWeight: 'bold' } },
                          }}
                        >
                          📥 Импорт данных Excel
                        </ListItemText>
                      </MenuItem>,

                      // 3. Пункт SQL консоли
                      <MenuItem
                        key="superadmin-sql"
                        component={Link}
                        to={routes.sqlConsole()}
                        onClick={handleAdminMenuClose}
                      >
                        <ListItemIcon sx={{ color: 'error.main' }}>
                          <Terminal fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          slotProps={{
                            primary: {
                              sx: { fontWeight: 'bold', color: 'error.main' },
                            },
                          }}
                        >
                          💻 SQL Консоль (Сырая база)
                        </ListItemText>
                      </MenuItem>,
                    ]}
                  </Menu>
                </Box>
              )}
              <HeaderChatButton />

              <HeaderNotificationsBell />

              {/* МЕНЮ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ */}
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  ml: { xs: 0.5, sm: 1 },
                }}
              >
                <Avatar sx={{ width: 32, height: 32 }} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{ paper: { sx: { width: 220, mt: 1.5 } } }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <MenuItem
                  component={Link}
                  to={routes.profile()}
                  onClick={handleClose}
                >
                  <ListItemText>Профиль</ListItemText>
                </MenuItem>

                {user?.role !== 'user' && (
                  <MenuItem
                    component={Link}
                    to={routes.admin.root()}
                    onClick={handleClose}
                  >
                    <ListItemText>Панель администратора</ListItemText>
                  </MenuItem>
                )}
                {/* <MenuItem
                  component={Link}
                  to={routes.about()}
                  onClick={handleClose}
                >
                  <ListItemText>О программе</ListItemText>
                </MenuItem> */}

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemText>Выход</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
