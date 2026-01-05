import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CreateUserDocument,
  GetUsersDocument,
} from '../../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
import routes from '../../utils/routes';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [createUser, { loading: creating }] = useMutation(CreateUserDocument, {
    refetchQueries: [{ query: GetUsersDocument }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      enqueueSnackbar('Пользователь успешно создан', {
        variant: 'success',
      });
      navigate(routes.admin.users());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    await createUser({
      variables: { input: form },
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Создание пользователя
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Имя"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!fieldErrors.firstName}
              helperText={fieldErrors.firstName}
            />

            <TextField
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!fieldErrors.lastName}
              helperText={fieldErrors.lastName}
            />
            <TextField
              label="Почта"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <TextField
              type="password"
              label="Пароль"
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={creating}
                startIcon={creating && <CircularProgress size={16} />}
              >
                {creating ? 'Создание...' : 'Создать'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
