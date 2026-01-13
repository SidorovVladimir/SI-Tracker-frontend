import { useMutation } from '@apollo/client/react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { RegisterDocument } from '../graphql/types/__generated__/graphql';
import { Link, useNavigate } from 'react-router';
import routes from '../utils/routes';
import { enqueueSnackbar } from 'notistack';

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [register, { loading }] = useMutation(RegisterDocument, {
    onCompleted: () => {
      enqueueSnackbar('Пользователь успешно зарегистировался', {
        variant: 'success',
      });
      navigate(routes.home());
    },
    onError: (error) => {
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed)) {
          const errors: FieldErrors = {};
          parsed.forEach((err) => {
            if (err.path.includes('firstName')) {
              errors.firstName = err.message;
            }
            if (err.path.includes('lastName')) {
              errors.lastName = err.message;
            }
            if (err.path.includes('email')) {
              errors.email = err.message;
            }
            if (err.path.includes('password')) {
              errors.password = err.message;
            }
          });
          setFieldErrors(errors);
        }
      } catch {
        enqueueSnackbar(`Ошибка создания: ${error.message}`, {
          variant: 'error',
        });
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Регистрация
      </Typography>

      <Paper sx={{ p: 3, width: '100%' }} variant="outlined">
        <Stack spacing={3}>
          <TextField
            label="Имя"
            name="firstName"
            value={form.firstName}
            size="small"
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.firstName}
            helperText={fieldErrors.firstName}
          />
          <TextField
            label="Фамилия"
            name="lastName"
            value={form.lastName}
            size="small"
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.lastName}
            helperText={fieldErrors.lastName}
          />
          <TextField
            label="Почта"
            name="email"
            value={form.email}
            size="small"
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />

          <TextField
            type="password"
            label="Пароль"
            name="password"
            value={form.password}
            size="small"
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />
        </Stack>
        <Typography sx={{ mt: 2 }}>
          Есть аккаунт? <Link to={routes.login()}>Войти</Link>
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={async () => {
              setFieldErrors({});
              console.log(form);
              await register({ variables: { input: form } });
            }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </Box>
      </Paper>
    </>
  );
}
