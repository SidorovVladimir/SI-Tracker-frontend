// src/modules/budget/components/CreateBudgetPlanModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CreateBudgetPlanDocument,
  GetPricelistsDocument,
} from '../../graphql/types/__generated__/graphql';

interface CreateBudgetPlanModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateBudgetPlanModal: React.FC<CreateBudgetPlanModalProps> = ({
  open,
  onClose,
}) => {
  // Текущий год по умолчанию для планирования (следующий от текущего)
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear + 1);
  const [comment, setComment] = useState<string>('');
  const [selectedPricelistIds, setSelectedPricelistIds] = useState<string[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Загружаем доступные в базе прейскуранты ЦСМ
  const { data, loading, error } = useQuery(GetPricelistsDocument, {
    skip: !open,
    fetchPolicy: 'network-only',
  });

  // 2. Мутация создания бюджета
  const [createBudgetPlan] = useMutation(CreateBudgetPlanDocument, {
    // После создания обновляем основной список бюджетов на главной странице
    refetchQueries: [{ query: GetPricelistsDocument }],
  });

  const pricelists = data?.pricelists || [];

  // Хэндлер выбора/отмены чекбокса прайса
  const handleTogglePricelist = (id: string) => {
    setSelectedPricelistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Хэндлер отправки формы на бэкенд (Запуск каскадного расчета)
  const handleSubmit = async () => {
    if (selectedPricelistIds.length === 0) {
      setSubmitError(
        'Необходимо выбрать хотя бы один прейскурант ЦСМ для расчета цен.'
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createBudgetPlan({
        variables: {
          input: {
            year,
            comment: comment || undefined, // Корректно передаем undefined в соответствии с exactOptionalPropertyTypes
            pricelistIds: selectedPricelistIds,
          },
        },
      });
      // Сбрасываем форму и закрываем окно при успехе
      setComment('');
      setSelectedPricelistIds([]);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Произошла ошибка при генерации бюджета.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Создание годового бюджета
      </DialogTitle>

      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Поле выбора года */}
          <TextField
            label="Год планирования"
            type="number"
            size="small"
            value={year}
            onChange={(e) =>
              setYear(parseInt(e.target.value, 10) || currentYear)
            }
            disabled={submitting}
            fullWidth
          />

          {/* Поле комментария */}
          <TextField
            label="Примечание / Комментарий"
            multiline
            rows={2}
            size="small"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            fullWidth
          />

          <Divider />

          {/* Секция выбора прайсов */}
          <Box>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ mb: 1, fontWeight: 'bold' }}
            >
              Выберите прейскуранты ЦСМ для каскадного расчета:
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Alert severity="warning">
                Не удалось загрузить прейскуранты: {error.message}
              </Alert>
            ) : pricelists.length === 0 ? (
              <Typography variant="body2" color="error" sx={{ my: 1 }}>
                В базе данных нет загруженных прейскурантов. Сначала загрузите
                Excel-файлы прайсов.
              </Typography>
            ) : (
              <FormGroup sx={{ maxHeight: 200, overflowY: 'auto', pl: 1 }}>
                {pricelists.map((list) => (
                  <FormControlLabel
                    key={list.id}
                    control={
                      <Checkbox
                        checked={selectedPricelistIds.includes(list.id)}
                        onChange={() => handleTogglePricelist(list.id)}
                        disabled={submitting}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'medium' }}
                        >
                          {list.title} ({list.year} г.)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          Организация: {list.verificationOrganization.name} |{' '}
                          {list.isRegulated ? 'Регулируемый' : 'Договорной'}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1, alignItems: 'flex-start' }}
                  />
                ))}
              </FormGroup>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={submitting || pricelists.length === 0}
        >
          {submitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Запустить расчет бюджета'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
