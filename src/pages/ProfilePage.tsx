import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Stack,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  const initials = `${user?.firstName?.charAt(0) || ''}${
    user?.lastName?.charAt(0) || ''
  }`;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Мой профиль
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: 'background.paper',
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
                bgcolor: 'primary.main',
                boxShadow: (theme) =>
                  `0 0 0 4px ${theme.palette.background.paper}, 0 0 0 6px ${theme.palette.primary.light}`,
              }}
            >
              {initials.toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Chip
              label="Пользователь"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 4,
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 'bold' }}
                >
                  Личные данные
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 2 }}
                  alignItems="center"
                >
                  <BadgeIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Имя и фамилия
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Электронная почта
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{ borderRadius: 2, px: 4 }}
                  disabled
                >
                  Редактировать
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
