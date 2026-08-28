import { X, Menu, LogOut, LogIn } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigation } from "./navigation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import toast from "react-hot-toast";
import { hasPermission } from "../utils/utils";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

   const navigate = useNavigate();
  const user = useAuthStore((s)=>s.user);
  const permissions = useAuthStore((s) => s.permissions);
  
   const accessibleItem = navigation.filter((item) => {
    // Logged out → ONLY public navigation items
    if (!user) {
      return item.permission === null;
    }

    // Logged in → hide Login
    if (item.label === "Login") {
      return false;
    }

    if(user?.role === "ADMIN"){
      return item.hideFrom ? false : true

    }

    // Logged in → public + permitted items
    return hasPermission(permissions, item.permission)
    
  });

  
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogout = () => {
    navigate("/dashboard");
    logout();
    localStorage.removeItem("token")

    toast.success("Logged out successfully");

    
  };

  const handleLogin = () =>{
    navigate("/login")
  }
  return (
    <>
      {/* Mobile Menu Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-20 z-50 rounded-lg bg-slate-900 p-2.5 text-white shadow-lg transition hover:bg-slate-800 lg:hidden"
        >
          <Menu size={16} />
        </button>
      )}

      {/* Overlay - Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-64 flex-col
          bg-slate-900 text-white shadow-xl
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Dashboard
            </h1>

            <p className="mt-0.5 text-xs text-slate-400">
              Manage your content
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
       <nav className="flex-1 space-y-1 px-3 py-5">
  {accessibleItem.map((item) => {
    const Icon = item.icon;

    if (item.onClick) {
      return (
        <button
          key={item.label}
          onClick={() => {
            item.onClick?.();
            setSidebarOpen(false);
          }}
          className="
            group flex w-full items-center gap-3 rounded-xl px-4 py-3
            text-sm font-medium text-slate-300
            transition-all duration-200
            hover:bg-slate-800 hover:text-white
          "
        >
          <Icon
            size={19}
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          />

          <span>{item.label}</span>
        </button>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href!}
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
          `
          group flex items-center gap-3 rounded-xl px-4 py-3
          text-sm font-medium transition-all duration-200
          ${
            isActive
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }
          `
        }
      >
        <Icon
          size={19}
          className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        />

        <span>{item.label}</span>
      </NavLink>
    );
  })}
</nav>
          
          
         

        {/* Bottom Section */}
        <div className="border-t border-slate-700 p-4">
         <button
  onClick={user ? handleLogout : handleLogin}
  className="flex w-full items-center gap-3 rounded-lg px-4 py-3"
>
  {user ? (
    <>
      <LogOut size={16} />
      <span>Logout</span>
    </>
  ) : (
    <>
      <LogIn size={16} />
      <span>Login</span>
    </>
  )}
</button>

          <div className="rounded-xl bg-slate-800 p-3">
          

            <p className="mt-1 text-xs text-slate-500">
              Create. Write. Share.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
