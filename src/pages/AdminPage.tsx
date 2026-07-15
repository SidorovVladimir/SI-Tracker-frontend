import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {
  Divider,
  Paper,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router';
import routes from '../utils/routes';

const SIDEBAR_WIDTH = 240;
const menu = [
  { item: 'Пользователи', path: routes.admin.users() },
  { item: 'Города', path: routes.admin.cities() },
  { item: 'Компании', path: routes.admin.companies() },
  { item: 'Производственные участки', path: routes.admin.productionSites() },
  { item: 'Типы оборудования', path: routes.admin.equipmentTypes() },
  { item: 'Виды измерения', path: routes.admin.measurementTypes() },
  {
    item: 'Виды метрологического контроля',
    path: routes.admin.metrologyControlTypes(),
  },
  { item: 'Сферы применения', path: routes.admin.scopes() },
  { item: 'Состояния приборов', path: routes.admin.statuses() },
  { item: 'Первичные эталоны', path: routes.admin.primaryStandarts() },
  {
    item: 'Организации поверители',
    path: routes.admin.verificationOrganizations(),
  },
  { item: 'Логи', path: routes.admin.auditLogs() },
];

export default function AdminPage() {
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Определяем мобильный экран

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      <Paper
        component="aside"
        elevation={0}
        sx={{
          width: { xs: '100%', md: SIDEBAR_WIDTH },
          flexShrink: 0,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          height: { xs: 'auto', md: '100%' },
          position: { md: 'sticky' },
          top: { md: '96px' },
          overflowY: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        {/* 💻 ДЕСКТОПНАЯ ШАПКА САЙДБАРА С КНОПКОЙ ПОМОЩИ (md и выше) */}
        {!isMobile && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 2 }}
          >
            <Typography
              component={Link}
              to={routes.admin.root()}
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                color: 'text.secondary',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.main', // Мягкая подсветка при наведении
                },
              }}
            >
              АДМИН-ПАНЕЛЬ
            </Typography>
          </Stack>
        )}

        {isMobile && (
          <Box sx={{ p: 1, pb: 0 }}>
            <ListItemButton
              component={Link}
              to={routes.admin.root()}
              selected={pathname === routes.admin.root()}
              sx={{
                borderRadius: 1,
                bgcolor: 'grey.100',
                justifyContent: 'center',
                mb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
                🏠 ГЛАВНЫЙ ДАШБОРД НСИ
              </Typography>
            </ListItemButton>
          </Box>
        )}

        <Divider sx={{ display: { xs: 'none', md: 'block' } }} />

        <List
          sx={{
            display: { xs: 'flex', md: 'block' },
            p: { xs: 1, md: 0 },
            overflowX: { xs: 'auto', md: 'hidden' },
          }}
        >
          {menu.map(({ item, path }) => (
            <ListItem
              key={item}
              disablePadding
              sx={{ width: { xs: 'auto', md: '100%' } }}
            >
              <ListItemButton
                component={Link}
                to={path}
                selected={pathname.includes(path)}
                sx={{
                  borderRadius: { xs: 1, md: 0 },
                  whiteSpace: { sm: 'nowrap', xs: 'nowrap', md: 'wrap' },
                }}
              >
                <ListItemText primary={item} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box
        component="section"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100%',
          width: { xs: '100%' },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
