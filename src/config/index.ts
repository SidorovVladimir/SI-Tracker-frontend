export const API_ROUTES = {
  backup: '/api/admin/backup',
  restore: '/api/admin/restore',
  upload: '/api/documents/upload',
  delete: (documentId: string) => `/api/documents/${documentId}`,
  backupFiles: '/api/admin/backup-files',
  restoreFiles: '/api/admin/restore-files',
};
