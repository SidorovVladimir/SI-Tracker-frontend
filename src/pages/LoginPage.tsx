import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { LoginDocument } from '../graphql/types/__generated__/graphql';
import { useNavigate } from 'react-router';
import routes from '../utils/routes';
import { enqueueSnackbar } from 'notistack';
import {
  Visibility,
  VisibilityOff,
  Lock,
  MailOutline,
} from '@mui/icons-material';

export default function LoginPage() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [login] = useMutation(LoginDocument, {
    onCompleted: async () => {
      try {
        await client.resetStore().catch(() => {});
      } catch (e) {}
      navigate(routes.home());
    },
    onError: (err) => {
      enqueueSnackbar(`Ошибка входа: ${err.message}`, {
        variant: 'error',
      });
    },
  });

  const handleSubmit = async () => {
    const { email, password } = form;
    if (!email || !password) {
      return;
    }

    await login({ variables: { input: form } });
  };

  return (
    <>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: '.2rem',
            color: '#1a1a1a',
          }}
        >
          ЭТАЛОН
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: '#3f6cb8',
            letterSpacing: '.15rem',
            mt: -0.5,
          }}
        >
          ТРЕКЕР СИ
        </Typography>
        <Typography
          variant="caption"
          display="block" // Чтобы перенеслось на новую строку
          sx={{ color: 'text.secondary', letterSpacing: '.05rem', mt: 0.5 }}
        >
          система учета средств измерений
        </Typography>
      </Box>

      <Paper sx={{ p: 3, width: '100%' }} variant="outlined">
        <Stack spacing={3}>
          <TextField
            name="email"
            type="email"
            label="Электронная почта"
            required
            fullWidth
            autoComplete="email"
            autoFocus={true}
            value={form.email}
            size="small"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutline color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            type={showPassword ? 'text' : 'password'}
            label="Пароль"
            id="password"
            required
            autoComplete="current-password"
            value={form.password}
            size="small"
            fullWidth
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
        {/* <Typography sx={{ mt: 2 }}>
          Нет аккаунта? <Link to={routes.register()}>Зарегистрироваться</Link>
        </Typography> */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={!form.email || !form.password}
          >
            Войти
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Локальный сервер предприятия • Версия 1.0.0
          </Typography>
        </Box>
      </Paper>
    </>
  );
}
