export const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000' : '';

export const API_ROUTES = {
  backup: `${API_BASE_URL}/api/admin/backup`,
  restore: `${API_BASE_URL}/api/admin/restore`,
};
