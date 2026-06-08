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
import { useState } from 'react';
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
} from '@mui/icons-material';

const pulseKeyframes = {
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
  '100%': { transform: 'scale(1)' },
};

// export default function NavBar() {
//   const { isAuthenticated, user } = useAuth();
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [logout] = useMutation(LogoutDocument);
//   const client = useApolloClient();

//   const navigate = useNavigate();
//   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.warn('Logout failed', error);
//     } finally {
//       await client.resetStore();
//       navigate(routes.login());
//     }
//   };

//   return (
//     <AppBar
//       position="sticky"
//       elevation={0}
//       sx={{
//         height: '64px',
//         borderBottom: '1px solid',
//         borderColor: 'divider',
//         bgcolor: 'background.paper',
//         color: 'text.primary',
//         zIndex: (theme) => theme.zIndex.drawer + 1, // Чтобы был поверх сайдбара
//       }}
//     >
//       <Container maxWidth="lg">
//         <Toolbar disableGutters>
//           <Tooltip
//             title="На главную"
//             arrow
//             placement="bottom-start"
//             enterDelay={500} // Появится не сразу, чтобы не раздражать при случайном наведении
//           >
//             <Typography
//               variant="h6"
//               component={Link}
//               to={routes.home()}
//               sx={{
//                 flexGrow: 1,
//                 textDecoration: 'none',
//                 color: 'inherit',
//                 fontWeight: 700,
//                 display: 'inline-block',
//                 width: 'fit-content',
//                 cursor: 'pointer',
//                 animation: 'pulse-once 0.8s ease-in-out',
//                 '@keyframes pulse-once': pulseKeyframes,
//                 '&:hover': {
//                   color: 'primary.main',
//                   transition: 'opacity 0.2s',
//                 },
//               }}
//             >
//               SI-Tracker
//             </Typography>
//           </Tooltip>

//           {isAuthenticated ? (
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               <IconButton
//                 onClick={handleMenu}
//                 sx={{ p: 0.5, border: '1px solid', borderColor: 'divider' }}
//               >
//                 <Avatar sx={{ width: 32, height: 32 }} />
//               </IconButton>

//               <Menu
//                 anchorEl={anchorEl}
//                 open={Boolean(anchorEl)}
//                 onClose={handleClose}
//                 slotProps={{ paper: { sx: { width: 220, mt: 1.5 } } }}
//                 transformOrigin={{ vertical: 'top', horizontal: 'right' }}
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//               >
//                 <MenuItem
//                   component={Link}
//                   to={routes.profile()}
//                   onClick={handleClose}
//                 >
//                   <ListItemText>Профиль</ListItemText>
//                 </MenuItem>
//                 <MenuItem
//                   component={Link}
//                   to={routes.admin.root()}
//                   onClick={handleClose}
//                 >
//                   {user?.role !== 'user' && (
//                     <ListItemText>Панель администратора</ListItemText>
//                   )}
//                   {/* <ListItemText>Панель администратора</ListItemText> */}
//                 </MenuItem>

//                 <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
//                   <ListItemText>Выход</ListItemText>
//                 </MenuItem>
//               </Menu>
//             </Box>
//           ) : (
//             <Button
//               component={Link}
//               to={routes.login()}
//               variant="contained"
//               size="small"
//             >
//               Вход
//             </Button>
//           )}
//         </Toolbar>
//       </Container>
//     </AppBar>
//   );
// }
export default function NavBar() {
  const { isAuthenticated, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 🎯 Новое состояние для админ-меню
  const [adminAnchorEl, setAdminAnchorEl] = useState<null | HTMLElement>(null);

  const [logout] = useMutation(LogoutDocument);
  const client = useApolloClient();
  const navigate = useNavigate();

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
                fontWeight: 700,
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
              SI-Tracker
            </Typography>
          </Tooltip>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 1.5,
                      height: 36,
                    }}
                  >
                    Управление
                  </Button>

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

                    <Box
                      sx={{
                        my: 0.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    />

                    <MenuItem
                      component={Link}
                      to={routes.import()}
                      onClick={handleAdminMenuClose}
                    >
                      <ListItemIcon sx={{ color: 'warning.main' }}>
                        <CloudUpload fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        slotProps={{ primary: { sx: { fontWeight: 'bold' } } }}
                      >
                        📥 Импорт данных Excel
                      </ListItemText>
                    </MenuItem>

                    <MenuItem
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
                    </MenuItem>
                  </Menu>
                </Box>
              )}

              {/* МЕНЮ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ */}
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

                {/* 🎯 ИСПРАВЛЕНИЕ: Теперь MenuItem целиком скрывается от обычных юзеров */}
                {user?.role !== 'user' && (
                  <MenuItem
                    component={Link}
                    to={routes.admin.root()}
                    onClick={handleClose}
                  >
                    <ListItemText>Панель администратора</ListItemText>
                  </MenuItem>
                )}

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemText>Выход</ListItemText>
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
