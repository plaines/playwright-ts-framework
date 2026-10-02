export const ROUTES = {
  login: '/web/index.php/auth/login',
  dashboard: '/web/index.php/dashboard/index',
  adminUsers: '/web/index.php/admin/viewSystemUsers',
  addEmployee: '/web/index.php/pim/addEmployee',
} as const;

export const LABELS = {
  dashboard: 'Dashboard',
  admin: 'Admin',
  pim: 'PIM',
  invalidCredentials: 'Invalid credentials',
  userRole: 'User Role',
  status: 'Status',
} as const;

export const STATUS_OPTIONS = { enabled: 'Enabled', disabled: 'Disabled' } as const;

export const API_ROUTES = {
  products: '/products',
  login: '/auth/login',
} as const;
