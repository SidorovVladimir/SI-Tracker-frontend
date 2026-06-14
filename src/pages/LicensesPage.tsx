import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export const LicensesPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Раскрытие информации об открытом исходном коде
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          В системе учета средств измерений «SI-Tracker» используются компоненты
          сторонних разработчиков. Ниже представлены реестры лицензий для
          клиентской и серверной частей приложения.
        </Typography>

        {/* Блок скачивания полных реестров (MIT/BSD/etc) */}
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
          📋 Полные реестры используемого ПО:
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Button
            variant="outlined"
            fullWidth
            startIcon={<DownloadIcon />}
            href="/licenses-frontend.txt"
            target="_blank"
            sx={{ textTransform: 'none' }}
          >
            Реестр лицензий интерфейса (Frontend)
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<DownloadIcon />}
            href="/licenses-backend.txt"
            target="_blank"
            sx={{ textTransform: 'none' }}
          >
            Реестр лицензий сервера (Backend)
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Уведомление для SheetJS (Критическое требование Apache 2.0) */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="primary.main"
            sx={{ mb: 0.5 }}
          >
            Интеграция SheetJS Community Edition
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            Официальный сайт компонента:{' '}
            <a href="https://sheetjs.com" target="_blank" rel="noreferrer">
              https://sheetjs.com
            </a>
          </Typography>

          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              border: '1px solid',
              borderColor: 'grey.300',
              color: 'text.primary',
            }}
          >
            {`SheetJS Community Edition -- https://sheetjs.com

Copyright (C) 2012-present   SheetJS LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://apache.org

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
