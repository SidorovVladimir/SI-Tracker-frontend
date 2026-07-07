import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  GetUserDocument,
  GetUserQuery,
  UpdateUserDocument,
} from '../../graphql/types/__generated__/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';
import routes from '../../utils/routes';
import { useAuth } from '../../hooks/useAuth';
import { toCapital } from '../../utils/capitalize';

type FieldErrors = {
  firstName?: string;
  lastName?: string;
};

export default function EditUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GetUserDocument, {
    variables: { id: userId! },
    skip: !userId,
  });

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Ошибка загрузки пользователя: {error.message}
      </Alert>
    );
  if (!data?.user) return <Alert>Пользователь не найден</Alert>;

  return <UserForm key={userId} user={data.user} userContext={user} />;
}

function UserForm({
  user,
  userContext,
}: {
  user: NonNullable<GetUserQuery['user']>;
  userContext: any;
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: toCapital(user.firstName) || '',
    lastName: toCapital(user.lastName) || '',
    role: user.role || '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [updateUser, { loading: updating }] = useMutation(UpdateUserDocument, {
    onCompleted: () => {
      enqueueSnackbar('Пользователь успешно обновлен', {
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
          });
          setFieldErrors(errors);
        }
      } catch {
        enqueueSnackbar(`Ошибка обновления: ${error.message}`, {
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
    await updateUser({
      variables: { id: user.id, input: form },
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Редактирование пользователя
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Логин"
              name="login"
              value={user?.login || ''}
              disabled
              fullWidth
              variant="outlined"
              size="small"
            />

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
              id="outlined-select-currency"
              select
              label="Роль"
              name="role"
              size="small"
              fullWidth
              // 🌟 ИСПРАВЛЕНО: Блокируем, если правит сам себя ИЛИ если текущий юзер НЕ суперадмин
              disabled={
                userContext.id === user.id || userContext.role !== 'superadmin'
              }
              onChange={handleChange}
              value={form.role}
            >
              {['superadmin', 'admin', 'user']
                .filter(
                  (name) =>
                    name !== 'superadmin' || userContext.role === 'superadmin'
                )
                .map((name) => (
                  <MenuItem key={name} value={name}>
                    {name === 'superadmin'
                      ? 'Суперадминистратор'
                      : name === 'admin'
                      ? 'Администратор'
                      : 'Пользователь'}
                  </MenuItem>
                ))}
            </TextField>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={updating}
                startIcon={updating && <CircularProgress size={16} />}
              >
                {updating ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
