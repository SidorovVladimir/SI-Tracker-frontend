import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Divider, Paper, Typography } from '@mui/material';
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
];

export default function AdminPage() {
  const { pathname } = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: 'flex-start',
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
          height: { md: 'calc(100dvh - 130px)' },
          position: { md: 'sticky' },
          top: { md: '96px' },
          overflowY: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            p: 2,
            fontWeight: 'bold',
            color: 'text.secondary',
            display: { xs: 'none', md: 'block' },
          }}
        >
          АДМИН-ПАНЕЛЬ
        </Typography>
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
                sx={{ borderRadius: { xs: 1, md: 0 }, whiteSpace: 'nowrap' }}
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
