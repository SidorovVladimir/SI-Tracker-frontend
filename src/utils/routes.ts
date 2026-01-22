export default {
  login: () => '/login',
  register: () => '/register',
  home: () => '/',
  profile: () => '/profile',
  admin: {
    root: () => '/admin',
    users: () => '/admin/users',
    createUser: () => '/admin/users/create',
    editUser: (userId: string | ':userId') => `/admin/users/${userId}/edit`,
    cities: () => '/admin/cities',
    editCity: (cityId: string | ':cityId') => `/admin/cities/${cityId}/edit`,
    createCity: () => '/admin/cities/create',
    companies: () => '/admin/companies',
    editCompany: (companyId: string | ':companyId') =>
      `/admin/companies/${companyId}/edit`,
    createCompany: () => '/admin/companies/create',
    productionSites: () => '/admin/production-sites',
    editProductionSite: (productionSiteId: string | ':productionSiteId') =>
      `/admin/production-sites/${productionSiteId}/edit`,
    createProductionSite: () => '/admin/production-sites/create',
    devices: () => '/admin/devices',
    editDevice: (deviceId: string | ':deviceId') =>
      `/admin/devices/${deviceId}/edit`,
    createDevice: () => '/admin/devices/create',
    equipmentTypes: () => '/admin/equipment-types',
    createEquipmentType: () => '/admin/equipment-types/create',
  },
};
