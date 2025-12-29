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
import { LoginDocument } from "../graphql/types/__generated__/graphql";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [login] = useMutation(LoginDocument, {
    onCompleted: () => {
      navigate("/");
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" mb={3}>
        Login
      </Typography>

      <Paper sx={{ p: 3 }} variant="outlined">
        <Stack spacing={3} maxWidth={500}>
          <TextField
            label="Email"
            value={form.email}
            size="small"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            variant="outlined"
          />

          <TextField
            label="Password"
            value={form.password}
            size="small"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            variant="outlined"
          />
        </Stack>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.email || !form.password}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
