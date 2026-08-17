import { createRootRoute, createRoute } from '@tanstack/react-router';
import { AppShell } from './components/AppShell';
import { Dashboard } from './features/Dashboard';
import { LkeDetail } from './features/LkeDetail';
import { PokjaDetail } from './features/PokjaDetail';
import { AuditDetail } from './features/AuditDetail';
import { UserManagement } from './features/UserManagement';
import { Reporting } from './features/Reporting';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const lkeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lke',
  component: LkeDetail,
});

const pokjaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pokja/$pokjaCode',
  component: PokjaDetail,
});

const auditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audit',
  component: AuditDetail,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UserManagement,
});

const reportingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pelaporan',
  component: Reporting,
});

export const routeTree = rootRoute.addChildren([indexRoute, lkeRoute, pokjaRoute, auditRoute, usersRoute, reportingRoute]);
