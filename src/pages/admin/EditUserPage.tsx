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
import { GetUserDocument } from '../../graphql/types/__generated__/graphql';
import { useQuery } from '@apollo/client/react';

export default function EditUserPage() {
  const { userId } = useParams<{ userId: string }>();

  const { data, loading, error } = useQuery(GetUserDocument, {
    variables: { id: userId! },
    skip: !userId,
  });

  const user = data?.user;

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  if (user && (!form.firstName || !form.lastName)) {
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

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
            />

            <TextField
              label="Имя"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" size="large">
                Сохранить изменения
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
