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
  PersonOutline, // 🌟 Заменили иконку почты на иконку пользователя
} from '@mui/icons-material';

export default function LoginPage() {
  const navigate = useNavigate();
  const client = useApolloClient();

  // 🌟 ИСПРАВЛЕНО: Заменили email на login в стейте формы
  const [form, setForm] = useState({
    login: '',
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
    const { login: userLogin, password } = form;
    if (!userLogin.trim() || !password) {
      return;
    }

    // Отправляем очищенный логин на бэкенд
    await login({
      variables: {
        input: {
          login: userLogin.trim(),
          password,
        },
      },
    });
  };

  return (
    <>
      {/* ЛОГОТИП И ШАПКА СИСТЕМЫ */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: '.2rem',
            color: '#1a1a1a',
            fontSize: { xs: '2rem', sm: '3rem' }, // Сжали размер логотипа для мобилок
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
          display="block"
          sx={{ color: 'text.secondary', letterSpacing: '.05rem', mt: 0.5 }}
        >
          система учета средств измерений
        </Typography>
      </Box>

      {/* ФОРМА ВХОДА */}
      <Paper sx={{ p: 3, width: '100%', borderRadius: 3 }} variant="outlined">
        <Stack spacing={3}>
          {/* 🌟 ИСПРАВЛЕНО: Текстовое поле Логина вместо Электронной почты */}
          <TextField
            name="login"
            type="text" // 🔒 Строго текстовое поле, чтобы браузер не требовал символ "@"
            label="Логин / Табельный номер"
            required
            fullWidth
            autoComplete="username"
            autoFocus={true}
            value={form.login}
            size="small"
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline color="action" />
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

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            // Кнопка активна только если заполнены оба поля
            disabled={!form.login.trim() || !form.password}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              height: 40,
              borderRadius: 2,
            }}
          >
            Войти в систему
          </Button>
        </Box>

        <Box sx={{ mt: 2.5, textAlign: 'center' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.75rem', fontWeight: 500 }}
          >
            Локальный сервер предприятия • Версия 1.0.0
          </Typography>
        </Box>
      </Paper>
    </>
  );
}
