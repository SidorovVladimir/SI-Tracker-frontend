import React, { useState } from 'react';
import {
  TextField,
  Box,
  Typography,
  Popover,
  Button,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface InlinePriceEditProps {
  itemId: string;
  initialPrice: number;
  disabled: boolean;
  onSave: (price: number) => Promise<void>;
}

export const InlinePriceEdit: React.FC<InlinePriceEditProps> = ({
  initialPrice,
  disabled,
  onSave,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [price, setPrice] = useState<string>(initialPrice.toString());
  const [loading, setLoading] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setPrice(initialPrice.toString()); // Синхронизируем перед открытием
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    if (loading) return;
    setAnchorEl(null);
  };

  const handleSave = async () => {
    const parsedPrice = parseFloat(price) || 0;
    setLoading(true);
    try {
      await onSave(parsedPrice);
      setAnchorEl(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep = (amount: number) => {
    const current = parseFloat(price) || 0;
    const next = Math.max(0, current + amount);
    setPrice(next.toString());
  };

  const isOpen = Boolean(anchorEl);

  // Форматирование для красивого вывода
  const formattedPrice =
    initialPrice > 0
      ? initialPrice.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        })
      : '0.00 ₽';

  if (disabled) {
    return (
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: 'text.secondary',
          // Добавляем легкий визуальный маркер замороженной цены
          opacity: 0.8,
          px: 1,
          py: 0.5,
        }}
      >
        {formattedPrice}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {/* Кнопка-ссылка для открытия редактора */}
      <Button
        onClick={handleClick}
        size="small"
        color="inherit"
        variant="text"
        endIcon={<EditIcon sx={{ opacity: 0.4, width: 14, height: 14 }} />}
        sx={{
          textTransform: 'none',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          px: 1,
          py: 0.5,
          borderRadius: 1.5,
          '&:hover': {
            bgcolor: 'action.hover',
            '& .MuiButton-endIcon sx': { opacity: 1 },
          },
        }}
      >
        {formattedPrice}
      </Button>

      {/* Контекстное мини-окно редактирования */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              width: 240,
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}
        >
          РЕДАКТИРОВАНИЕ СТОИМОСТИ
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Инпут ввода цены */}
          <TextField
            size="small"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            placeholder="0.00"
            slotProps={{
              htmlInput: {
                style: { fontFamily: 'monospace', fontWeight: 'bold' },
              },
              // ✅ Исправление: передаем endAdornment в правильный слот 'input'
              input: {
                endAdornment: (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    ₽
                  </Typography>
                ),
              },
            }}
          />

          {/* Панель быстрого шага цен (Идеально для мобильных) */}
          <ButtonGroup
            size="small"
            fullWidth
            disabled={loading}
            variant="outlined"
            color="inherit"
            sx={{ opacity: 0.8 }}
          >
            <Button
              onClick={() => handleStep(-500)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              -500
            </Button>
            <Button
              onClick={() => handleStep(-100)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              -100
            </Button>
            <Button
              onClick={() => handleStep(100)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              +100
            </Button>
            <Button
              onClick={() => handleStep(500)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              +500
            </Button>
          </ButtonGroup>

          {/* Нижние кнопки подтверждения / отмены */}
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              fullWidth
              onClick={handleClose}
              disabled={loading}
              startIcon={<CloseIcon />}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              fullWidth
              onClick={handleSave}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <CheckIcon />
                )
              }
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              ОК
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};
