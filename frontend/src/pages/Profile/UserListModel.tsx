import { X, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "../LoginPage/api/login.api";
import { Avatar } from "../../components/Avatar";
import { motion, AnimatePresence } from "motion/react";

type UserListModalProps = {
  title: string;
  users: User[];
  onClose: () => void;
};

export function UserListModal({
  title,
  users,
  onClose,
}: UserListModalProps) {
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                {title}
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {users.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Users List */}
          <div className="max-h-[420px] overflow-y-auto p-4 space-y-2">
            {users.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No {title.toLowerCase()} yet.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-2xl p-2.5 transition hover:bg-slate-50"
                >
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <Avatar
                      src={`http://localhost:5000${user.profileImage}` }
                      name={user.name}
                      size="md"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-400 font-medium">
                        {user.email || `@${user.name.toLowerCase().replace(/\s+/g, '')}`}
                      </p>
                    </div>
                  </Link>

                  <Link
                    to={`/profile/${user._id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    <span>View</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default UserListModal;
