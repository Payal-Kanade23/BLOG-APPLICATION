import { Navigate, Outlet, matchPath, useLocation } from "react-router-dom";
import { useAuthStore } from "./authStore";
import { PERMISSIONS } from "../utils/constant";
import { hasPermission } from "../utils/utils";

const protectedRoutes = [
  { path: "/create-blog", permission: PERMISSIONS.CREATE_BLOG },
  { path: "/view-blogs", permission: PERMISSIONS.VIEW_BLOG },
  { path: "/view-blog/:id", permission: PERMISSIONS.VIEW_BLOG },
  { path: "/edit-blog/:id", permission: PERMISSIONS.EDIT_BLOG },
  { path: "/users", permission: PERMISSIONS.VIEW_USERS },
  { path: "/profile", permission: PERMISSIONS.VIEW_PROFILE },
  { path: "/profile/:id", permission: PERMISSIONS.VIEW_PROFILE },
  { path: "/edit-profile", permission: PERMISSIONS.EDIT_USER },
  { path: "/admin-dashboard", permission: PERMISSIONS.VIEW_ADMIN_DASHBOARD },
  { path: "/audit", permission: PERMISSIONS.VIEW_ANALYTICS },
  { path: "/notification", permission: PERMISSIONS.FOLLOW_REQUEST },
  
] as const;

/** One layout guard for all protected routes. API authorization remains authoritative. */
export function RequirePermission() {
  const permissions = useAuthStore((state) => state.permissions);
  const location = useLocation();
  const user = useAuthStore((s)=>s.user)
  const route = protectedRoutes.find(({ path }) =>
    matchPath({ path, end: true }, location.pathname),
  );
  if (!user) {
  return <Navigate to="/dashboard" replace />;
}

  if (!hasPermission(permissions, route?.permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
