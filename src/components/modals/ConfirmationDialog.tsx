// src/modules/budget/components/modals/ConfirmationDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  isDanger = false,
  loading = false,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pt: 2.5,
        }}
      >
        {isDanger && <WarningAmberIcon color="error" />}
        {title}
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <DialogContentText sx={{ fontSize: '0.95rem', color: 'text.primary' }}>
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          color="inherit"
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          color={isDanger ? 'error' : 'primary'}
          sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: 100 }}
        >
          {loading ? 'Секунду...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
