import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CreateEquipmentTypeDocument,
  GetEquipmentTypesListDocument,
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
  name?: string;
};

export default function CreateEquipmentTypePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [createEquipmentType, { loading: creating }] = useMutation(
    CreateEquipmentTypeDocument,
    {
      refetchQueries: [{ query: GetEquipmentTypesListDocument }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Тип оборудования успешно создан', {
          variant: 'success',
        });
        navigate(routes.admin.equipmentTypes());
      },
      onError: (error) => {
        try {
          const parsed = JSON.parse(error.message);
          if (Array.isArray(parsed)) {
            const errors: FieldErrors = {};
            parsed.forEach((err) => {
              if (err.path.includes('name')) {
                errors.name = err.message;
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
    }
  );

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
    await createEquipmentType({
      variables: { input: form },
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Создание типа оборудования
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextField
              label="Название"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
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
