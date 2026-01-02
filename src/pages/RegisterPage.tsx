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
import { RegisterDocument } from '../graphql/types/__generated__/graphql';
import { Link, useNavigate } from 'react-router';
import routes from '../utils/routes';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [register] = useMutation(RegisterDocument, {
    onCompleted: () => {
      navigate(routes.home());
    },
  });

  const handleSubmit = async () => {
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      return;
    }

    await register({ variables: { input: form } });
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Регистрация
      </Typography>

      <Paper sx={{ p: 3, width: '100%' }} variant="outlined">
        <Stack spacing={3}>
          <TextField
            label="First Name"
            value={form.firstName}
            size="small"
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            variant="outlined"
          />
          <TextField
            label="Last Name"
            value={form.lastName}
            size="small"
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            variant="outlined"
          />
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
          Есть аккаунт? <Link to={routes.login()}>Войти</Link>
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !form.firstName || !form.lastName || !form.email || !form.password
            }
          >
            Зарегистироваться
          </Button>
        </Box>
      </Paper>
    </>
  );
}
