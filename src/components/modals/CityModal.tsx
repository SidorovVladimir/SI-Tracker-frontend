import { useMutation } from '@apollo/client/react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import {
  CreateCityDocument,
  GetSitiesDocument,
} from '../../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
type FieldErrors = {
  name?: string;
};
export default function CityModal({ open, onClose, onChange }: any) {
  const [form, setForm] = useState<{
    name: string;
  }>({
    name: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [createCity, { loading: creating }] = useMutation(CreateCityDocument, {
    refetchQueries: [{ query: GetSitiesDocument }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      enqueueSnackbar('Город успешно создан', {
        variant: 'success',
      });

      onChange({
        target: {
          name: 'cityId',
          value: data.createCity.id,
        },
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    await createCity({
      variables: {
        input: form,
      },
    });
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Новый город</DialogTitle>
      <DialogContent>
        <Stack sx={{ mt: 2 }} spacing={3}>
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
