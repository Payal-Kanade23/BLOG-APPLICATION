import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../pages/LoginPage/api/login.api";
import type { Role } from "../utils/constant";
interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  permissions: string[];
  profileImage:string|null
  
  setAuth: (data: { user: User; token: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      permissions: [],
      profileImage:null,
      
      
      

      setAuth: ({ user, token  }) => {
        set((state) => {
          // Some profile endpoints return user details but not the computed
          // permission list. Keep the currently authenticated user's list in
          // that case; otherwise normalize invalid data to an empty list.
          const currentPermissions =
            state.user?._id === user._id ? state.permissions : [];
          const permissions = Array.isArray(user.permissions)
            ? user.permissions
            : currentPermissions;

          return {
            user: { ...user, permissions },
            token,
            role: user.role,
            permissions,
            profileImage:user.profileImage,
          };
        });
      },

      logout: () => {
        set({  user: null, token: null, role: null, permissions:[] ,profileImage:null });
        
      },
    }),
    {
      name: "auth-blogs",
    }
  )
);
