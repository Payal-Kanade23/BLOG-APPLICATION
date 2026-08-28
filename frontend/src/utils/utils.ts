import { twMerge } from "tailwind-merge";
import {clsx , type ClassValue} from "clsx";
// class merge helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}



/**
 * Client-side permission checks are for navigation and UI only. The API must
 * still authorize every protected request.
 */
export const hasPermission = (
  permissions: readonly string[] | null | undefined,
  permission: string | null | undefined,
) => {
  // A route/action with no permission is public.
  if (!permission) return true;

  // Fail closed when auth state is not available or is malformed.
  return Array.isArray(permissions) && permissions.includes(permission);
};


