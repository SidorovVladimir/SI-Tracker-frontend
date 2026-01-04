export default {
  login: () => '/login',
  register: () => '/register',
  home: () => '/',
  profile: () => '/profile',
  admin: {
    root: () => '/admin',
    users: () => '/admin/users',
    editUser: (userId: string | ':userId') => `/admin/users/${userId}/edit`,
    cities: () => '/admin/cities',
    editCity: (cityId: string | ':cityId') => `/admin/cities/${cityId}/edit`,
  },
};
