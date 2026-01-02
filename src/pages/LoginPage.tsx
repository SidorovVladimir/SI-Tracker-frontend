import { useMutation } from '@apollo/client/react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { LoginDocument } from '../graphql/types/__generated__/graphql';
import { Link, useNavigate } from 'react-router';
import routes from '../utils/routes';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [login] = useMutation(LoginDocument, {
    onCompleted: () => {
      navigate(routes.home());
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
      <Typography variant="h5" component="h1" gutterBottom>
        Войти в систему
      </Typography>

      <Paper sx={{ p: 3, width: '100%' }} variant="outlined">
        <Stack spacing={3}>
          <TextField
            label="Email"
            value={form.email}
            size="small"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            variant="outlined"
          />

          <TextField
            type="password"
            label="Password"
            value={form.password}
            size="small"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            variant="outlined"
          />
        </Stack>
        <Typography sx={{ mt: 2 }}>
          Нет аккаунта? <Link to={routes.register()}>Зарегистрироваться</Link>
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.email || !form.password}
          >
            Войти
          </Button>
        </Box>
      </Paper>
    </>
  );
}
