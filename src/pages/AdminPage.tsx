import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Divider, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router';
import routes from '../utils/routes';

const sidebarWidth = 200;

export default function AdminPage() {
  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          height: 'calc(100vh - 80px)',
          overflowY: 'auto',
          position: 'sticky',
          // top: 64,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          textAlign="center"
          sx={{ py: 2 }}
        >
          Панель администратора
        </Typography>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to={routes.admin.users()}>
              <ListItemText primary="Пользователи" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
