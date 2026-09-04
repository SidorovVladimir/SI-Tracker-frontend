import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CalculateIcon from '@mui/icons-material/Calculate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpIcon from '@mui/icons-material/Help';
import MenuIcon from '@mui/icons-material/Menu';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

const sections: GuideSection[] = [
  {
    id: 'login',
    icon: <LoginIcon />,
    title: 'Вход в систему',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Чтобы войти в систему:
        </Typography>
        <ol>
          <li>Откройте приложение в браузере.</li>
          <li>
            Нажмите <strong>«Войти»</strong> на странице входа.
          </li>
          <li>
            Введите свой <strong>логин</strong> и <strong>пароль</strong>.
          </li>
          <li>
            Нажмите <strong>«Войти»</strong>.
          </li>
        </ol>
        <Typography variant="body1" paragraph>
          После входа вы попадёте на <strong>главную страницу</strong> — реестр
          средств измерений.
        </Typography>
        <Alert severity="info" sx={{ mt: 1 }}>
          💡 <strong>Забыли пароль?</strong> Обратитесь к администратору системы
          — он сможет сбросить или изменить ваш пароль.
        </Alert>
      </>
    ),
  },
  {
    id: 'home',
    icon: <HomeIcon />,
    title: 'Главная страница — Реестр средств измерений',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Главная страница — это <strong>таблица всех средств измерений</strong>{' '}
          вашего предприятия. Здесь вы видите весь парк приборов и можете быстро
          найти нужный.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что показывает таблица
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Колонка</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Что означает</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Город', 'Город, где находится прибор'],
                [
                  'Организация',
                  'Юридическое лицо, которому принадлежит прибор',
                ],
                ['Подразделение', 'Производственный участок / цех'],
                ['Наименование', 'Название прибора (например, «Манометр»)'],
                ['Тип СИ', 'Модель / модификация прибора'],
                [
                  'Заводской номер',
                  'Серийный номер, присвоенный заводом-изготовителем',
                ],
                ['Инвентарный номер', 'Внутренний номер учёта на предприятии'],
                ['Дата контроля', 'Дата последней поверки / калибровки'],
                [
                  'Дата следующего контроля',
                  'Когда нужно поверить прибор в следующий раз',
                ],
                [
                  'Вид контроля',
                  'Тип метрологического контроля (поверка, калибровка, осмотр и т.д.)',
                ],
                ['Последний осмотр', 'Дата последней внутренней инспекции'],
                [
                  'Следующий плановый осмотр',
                  'Когда нужно провести следующий осмотр',
                ],
                [
                  'Состояние',
                  'Текущий статус прибора (исправен, неисправен, забракован и т.д.)',
                ],
                ['Госреестр', 'Номер ГРСИ (если прибор внесён в госреестр)'],
                [
                  'Свидетельство',
                  'Номер последнего свидетельства/извещения о поверке/калибровки',
                ],
                ['Дата производства', 'Дата выпуска прибора'],
                ['Изготовитель', 'Завод-изготовитель'],
              ].map(([col, desc]) => (
                <TableRow key={col}>
                  <TableCell sx={{ fontWeight: 500 }}>{col}</TableCell>
                  <TableCell>{desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Фильтры
        </Typography>
        <Typography variant="body2" paragraph>
          Над таблицей есть панель фильтров. Вы можете отфильтровать приборы по:
        </Typography>
        <ul>
          <li>
            <strong>Городу</strong> — выберите город из списка
          </li>
          <li>
            <strong>Организации</strong> — выберите юридическое лицо
          </li>
          <li>
            <strong>Подразделению</strong> — выберите производственный участок
          </li>
          <li>
            <strong>Наименованию</strong> — начните вводить название прибора
          </li>
          <li>
            <strong>Заводскому номеру</strong> — введите номер
          </li>
          <li>
            <strong>Виду контроля</strong> — выберите тип метрологического
            контроля
          </li>
          <li>
            <strong>Состоянию</strong> — выберите статус прибора
          </li>
          <li>
            <strong>Отображению</strong> — выберите отображение прибора
            (активные, архивные, все приборы)
          </li>
          <li>
            <strong>Дате следующего контроля </strong> — выберите отображение
            прибора (с какой даты, по какую дату)
          </li>
        </ul>
        <Alert severity="info" sx={{ mt: 1 }}>
          💡 <strong>Совет:</strong> фильтры по городу, организации и
          подразделению работают <strong>каскадно</strong> — если вы выбрали
          город, в списке организаций останутся только те, что работают в этом
          городе.
        </Alert>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
          Как открыть карточку прибора
        </Typography>
        <Typography variant="body2">
          Просто <strong>кликните по строке</strong> прибора в таблице — справа
          откроется панель с полной карточкой прибора.
        </Typography>
      </>
    ),
  },
  {
    id: 'device-card',
    icon: <DescriptionIcon />,
    title: 'Карточка прибора',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Карточка прибора — это{' '}
          <strong>полная информация об одном средстве измерения</strong>. Она
          открывается при клике на строку в таблице.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что вы увидите в карточке
        </Typography>
        <ul>
          <li>
            <strong>Основные данные</strong>: наименование, тип, заводской
            номер, инвентарный номер, номер ГРСИ
          </li>
          <li>
            <strong>Технические характеристики</strong>: диапазон измерений,
            точность, изготовитель, дата выпуска
          </li>
          <li>
            <strong>Место эксплуатации</strong>: город → организация →
            производственный участок
          </li>
          <li>
            <strong>Метрологические данные</strong>: МПИ (межповерочный
            интервал), даты поверок, вид контроля
          </li>
          <li>
            <strong>История поверок</strong>: все записи о поверках с датами,
            результатами и номерами свидетельств
          </li>
          <li>
            <strong>Документы</strong>: прикреплённые файлы (руководства по
            эксплуатации, паспорта, свидетельства)
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Кнопки в карточке
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Кнопка</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Что делает</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['✏️ Редактировать', 'Открывает форму редактирования прибора'],
                [
                  '📋 Дублировать',
                  'Создаёт копию прибора (удобно для однотипных приборов)',
                ],
                ['✖ Закрыть', 'Закрывает карточку и возвращает к таблице'],
                [
                  '📎 Загрузить документ',
                  'Прикрепляет файл (PDF, изображение, DOC/DOCX)',
                ],
                [
                  '🔗 Ссылка на Аршин в истории контроля',
                  'Открывает страницу прибора в ФГИС «Аршин» (если есть)',
                ],
              ].map(([btn, desc]) => (
                <TableRow key={btn}>
                  <TableCell sx={{ fontWeight: 500 }}>{btn}</TableCell>
                  <TableCell>{desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Загрузка документов
        </Typography>
        <Typography variant="body2" paragraph>
          В карточке прибора есть два типа документов:
        </Typography>
        <ul>
          <li>
            <strong>Руководство по эксплуатации (РЭ)</strong> — инструкция по
            использованию прибора. Если в системе есть СИ со схожими
            характеристиками (ГРСИ, модель) то руководство автоматически
            распределяется на них.
          </li>
          <li>
            <strong>Документы / Фото </strong> — документы о поверке, фото
            косплектаций и другие
          </li>
        </ul>
        <Typography variant="body2" paragraph>
          Чтобы загрузить документ:
        </Typography>
        <ol>
          <li>
            Нажмите кнопку <strong>«Загрузить»</strong> рядом с нужным типом
            документа
          </li>
          <li>Выберите файл на компьютере (максимум 20 МБ)</li>
          <li>Документ автоматически прикрепится к карточке прибора</li>
        </ol>
      </>
    ),
  },
  {
    id: 'create-device',
    icon: <AddCircleIcon />,
    title: 'Как завести новый прибор',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Чтобы добавить новый прибор в систему:
        </Typography>
        <ol>
          <li>
            На главной странице нажмите кнопку <strong>«Добавить»</strong>{' '}
            (значок ➕)
          </li>
          <li>Справа откроется форма создания прибора</li>
          <li>Заполните поля (обязательные отмечены звёздочкой)</li>
        </ol>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Обязательные поля
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Поле</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Зачем нужно</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'Название',
                  'Наименование прибора (например, «Манометр МП-100»)',
                ],
                ['Тип', 'Модель / модификация прибора'],
                ['Заводской номер', 'Уникальный серийный номер прибора'],
                ['Состояние', 'Текущий статус (исправен, неисправен и т.д.)'],
                ['Город', 'Где находится прибор'],
                ['Организация', 'Юридическое лицо'],
                ['Подразделение', 'Производственный участок'],
                ['Тип оборудования', 'Категория (СИ, ИО, ВО)'],
                [
                  'Сферы госрегулирования',
                  'Сферы, в которых применяется прибор',
                ],
              ].map(([field, desc]) => (
                <TableRow key={field}>
                  <TableCell sx={{ fontWeight: 500 }}>{field}</TableCell>
                  <TableCell>{desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Важные поля для автоматического расчёта:</strong> эти поля
          участвуют в автоматическом расчёте графиков поверок и кэша
          метрологического контроля.
        </Alert>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Поле</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Зачем нужно</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'Номер ГРСИ',
                  'Номер в госреестре (например, 53950-13). Нужен для интеграции с ФГИС «Аршин» и сопоставления с прайс-листами',
                ],
                [
                  'МПИ (межповерочный интервал)',
                  'Указывается в месяцах. Например, если прибор нужно поверять раз в 2 года — укажите 24. Без этого поля система не сможет автоматически рассчитать дату следующей поверки',
                ],
                [
                  'Код СИ из прайса ЦСМ',
                  'Код прибора в прайс-листе поверительной организации. Нужен для автоматического сопоставления цен в бюджетировании',
                ],
              ].map(([field, desc]) => (
                <TableRow key={field}>
                  <TableCell sx={{ fontWeight: 500 }}>{field}</TableCell>
                  <TableCell>{desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Добавление истории поверок
        </Typography>
        <Typography variant="body2" paragraph>
          В нижней части формы есть блок{' '}
          <strong>«Данные метрологического контроля»</strong>. Здесь вы можете:
        </Typography>
        <ol>
          <li>
            Нажать <strong>«Добавить»</strong> — появится пустая запись о
            поверке
          </li>
          <li>
            Заполнить: дату поверки, дату окончания, результат (годен / не
            годен), номер свидетельства, организацию, тип контроля
          </li>
          <li>
            Или нажать <strong>«Загрузить из Аршина»</strong> — система
            автоматически найдёт последние поверки прибора в ФГИС «Аршин» по
            заводскому номеру и номеру ГРСИ
          </li>
        </ol>
        <Alert severity="info" sx={{ mt: 1 }}>
          💡 <strong>Совет:</strong> если прибор уже поверялся раньше —
          обязательно добавьте <strong>последнюю поверку</strong> с датой и
          типом контроля. Это позволит системе правильно рассчитать, когда
          прибор нужно поверить в следующий раз.
        </Alert>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
          После создания
        </Typography>
        <Typography variant="body2" paragraph>
          После нажатия <strong>«Сохранить»</strong> прибор появится в реестре.
          Система автоматически:
        </Typography>
        <ul>
          <li>
            Рассчитает <strong>кэш метрологического контроля</strong> —
            определит, какой вид контроля подходит прибору (поверка / калибровка
            / аттестация / осмотр) на основе типа оборудования, наличия номера
            ГРСИ и сфер государственного регулирования
          </li>
          <li>
            Рассчитает <strong>дату следующего контроля</strong> (на основе
            последней поверки/калибровки или даты выпуска/ввода и МПИ)
          </li>
          <li>
            Добавит прибор в <strong>пул планирования</strong> на нужный месяц
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'metrology-cache',
    icon: <CalculateIcon />,
    title: 'Кэш метрологического контроля — что это и зачем',
    content: (
      <>
        <Typography variant="body1" paragraph>
          <strong>Кэш метрологического контроля</strong> — это автоматически
          рассчитанное поле, которое показывает{' '}
          <strong>какой вид контроля нужен прибору</strong> (поверка,
          калибровка, аттестация или осмотр).
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как он рассчитывается
        </Typography>
        <Typography variant="body2" paragraph>
          Кэш рассчитывается{' '}
          <strong>автоматически на основе характеристик прибора</strong>, а не
          по последним поверкам. Система анализирует:
        </Typography>
        <ul>
          <li>
            <strong>Тип оборудования</strong> (СИ, СК, ИО, индикатор, ВО)
          </li>
          <li>
            <strong>Наличие номера ГРСИ</strong>
          </li>
          <li>
            <strong>Сферы государственного регулирования</strong> (есть ли сфера
            «вне сферы государственного регулирования»)
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Логика расчёта
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Тип оборудования
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Условия</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Вид контроля</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'СИ (средство измерений)',
                  'Есть номер ГРСИ и нет сферы «не ГР»',
                  '🔵 Поверка',
                ],
                [
                  'СК (средство контроля)',
                  'Есть номер ГРСИ и нет сферы «не ГР»',
                  '🔵 Поверка',
                ],
                [
                  'СИ / СК',
                  'Нет номера ГРСИ или есть сфера «не ГР»',
                  '🟣 Калибровка',
                ],
                ['ИО (испытательное оборудование)', 'Всегда', '🔷 Аттестация'],
                [
                  'Индикатор / ВО (вспомогательное оборудование)',
                  'Всегда',
                  '⚪ Осмотр',
                ],
              ].map(([type, cond, control]) => (
                <TableRow key={type}>
                  <TableCell sx={{ fontWeight: 500 }}>{type}</TableCell>
                  <TableCell>{cond}</TableCell>
                  <TableCell>{control}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Зачем это нужно
        </Typography>
        <ol>
          <li>
            <strong>Мгновенно отображать</strong> нужный вид контроля в таблице
            реестра — без медленных запросов к базе
          </li>
          <li>
            <strong>Фильтровать приборы</strong> по виду контроля
          </li>
          <li>
            <strong>Правильно формировать пул планирования</strong> — приборы с
            типом «поверка» и «калибровка» попадают в планировщик поверок, с
            типом «осмотр» (индикаторы, ВО) — в журнал осмотров
          </li>
        </ol>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Когда кэш обновляется
        </Typography>
        <Typography variant="body2" paragraph>
          Кэш автоматически пересчитывается при:
        </Typography>
        <ul>
          <li>Создании или редактировании прибора</li>
          <li>Импорте данных из Excel</li>
        </ul>
        <Alert severity="warning" sx={{ mt: 1 }}>
          ⚠️ <strong>Важно:</strong> вид контроля зависит только от{' '}
          <strong>характеристик прибора</strong> (тип, ГРСИ, сферы). Поэтому при
          заведении прибора обязательно указывайте{' '}
          <strong>тип оборудования</strong> и <strong>номер ГРСИ</strong> (если
          прибор внесён в госреестр) — от этого зависит, попадёт ли прибор в пул
          поверок или в пул калибровки.
        </Alert>
      </>
    ),
  },
  {
    id: 'planning',
    icon: <CalendarMonthIcon />,
    title: 'Планирование поверок',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Это <strong>ключевой модуль</strong> системы. Здесь вы видите, какие
          приборы нужно поверить в каждом месяце, и можете сформировать партию
          для отправки в лабораторию.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как открыть
        </Typography>
        <Typography variant="body2" paragraph>
          Нажмите кнопку <strong>«Управление»</strong> в шапке → выберите{' '}
          <strong>«📅 Планировщик поверок»</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что вы увидите
        </Typography>
        <Typography variant="body2" paragraph>
          Страница состоит из двух вкладок:
        </Typography>
        <ul>
          <li>
            <strong>«Календарь планирования»</strong> — основная рабочая область
          </li>
          <li>
            <strong>«Журнал партий»</strong> — история отправленных партий
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Календарь планирования
        </Typography>
        <Typography variant="body2" paragraph>
          Слева — <strong>календарь на год</strong>. Каждый месяц показывает два
          числа:
        </Typography>
        <ul>
          <li>
            ⚙️ <strong>Автоматический пул</strong> — сколько приборов нужно
            поверить в этом месяце (рассчитано системой)
          </li>
          <li>
            👤 <strong>Закреплено вручную и распределены в партии</strong> —
            сколько приборов вы назначили на этот месяц вручную и распредили в
            партию на отправку
          </li>
        </ul>
        <Typography variant="body2" paragraph>
          <strong>Кликните на месяц</strong> — справа загрузится{' '}
          <strong>пул приборов</strong> для этого месяца.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Пул приборов
        </Typography>
        <Typography variant="body2" paragraph>
          В пуле вы видите все приборы, у которых{' '}
          <strong>срок поверки истекает</strong> в выбранном месяце. Для каждого
          прибора показаны:
        </Typography>
        <ul>
          <li>Наименование, модель, заводской номер</li>
          <li>Дата, до которой нужно поверить</li>
          <li>Тип контроля</li>
          <li>
            Расчет-Показывает какой статус у прибора (В партии, Долг, Авто)
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Фильтрация пула
        </Typography>
        <Typography variant="body2" paragraph>
          Над таблицей пула есть фильтр по <strong>типу контроля</strong>:
        </Typography>
        <ul>
          <li>
            <strong>Все приборы</strong> — сводный список
          </li>
          <li>
            <strong>Аттестация</strong> — только оборудования, требующие
            атестацию
          </li>
          <li>
            <strong>Поверка</strong> — только приборы, требующие поверки
          </li>
          <li>
            <strong>Калибровка</strong> — только приборы, требующие калибровки
          </li>
          <li>
            <strong>Другие / Без контроля</strong> — остальные
          </li>
          <li>
            <strong>В резерве (На паузе)</strong> — приборы не учавствующие в
            автоматическом планировании.
          </li>
        </ul>

        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Как сформировать партию на поверку:</strong>
          <Box component="ol" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
            <li>
              <strong>Выберите месяц</strong> в календаре
            </li>
            <li>
              <strong>Отметьте галочками</strong> приборы, которые нужно
              отправить на поверку
            </li>
            <li>
              Выберите <strong>организацию-поверителя</strong> (лабораторию)
            </li>
            <li>
              Укажите <strong>дату отправки</strong>
            </li>
            <li>
              Выберите вариант: <strong>«Создать новую партию»</strong> (номер
              партии сформируется автоматически ) или{' '}
              <strong>«Добавить в существующий черновик»</strong>
            </li>
            <li>
              Нажмите <strong>«Создать и добавить»</strong>
            </li>
          </Box>
        </Alert>

        <Typography variant="body2" paragraph sx={{ mt: 2 }}>
          После этого приборы:
        </Typography>
        <ul>
          <li>
            Переходят в статус <strong>«На поверке (в цсм)»</strong>
          </li>
          <li>
            Появляются в <strong>журнале партий</strong>
          </li>
          <li>
            Становятся доступны для{' '}
            <strong>синхронизации с ФГИС «Аршин»</strong>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'batches',
    icon: <LocalShippingIcon />,
    title: 'Журнал партий',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Журнал партий — это <strong>история всех отправленных партий</strong>{' '}
          на поверку.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как открыть
        </Typography>
        <Typography variant="body2" paragraph>
          В планировщике поверок переключитесь на вкладку{' '}
          <strong>«Журнал партий»</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что вы увидите
        </Typography>
        <Typography variant="body2" paragraph>
          Список партий с информацией:
        </Typography>
        <ul>
          <li>
            <strong>Номер партии</strong> и дата отправки
          </li>
          <li>
            <strong>Количество приборов</strong> в партии
          </li>
          <li>
            <strong>Статус</strong> (черновик, отправлено, частично возвращено,
            возвращено)
          </li>
          <li>
            <strong>Организация-поверитель</strong>
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Действия с партией
        </Typography>
        <ul>
          <li>
            <strong>Открыть партию</strong> — посмотреть список приборов в ней
          </li>
          <li>
            <strong>Синхронизировать с Аршином</strong> — прогнать все приборы
            партии через ФГИС «Аршин» и подтянуть результаты поверок
          </li>
          <li>
            <strong>Зафиксировать возврат</strong> — отметить, что приборы
            вернулись с поверки
          </li>
        </ul>
        <Alert severity="info" sx={{ mt: 1 }}>
          💡 <strong>Совет:</strong> после возврата приборов из лаборатории
          обязательно <strong>зафиксируйте результаты</strong> — система обновит
          даты поверок и автоматически пересчитает графики.
        </Alert>
      </>
    ),
  },
  {
    id: 'inspections',
    icon: <BuildIcon />,
    title: 'Инспекции (обходы)',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Инспекции — это <strong>внутренние плановые проверки</strong>{' '}
          состояния приборов на производственных участках. В отличие от поверок,
          инспекции проводит ваш собственный персонал, без отправки в
          лабораторию.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как открыть
        </Typography>
        <Typography variant="body2" paragraph>
          Нажмите кнопку <strong>«Управление»</strong> в шапке → выберите{' '}
          <strong>«🛠️ Журнал осмотров»</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что вы увидите
        </Typography>
        <Typography variant="body2" paragraph>
          Страница состоит из двух вкладок:
        </Typography>
        <ul>
          <li>
            <strong>«📋 Текущие задачи на осмотр»</strong> — приборы, которые
            нужно осмотреть
          </li>
          <li>
            <strong>«📦 Архив актов ТО»</strong> — история проведённых осмотров
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Текущие задачи на осмотр
        </Typography>
        <Typography variant="body2" paragraph>
          Здесь вы видите <strong>пул приборов</strong>, подлежащих осмотру в
          выбранном месяце. Система рассчитывает его автоматически на основе:
        </Typography>
        <ul>
          <li>Даты последнего осмотра</li>
          <li>Интервала между осмотрами</li>
        </ul>

        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Как провести осмотр:</strong>
          <Box component="ol" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
            <li>
              Выберите <strong>месяц</strong> в календаре
            </li>
            <li>Отметьте галочками приборы, которые вы осмотрели</li>
            <li>
              Для каждого прибора укажите: <strong>результат</strong> (годен /
              брак) и <strong>новый интервал</strong> (в месяцах)
            </li>
            <li>
              Нажмите <strong>«Зафиксировать осмотр»</strong>
            </li>
          </Box>
        </Alert>

        <Typography variant="body2" paragraph sx={{ mt: 2 }}>
          После этого:
        </Typography>
        <ul>
          <li>
            У приборов обновится <strong>дата последнего осмотра</strong>
          </li>
          <li>
            Система рассчитает <strong>дату следующего осмотра</strong>
          </li>
          <li>
            Запись появится в <strong>архиве актов ТО</strong>
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Архив актов ТО
        </Typography>
        <Typography variant="body2" paragraph>
          Здесь хранится <strong>полная история</strong> проведённых осмотров.
          Вы можете посмотреть:
        </Typography>
        <ul>
          <li>Когда был проведён осмотр</li>
          <li>Кто его провёл</li>
          <li>Какие приборы были осмотрены</li>
          <li>Результаты осмотра по каждому прибору</li>
        </ul>
      </>
    ),
  },
  {
    id: 'budget',
    icon: <AccountBalanceWalletIcon />,
    title: 'Бюджетирование поверок',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Модуль бюджетирования помогает <strong>планировать затраты</strong> на
          поверку приборов на год вперёд.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как открыть
        </Typography>
        <Typography variant="body2" paragraph>
          Нажмите кнопку <strong>«Управление»</strong> в шапке → выберите{' '}
          <strong>«💰 Планирование бюджета поверок»</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Матрица затрат
        </Typography>
        <Typography variant="body2" paragraph>
          Это <strong>таблица</strong>, где по строкам — подразделения (или
          компании, или города), а по столбцам — месяцы года. В каждой ячейке —{' '}
          <strong>сумма затрат</strong> на поверку приборов в этом месяце.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Как пользоваться:</strong>
        </Typography>
        <ol>
          <li>
            Выберите <strong>год</strong> планирования
          </li>
          <li>
            Выберите <strong>группировку</strong>: по компаниям, городам или
            производственным участкам
          </li>
          <li>
            При необходимости отфильтруйте по конкретной компании / городу /
            участку
          </li>
        </ol>
        <Typography variant="body2" paragraph>
          Система автоматически рассчитает:
        </Typography>
        <ul>
          <li>Затраты по каждому месяцу</li>
          <li>Итоговую сумму по каждой строке</li>
          <li>
            <strong>Общий бюджет</strong> на год
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Бюджетные планы
        </Typography>
        <Typography variant="body2" paragraph>
          Более детальный инструмент — <strong>бюджетные планы</strong>. Здесь
          вы можете:
        </Typography>
        <ol>
          <li>Создать план на год</li>
          <li>
            Привязать <strong>прайс-листы</strong> поверительных организаций
          </li>
          <li>
            Система автоматически <strong>сопоставит</strong> каждый прибор с
            ценой из прайса (по номеру ГРСИ или коду ЦСМ)
          </li>
          <li>
            При необходимости <strong>вручную скорректировать</strong> цену по
            конкретному прибору
          </li>
          <li>Утвердить план</li>
        </ol>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Прайс-листы
        </Typography>
        <Typography variant="body2" paragraph>
          Чтобы загрузить прайс-лист поверительной организации:
        </Typography>
        <ol>
          <li>
            Перейдите в раздел <strong>«Прайс-листы»</strong>
          </li>
          <li>
            Нажмите <strong>«Загрузить прайс»</strong>
          </li>
          <li>Выберите организацию, укажите год</li>
          <li>Загрузите Excel-файл с прайсом</li>
          <li>Система обработает файл в фоновом режиме и покажет результат</li>
        </ol>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Тренды тарифов ЦСМ
        </Typography>
        <Typography variant="body2" paragraph>
          Здесь вы видите <strong>графики изменения стоимости</strong> поверки
          по годам для разных приборов. Это помогает понять, как растут цены и
          спланировать бюджет с запасом.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Карта рисков
        </Typography>
        <Typography variant="body2" paragraph>
          Визуальная карта, показывающая{' '}
          <strong>просроченные и истекающие поверки</strong>:
        </Typography>
        <ul>
          <li>
            🟢 <strong>Зелёный</strong> — всё в порядке
          </li>
          <li>
            🟡 <strong>Жёлтый</strong> — поверка истекает в течение 30 дней
          </li>
          <li>
            🔴 <strong>Красный</strong> — поверка просрочена
          </li>
        </ul>
        <Typography variant="body2">
          Карта построена по иерархии:{' '}
          <strong>город → компания → участок</strong>. Кликайте на элементы,
          чтобы увидеть детали.
        </Typography>
      </>
    ),
  },
  {
    id: 'analytics',
    icon: <BarChartIcon />,
    title: 'Аналитика',
    content: (
      <>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как открыть
        </Typography>
        <Typography variant="body2" paragraph>
          Нажмите кнопку <strong>«Управление»</strong> в шапке → выберите{' '}
          <strong>«📊 Аналитика и бюджет затрат»</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что вы увидите
        </Typography>
        <ul>
          <li>
            <strong>Годовой тренд затрат</strong> — график расходов на поверку
            по месяцам
          </li>
          <li>
            <strong>Распределение по городам</strong> — круговая диаграмма
            затрат по городам
          </li>
          <li>
            <strong>Распределение по типам контроля</strong> — сколько приборов
            какого типа контроля
          </li>
          <li>
            <strong>Фильтры по году и месяцу</strong> — можно посмотреть данные
            за конкретный период
          </li>
        </ul>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Объёмы СИ и мониторинг
        </Typography>
        <Typography variant="body2" paragraph>
          Отдельная страница <strong>«📋 Объемы СИ и мониторинг»</strong>{' '}
          показывает:
        </Typography>
        <ul>
          <li>Количество приборов по производственным участкам</li>
          <li>Статистику по типам оборудования</li>
          <li>Другие агрегированные показатели</li>
        </ul>
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
          Встроенный мессенджер для общения сотрудников.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как открыть
        </Typography>
        <Typography variant="body2" paragraph>
          Нажмите <strong>иконку чата</strong> (💬) в шапке приложения.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как пользоваться
        </Typography>
        <ol>
          <li>
            Выберите <strong>собеседника</strong> из списка пользователей
          </li>
          <li>Напишите сообщение в поле внизу</li>
          <li>
            Нажмите <strong>«Отправить»</strong>
          </li>
        </ol>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Возможности
        </Typography>
        <ul>
          <li>
            Видно, <strong>кто сейчас онлайн</strong> (зелёная точка)
          </li>
          <li>
            <strong>Счётчик непрочитанных</strong> сообщений на иконке чата
          </li>
          <li>
            Сообщения доставляются <strong>мгновенно</strong> через WebSocket
          </li>
        </ul>
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
          Админ-панель доступна пользователям с ролями{' '}
          <strong>администратор</strong> и <strong>суперадминистратор</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как открыть
        </Typography>
        <Typography variant="body2" paragraph>
          Нажмите на <strong>аватар</strong> в правом верхнем углу → выберите{' '}
          <strong>«Панель администратора»</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что можно делать
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Раздел</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Что можно делать
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'Пользователи',
                  'Создавать, редактировать, удалять пользователей',
                ],
                ['Города', 'Добавлять и редактировать города'],
                ['Компании', 'Добавлять и редактировать юридические лица'],
                [
                  'Производственные участки',
                  'Добавлять и редактировать участки',
                ],
                [
                  'Типы оборудования',
                  'Управлять справочником типов (СИ, ИО, ВО)',
                ],
                ['Виды измерений', 'Управлять справочником видов измерений'],
                [
                  'Виды метрологического контроля',
                  'Управлять справочником (поверка, калибровка, осмотр и т.д.)',
                ],
                [
                  'Сферы применения',
                  'Управлять справочником сфер госрегулирования',
                ],
                ['Состояния приборов', 'Управлять справочником статусов'],
                ['Первичные эталоны', 'Управлять справочником эталонов'],
                [
                  'Организации поверители',
                  'Управлять справочником лабораторий',
                ],
                ['Логи аудита', 'Просматривать историю действий пользователей'],
              ].map(([section, desc]) => (
                <TableRow key={section}>
                  <TableCell sx={{ fontWeight: 500 }}>{section}</TableCell>
                  <TableCell>{desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Для суперадминистратора</strong> дополнительно доступны:
        </Alert>
        <ul>
          <li>
            <strong>📥 Импорт данных Excel</strong> — массовый импорт приборов
            из Excel-файла
          </li>
          <li>
            <strong>💻 SQL Консоль</strong> — выполнение произвольных
            SQL-запросов к базе данных
          </li>
          <li>
            <strong>💾 Резервное копирование</strong> — скачивание дампа БД и
            документов
          </li>
          <li>
            <strong>♻️ Восстановление</strong> — восстановление БД из дампа
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'import',
    icon: <CloudUploadIcon />,
    title: 'Импорт данных из Excel',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Доступно только <strong>суперадминистраторам</strong>.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как импортировать приборы
        </Typography>
        <ol>
          <li>
            Нажмите <strong>«Управление»</strong> →{' '}
            <strong>«📥 Импорт данных Excel»</strong>
          </li>
          <li>
            <strong>Загрузите .xlsx файл</strong> со списком приборов
          </li>
          <li>
            Система <strong>автоматически сопоставит</strong> колонки Excel с
            полями системы
          </li>
          <li>
            Если какая-то колонка не распознана —{' '}
            <strong>выберите вручную</strong> из выпадающего списка
          </li>
          <li>
            Проверьте <strong>превью данных</strong>
          </li>
          <li>
            Нажмите <strong>«Запустить импорт»</strong>
          </li>
        </ol>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Какие поля можно импортировать
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Поле системы</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Обязательное</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Описание</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Наименование прибора', '✅', ''],
                ['Модель / Модификация', '✅', ''],
                ['Заводской / Серийный номер', '✅', ''],
                ['Номер ГРСИ', '❌', 'Для интеграции с Аршин'],
                ['Инвентарный номер', '❌', ''],
                ['Диапазон измерений', '❌', ''],
                ['Класс точности / Погрешность', '❌', ''],
                ['Производитель', '❌', ''],
                ['Межповерочный интервал (МПИ)', '❌', 'В месяцах'],
                ['Номенклатура 1С', '❌', ''],
                ['Город', '✅', ''],
                ['Организация (Юр. лицо)', '✅', ''],
                ['Производственный участок', '✅', ''],
                ['Текущий статус', '✅', 'Годен / Списан'],
                ['Тип оборудования', '❌', 'СИ / ИО / ВО'],
                ['Сферы госрегулирования', '❌', ''],
                ['Виды измерений', '❌', ''],
                ['Эталоны', '❌', ''],
              ].map(([field, required, desc]) => (
                <TableRow key={field}>
                  <TableCell sx={{ fontWeight: 500 }}>{field}</TableCell>
                  <TableCell>{required}</TableCell>
                  <TableCell>{desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 1 }}>
          💡 <strong>Совет:</strong> перед импортом убедитесь, что в системе уже
          есть справочники (города, организации, участки, статусы). Иначе импорт
          может не найти нужные значения.
        </Alert>
      </>
    ),
  },
  {
    id: 'faq',
    icon: <HelpIcon />,
    title: 'Часто задаваемые вопросы',
    content: (
      <>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Почему прибор не попадает в пул планирования?
        </Typography>
        <Typography variant="body2" paragraph>
          Проверьте:
        </Typography>
        <ol>
          <li>
            У прибора корректно заполнен <strong>тип оборудования</strong> (СИ /
            СК / ИО)
          </li>
          <li>
            Если прибор должен проходить <strong>поверку</strong> — у него
            заполнен <strong>номер ГРСИ</strong> и{' '}
            <strong>не привязана сфера «не ГР»</strong>
          </li>
          <li>
            Если прибор должен проходить <strong>калибровку</strong> — у него{' '}
            <strong>нет номера ГРСИ</strong> или есть сфера «не ГР»
          </li>
          <li>
            У прибора есть хотя бы одна <strong>запись о контроле</strong> (или
            дата выпуска/ввода) и заполнен <strong>МПИ</strong> — от этого
            считается дата следующего контроля
          </li>
        </ol>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Почему в таблице вид контроля — «калибровка», а нужна поверка?
        </Typography>
        <Typography variant="body2" paragraph>
          Вид контроля рассчитывается автоматически по характеристикам прибора:
        </Typography>
        <ul>
          <li>
            Если прибор <strong>СИ/СК</strong> и должен поверяться — убедитесь,
            что у него заполнен <strong>номер ГРСИ</strong> и{' '}
            <strong>сферы госрегулирования</strong> (без сферы «не ГР»)
          </li>
          <li>
            Если у прибора <strong>нет ГРСИ</strong> или стоит сфера «вне сферы
            государственного регулирования» — система считает, что нужна{' '}
            <strong>калибровка</strong>
          </li>
        </ul>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как изменить дату следующего контроля?
        </Typography>
        <Typography variant="body2" paragraph>
          Дата следующего контроля рассчитывается автоматически:{' '}
          <strong>дата последней поверки/калибровки + МПИ</strong> (если записи
          нет — от даты выпуска/ввода + МПИ). Чтобы изменить:
        </Typography>
        <ol>
          <li>Откройте карточку прибора</li>
          <li>
            Нажмите <strong>«Редактировать»</strong>
          </li>
          <li>
            Измените <strong>МПИ</strong> или добавьте/отредактируйте запись о
            последнем контроле с нужной датой
          </li>
        </ol>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как добавить прибор, который уже поверялся?
        </Typography>
        <Typography variant="body2" paragraph>
          При создании прибора в блоке{' '}
          <strong>«Данные метрологического контроля»</strong> нажмите{' '}
          <strong>«Загрузить из Аршина»</strong> — система найдёт последние
          поверки по номеру ГРСИ и заводскому номеру. Или добавьте запись
          вручную.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Что делать, если прибор списан?
        </Typography>
        <ol>
          <li>Откройте карточку прибора</li>
          <li>
            Нажмите <strong>«Редактировать»</strong>
          </li>
          <li>
            Измените <strong>состояние</strong> на «Списан»
          </li>
          <li>Прибор перестанет попадать в пулы планирования</li>
        </ol>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Как распечатать QR-код прибора?
        </Typography>
        <Typography variant="body2">
          В карточке прибора нажмите кнопку <strong>«QR-код»</strong> —
          откроется окно печати с QR-кодом, который можно наклеить на прибор.
        </Typography>
      </>
    ),
  },
  {
    id: 'cheatsheet',
    icon: <MenuBookOutlinedIcon />,
    title: 'Краткая шпаргалка',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Быстрая навигация по системе:
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Хочу сделать</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Куда идти</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Найти прибор', 'Главная страница → фильтры'],
                ['Завести новый прибор', 'Главная → кнопка «Добавить»'],
                ['Посмотреть карточку прибора', 'Клик по строке в таблице'],
                [
                  'Спланировать поверку',
                  '«Управление» → «Планировщик поверок»',
                ],
                [
                  'Сформировать партию',
                  'Планировщик → выбрать месяц → отметить приборы → «Сформировать партию»',
                ],
                [
                  'Посмотреть отправленные партии',
                  'Планировщик → вкладка «Журнал партий»',
                ],
                ['Провести осмотр', '«Управление» → «Журнал осмотров»'],
                [
                  'Спланировать бюджет',
                  '«Управление» → «Планирование бюджета поверок»',
                ],
                [
                  'Посмотреть аналитику',
                  '«Управление» → «Аналитика и бюджет затрат»',
                ],
                ['Написать коллеге', 'Иконка чата в шапке'],
                ['Управлять справочниками', 'Аватар → «Панель администратора»'],
                [
                  'Импортировать из Excel',
                  '«Управление» → «Импорт данных Excel» (суперадмин)',
                ],
              ].map(([action, where]) => (
                <TableRow key={action}>
                  <TableCell sx={{ fontWeight: 500 }}>{action}</TableCell>
                  <TableCell>{where}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    ),
  },
];

export default function UserGuidePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState<string | false>(sections[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAccordionChange =
    (id: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? id : false);
    };

  const scrollToSection = (id: string) => {
    setExpanded(id);
    setDrawerOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`guide-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const navContent = (
    <List dense sx={{ p: 0 }}>
      {sections.map((section) => (
        <ListItem key={section.id} disablePadding>
          <ListItemButton
            onClick={() => scrollToSection(section.id)}
            selected={expanded === section.id}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
              {section.icon}
            </ListItemIcon>
            <ListItemText
              primary={section.title}
              primaryTypographyProps={{
                fontSize: '0.8rem',
                fontWeight: expanded === section.id ? 700 : 500,
                lineHeight: 1.3,
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Заголовок */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}15 100%)`,
          borderColor: 'primary.light',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box
            sx={{
              width: { xs: 48, md: 64 },
              height: { xs: 48, md: 64 },
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MenuBookIcon sx={{ fontSize: { xs: 28, md: 36 } }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.3rem', md: '2rem' } }}
            >
              📖 Руководство пользователя
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              "Эталон-Трекер" — система учёта средств измерений, планирования
              поверок, осмотров и бюджетирования. Выберите раздел, чтобы узнать,
              как работать с системой.
            </Typography>
          </Box>
          {isMobile && (
            <Button
              variant="contained"
              startIcon={<MenuIcon />}
              onClick={() => setDrawerOpen(true)}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}
            >
              Содержание
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Мобильный Drawer с содержанием */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              p: 2,
              bgcolor: 'background.default',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <MenuBookIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Содержание
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {navContent}
      </Drawer>

      {/* Контент: на десктопе 2 колонки, на мобильном 1 */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Левая колонка — навигация (только десктоп) */}
        {!isMobile && (
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              position: 'sticky',
              top: 80,
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 1.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'divider',
                borderRadius: 2,
              },
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ px: 1, py: 1, color: 'text.secondary' }}
            >
              📑 Содержание
            </Typography>
            {navContent}
          </Box>
        )}

        {/* Правая колонка — аккордеоны */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {sections.map((section) => (
            <Box
              key={section.id}
              id={`guide-${section.id}`}
              sx={{ scrollMarginTop: 80 }}
            >
              <Accordion
                expanded={expanded === section.id}
                onChange={handleAccordionChange(section.id)}
                disableGutters
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor:
                    expanded === section.id ? 'primary.light' : 'divider',
                  boxShadow:
                    expanded === section.id
                      ? '0 2px 12px rgba(0,0,0,0.06)'
                      : 'none',
                  '&:before': { display: 'none' },
                  transition: 'all 0.2s ease',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    borderRadius: 2,
                    minHeight: 56,
                    '&.Mui-expanded': { minHeight: 56 },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ pr: 1 }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor:
                          expanded === section.id
                            ? 'primary.main'
                            : 'primary.50',
                        color:
                          expanded === section.id ? 'white' : 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {section.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                    >
                      {section.title}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: { xs: 2, md: 3 },
                    pb: 3,
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {section.content}
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mt: 2,
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Если у вас остались вопросы — обратитесь к администратору системы
              или напишите в чат. 💬
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
