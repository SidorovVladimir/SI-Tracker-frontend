import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import DevicesIcon from '@mui/icons-material/Devices';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatIcon from '@mui/icons-material/Chat';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '../hooks/useAuth';

const sections = [
  {
    id: 'overview',
    icon: <InfoIcon />,
    title: 'О системе',
    content: (
      <>
        <Typography variant="body1" paragraph>
          <strong>SI-Tracker (Эталон-Трекер)</strong> — это система учёта
          средств измерений (СИ), предназначенная для метрологических служб
          предприятий. Система позволяет вести реестр средств измерений,
          планировать и отслеживать поверки, управлять справочниками,
          анализировать загрузку и затраты.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Версия: 0.0.1 | Лицензия: MIT
        </Typography>
      </>
    ),
  },
  {
    id: 'devices',
    icon: <DevicesIcon />,
    title: 'Работа с устройствами (СИ)',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Главная страница (<Chip label="/" size="small" />) отображает таблицу
          всех зарегистрированных средств измерений. Доступны следующие
          действия:
        </Typography>
        <ul>
          <li>
            <strong>Поиск и фильтрация</strong> — по названию, зав. номеру,
            статусу, производственному участку, типу оборудования и другим
            параметрам.
          </li>
          <li>
            <strong>Создание СИ</strong> — нажмите кнопку «Добавить СИ»,
            заполните форму. Обязательные поля: название, заводской номер,
            производственный участок, тип оборудования, статус.
          </li>
          <li>
            <strong>Редактирование</strong> — двойной клик по строке или кнопка
            в панели управления открывает боковую панель с подробной
            информацией.
          </li>
          <li>
            <strong>Удаление</strong> — доступно суперадминистратору через
            панель управления или страницу редактирования.
          </li>
          <li>
            <strong>QR-код</strong> — для каждого СИ можно распечатать QR-код
            через кнопку «QR-коды» на панели инструментов.
          </li>
          <li>
            <strong>Мобильная карточка</strong> — для быстрого просмотра на
            телефоне используйте путь{' '}
            <Chip label="/m/device/:id" size="small" />.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'planning',
    icon: <CalendarMonthIcon />,
    title: 'Планировщик поверок',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Раздел доступен администраторам и суперадминистраторам. Состоит из
          двух вкладок:
        </Typography>
        <Typography variant="subtitle2">📅 Календарь планирования</Typography>
        <Typography variant="body2" paragraph>
          Отображает календарь на выбранный год с цветовой индикацией
          загруженности каждого месяца. Позволяет распределять СИ по месяцам для
          поверки. Используйте перетаскивание для перемещения устройств между
          месяцами.
        </Typography>
        <Typography variant="subtitle2">📦 Журнал партий</Typography>
        <Typography variant="body2" paragraph>
          Отслеживание партий СИ, отправленных на поверку, с указанием даты
          отправки, ожидаемой даты возврата, организации поверителя и статуса.
        </Typography>
        <Alert severity="info" sx={{ mt: 1 }}>
          При планировании учитывается «Lead Time» — время выполнения поверки,
          заданное глобально в настройках системы (по умолчанию 30 дней).
        </Alert>
      </>
    ),
  },
  {
    id: 'budget',
    icon: <AccountBalanceWalletIcon />,
    title: 'Планирование бюджета',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Раздел позволяет планировать затраты на поверки СИ по годам. Доступны:
        </Typography>
        <ul>
          <li>Автоматический расчёт стоимости поверки по типам СИ</li>
          <li>Ручная корректировка бюджета по каждому устройству</li>
          <li>Сводная таблица с итогами по производственным участкам</li>
          <li>Итоговая стоимость по всем СИ на выбранный период</li>
        </ul>
      </>
    ),
  },
  {
    id: 'analytics',
    icon: <BarChartIcon />,
    title: 'Аналитика и отчёты',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Включает два дашборда:
        </Typography>
        <Typography variant="subtitle2">
          📊 Аналитика и бюджет затрат
        </Typography>
        <Typography variant="body2" paragraph>
          Графики и диаграммы по расходам на поверку, распределению по типам СИ
          и производственным участкам. Позволяет отслеживать динамику затрат по
          годам.
        </Typography>
        <Typography variant="subtitle2">📋 Объёмы СИ и мониторинг</Typography>
        <Typography variant="body2" paragraph>
          Общая статистика по парку СИ: количество активных/просроченных
          устройств, распределение по типам, статусам и производственным
          участкам. Отображает сводку по каждому участку: общее количество СИ,
          количество требующих поверки, просроченных и т.д.
        </Typography>
      </>
    ),
  },
  {
    id: 'chat',
    icon: <ChatIcon />,
    title: 'Чат',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Встроенный мессенджер для общения сотрудников. Функции:
        </Typography>
        <ul>
          <li>Общие и личные комнаты</li>
          <li>Текстовые сообщения</li>
          <li>Уведомления о новых сообщениях в реальном времени</li>
        </ul>
        <Typography variant="body2" color="text.secondary">
          Чат доступен всем авторизованным пользователям. Для начала общения
          выберите комнату в левой панели.
        </Typography>
      </>
    ),
  },
  {
    id: 'admin',
    icon: <AdminPanelSettingsIcon />,
    title: 'Админ-панель',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Панель управления справочниками и пользователями. Раздел состоит из
          бокового меню и области контента. Доступные справочники:
        </Typography>
        <ul>
          <li>
            <strong>Пользователи</strong> — управление учётными записями
          </li>
          <li>
            <strong>Города</strong> — список городов
          </li>
          <li>
            <strong>Компании</strong> — организации
          </li>
          <li>
            <strong>Производственные участки</strong> — привязка к компаниям
          </li>
          <li>
            <strong>Типы оборудования</strong> — категории СИ
          </li>
          <li>
            <strong>Виды измерения</strong> — типы измерений
          </li>
          <li>
            <strong>Виды метрологического контроля</strong>
          </li>
          <li>
            <strong>Сферы применения</strong>
          </li>
          <li>
            <strong>Состояния приборов</strong> — статусы СИ
          </li>
          <li>
            <strong>Первичные эталоны</strong>
          </li>
          <li>
            <strong>Организации поверители</strong>
          </li>
          <li>
            <strong>Логи аудита</strong> — журнал действий пользователей
          </li>
        </ul>
        <Alert severity="warning" sx={{ mt: 1 }}>
          Для суперадминистратора доступны дополнительные функции: Импорт данных
          Excel и SQL Консоль для прямых запросов к базе данных.
        </Alert>
      </>
    ),
  },
  {
    id: 'profile',
    icon: <InfoIcon />,
    title: 'Профиль пользователя',
    content: (
      <>
        <Typography variant="body1" paragraph>
          В профиле отображается информация о текущем пользователе: имя, email,
          роль. Также доступен выход из системы.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Для изменения данных обращайтесь к администратору системы.
        </Typography>
      </>
    ),
  },
];

export default function HelpPage() {
  const { user } = useAuth();

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
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <InfoIcon color="primary" fontSize="large" />
          <Typography variant="h5" fontWeight="bold">
            Справка по системе
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Добро пожаловать в систему учёта средств измерений «Эталон-Трекер».
          Ниже приведено описание основных разделов и функций приложения.
          {user && (
            <>
              {' '}
              Вы вошли как{' '}
              <strong>
                {user.firstName} {user.lastName}
              </strong>{' '}
              (роль:{' '}
              <Chip
                label={user.role}
                size="small"
                color="primary"
                variant="outlined"
              />
              ).
            </>
          )}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {sections.map((section) => (
          <Accordion
            key={section.id}
            disableGutters
            sx={{ '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ color: 'primary.main', display: 'flex' }}>
                  {section.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {section.title}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pl: 5, pr: 2, pb: 3 }}>
              {section.content}
            </AccordionDetails>
          </Accordion>
        ))}

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary">
          Если у вас возникли вопросы или предложения, обратитесь к
          администратору системы.
          <br />
          <strong>SI-Tracker</strong> — Open Source проект.{' '}
          <a
            href="https://github.com/SidorovVladimir/SI-Tracker-frontend"
            target="_blank"
            rel="noreferrer"
          >
            Репозиторий на GitHub
          </a>
        </Typography>
      </Paper>
    </Container>
  );
}
