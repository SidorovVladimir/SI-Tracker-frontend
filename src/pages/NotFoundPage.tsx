import { Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import routes from '../utils/routes';

export default function NotFoundPage() {
  return (
    <Stack
      sx={{
        minHeight: 'calc(100dvh - 130px)',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        textAlign: 'center',
      }}
      spacing={2}
    >
      <Typography variant="h3" fontWeight="bold" color="text.primary">
        404
      </Typography>

      <Typography variant="h6" fontWeight="medium">
        Упс! Страница не найдена
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: '400px' }}
      >
        Похоже, страница, которую вы ищете, была перемещена, удалена или никогда
        не существовала.
      </Typography>

      <Button
        component={Link}
        to={routes.home()}
        variant="contained"
        startIcon={<HomeRoundedIcon />}
        sx={{
          px: 4,
          textTransform: 'none',
        }}
      >
        На главную
      </Button>
    </Stack>
  );
}
