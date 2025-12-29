import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { RegisterDocument } from "../graphql/types/__generated__/graphql";
import { Link, useNavigate } from "react-router";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [register] = useMutation(RegisterDocument, {
    onCompleted: () => {
      navigate("/");
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" mb={3}>
        Register
      </Typography>

      <Paper sx={{ p: 3 }} variant="outlined">
        <Stack spacing={3} maxWidth={500}>
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
        <h3>
          Есть аккаунт? <Link to="/login">Войти</Link>
        </h3>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !form.firstName || !form.lastName || !form.email || !form.password
            }
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
