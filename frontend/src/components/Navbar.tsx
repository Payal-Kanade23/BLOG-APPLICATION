import { Feather, Search ,Plus, Bell } from 'lucide-react';
import { useAuthStore } from '../auth/authStore';
import { useNavigate } from 'react-router-dom';
import { PERMISSIONS } from '../utils/constant';
import { Link } from 'react-router-dom';
import { hasPermission } from '../utils/utils';
const ACCENT = {
  text: "text-white",
  bg: "bg-black",
  bgHover: "hover:bg-emerald-700",
  ring: "ring-emerald-600/15",
  soft: "bg-emerald-50",
};
const MONOGRAM_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
];
function gradientFor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MONOGRAM_GRADIENTS[sum % MONOGRAM_GRADIENTS.length];
}

export function Navbar() {

    const user = useAuthStore((s)=>s.user)
    const navigate = useNavigate();
  return (
    <div>
       <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className=" flex h-full max-w-[1800px] items-center justify-between px-4 lg:px-4">
          {/* Brand */}
          <div className="flex items-center gap-2 ">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Feather size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              TeaPost
            </span>
          </div>

          {/* Search */}
        

          {/* Right side */}
          <div className="flex items-center gap-3">
            {(user?.role === "USER" && hasPermission(user?.permissions ,PERMISSIONS.FOLLOW_REQUEST ) ) && (
             <Link to={"/notification"}>
             <Bell size={20}/>
            </Link>
            )}
           
               {user?.role !== "ADMIN" || user && (
              <button
              onClick={() => navigate("/create-blog")}
              className="hidden items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 sm:flex"
            >
              <Plus size={16} />
              Create
            </button>
               ) }
            
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              <Link to={`/profile`}>
                            
               <div className="relative shrink-0">
                    {user?.profileImage   ? (
                      <img
                        src={`http://localhost:5000${user?.profileImage}`}
                        alt={user?.name}
                        className={`block aspect-square h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ${ACCENT.ring}`}
                      />
                    ) : (
                      <div
                        className={`aspect-square flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white `}
                      >
                        {user?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                  </div>

              </Link>
            </div>
          </div>
        </div>
      </header>

    </div>
  );
}

export default Navbar;
