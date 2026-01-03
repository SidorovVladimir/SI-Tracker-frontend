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
} from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router';
import {
  GetUserDocument,
  GetUserQuery,
  UpdateUserDocument,
} from '../../graphql/types/__generated__/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';

type FieldErrors = {
  firstName?: string;
  lastName?: string;
};

export default function EditUserPage() {
  const { userId } = useParams<{ userId: string }>();

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

  return <UserForm key={userId} user={data.user} />;
}

function UserForm({ user }: { user: NonNullable<GetUserQuery['user']> }) {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [updateUser, { loading: updating }] = useMutation(UpdateUserDocument, {
    onCompleted: () => {
      enqueueSnackbar('Пользователь успешно обновлен', {
        variant: 'success',
      });
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
              label="Email"
              name="email"
              value={user?.email || ''}
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
