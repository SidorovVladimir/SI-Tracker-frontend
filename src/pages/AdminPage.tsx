import { Button } from '@mui/material';
import { Link } from 'react-router';
import routes from '../utils/routes';

export default function AdminPage() {
  return (
    <>
      <h1>Admin page</h1>
      <Button component={Link} to={routes.admin.users()} variant="outlined">
        Пользователи
      </Button>
      <Button></Button>
      <Button></Button>
      <Button></Button>
      <Button></Button>
      <Button></Button>
    </>
  );
}
