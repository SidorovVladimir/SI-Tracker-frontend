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
import { useNavigate, useParams } from 'react-router';
import {
  GetCompanyDocument,
  GetCompanyQuery,
  UpdateCompanyDocument,
} from '../../graphql/types/__generated__/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';
import routes from '../../utils/routes';

type FieldErrors = {
  name?: string;
};

export default function EditCompanyPage() {
  const { companyId } = useParams<{ companyId: string }>();

  const { data, loading, error } = useQuery(GetCompanyDocument, {
    variables: { id: companyId! },
    skip: !companyId,
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
        Ошибка загрузки компаний: {error.message}
      </Alert>
    );
  if (!data?.company) return <Alert>Город не найден</Alert>;

  return <UserForm key={companyId} company={data.company} />;
}

function UserForm({
  company,
}: {
  company: NonNullable<GetCompanyQuery['company']>;
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState<{ name: string; address: string | null }>({
    name: company.name || '',
    address: company.address || null,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [updateCity, { loading: updating }] = useMutation(
    UpdateCompanyDocument,
    {
      onCompleted: () => {
        enqueueSnackbar('Компания успешно обновлена', {
          variant: 'success',
        });
        navigate(routes.admin.companies());
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
          enqueueSnackbar(`Ошибка обновления: ${error.message}`, {
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

    const input = {
      name: form.name,
      address: form.address || null,
    };

    await updateCity({
      variables: { id: company.id, input },
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Редактирование компании
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
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
            <TextField
              label="Адрес"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
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
