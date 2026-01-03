export default {
  login: () => '/login',
  register: () => '/register',
  home: () => '/',
  profile: () => '/profile',
  admin: {
    root: () => '/admin',
    users: () => '/admin/users',
    editUser: (userID: string | ':userId') => `/admin/users/${userID}/edit`,
  },
};
