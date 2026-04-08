import { useMutation } from '@apollo/client/react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import {
  CreateEquipmentTypeDocument,
  GetEquipmentTypesListDocument,
} from '../../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
type FieldErrors = {
  name?: string;
};
export default function EquipmentModal({ open, onClose }: any) {
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
        onClose(true);
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Новый тип оборудования</DialogTitle>
      <DialogContent>
        <Stack sx={{ mt: 2 }}>
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={creating}
          startIcon={creating && <CircularProgress size={16} />}
        >
          {creating ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
