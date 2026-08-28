import { Link } from "react-router-dom";
import {
  UserPlus,
  UserCheck,
  Clock3,
  Users,
  Loader2,
  Search,
  PenLine,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { User } from "../../LoginPage/api/login.api";
import { getAllUser, followUser } from "./user.api";
import { useAuthStore } from "../../../auth/authStore";
type FollowStatus = "follow" | "pending" | "following" | "self";

/* -------------------------------------------------------------------------- */
/*  Design tokens (kept local to this file)                                   */
/*  Accent: deep emerald ink — reads as "editorial", not social-app default.  */
/* -------------------------------------------------------------------------- */
const ACCENT = {
  text: "text-white",
  bg: "bg-black",
  bgHover: "hover:bg-emerald-700",
  ring: "ring-emerald-600/15",
  soft: "bg-emerald-50",
};

// Small deterministic gradient set so each monogram avatar has a distinct,
// stable identity across renders (hashed from the user id).
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

export default function UserPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");

  const currentUser = useAuthStore((s:any) => s.user);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const loggedUser = useAuthStore((s:any)=>s.user);
  const [followStatus, setFollowStatus] = useState<Record<string, FollowStatus>>({});

  // --------------------------------
  // GET INITIAL FOLLOW STATUS
  // --------------------------------

  const getInitialStatus = useCallback(
    (user: User): FollowStatus => {
      if (currentUser?._id === user._id) return "self";

      const isFollowing = user.followers?.some(
        (follower: any) =>
          follower?._id?.toString() === currentUser?._id?.toString() ||
          follower?.toString() === currentUser?._id?.toString()
      );
      if (isFollowing) return "following";

      const request = user.followRequest?.find(
        (item: any) =>
          item.sender?._id?.toString() === currentUser?._id?.toString() ||
          item.sender?.toString() === currentUser?._id?.toString()
      );
      if (request?.status === "pending") return "pending";

      return "follow";
    },
    [currentUser?._id]
  );

  // --------------------------------
  // FETCH USERS
  // --------------------------------

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllUser();
      const fetchedUsers = res.data;

      setUsers(fetchedUsers);

      const statuses: Record<string, FollowStatus> = {};
      fetchedUsers.forEach((user) => {
        statuses[user._id] = getInitialStatus(user);
      });
      setFollowStatus(statuses);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [getInitialStatus]);

  useEffect(() => {
    if (currentUser?._id) fetchUsers();
  }, [fetchUsers, currentUser?._id]);

  // --------------------------------
  // FOLLOW / UNFOLLOW
  // --------------------------------

  const handleFollow = async (id: string) => {
    if (!currentUser?._id) {
      toast.error("Please login first");
      return;
    }

    try {
      setFollowLoading(id);
      const previousStatus = followStatus[id] || "follow";
      const response = await followUser(id);
      const newStatus: FollowStatus = response.status;

      setFollowStatus((prev) => ({ ...prev, [id]: newStatus }));

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user._id !== id) return user;

          if (newStatus === "following" && previousStatus !== "following") {
            return {
              ...user,
              followers: [...(user.followers || []), currentUser._id] as any,
            };
          }

          if (newStatus === "follow" && previousStatus === "following") {
            return {
              ...user,
              followers: (user.followers || []).filter(
                (follower: any) =>
                  follower?._id?.toString() !== currentUser._id.toString() &&
                  follower?.toString() !== currentUser._id.toString()
              ),
            };
          }

          return user;
        })
      );

      if (newStatus === "following") toast.success("Following user");
      else if (newStatus === "follow") toast.success("User unfollowed");
      else if (newStatus === "pending") toast.success("Follow request sent");
    } catch (error: any) {
      console.error("Follow error:", error);
      toast.error(error?.response?.data?.message || "Failed to update follow status");
    } finally {
      setFollowLoading(null);
    }
  };

  // --------------------------------
  // SEARCH FILTER (client-side, over already-fetched list)
  // --------------------------------

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(q));
  }, [users, query]);

  // --------------------------------
  // FOLLOW BUTTON
  // --------------------------------

  const renderFollowButton = (user: User) => {
    const status = followStatus[user._id] || getInitialStatus(user);
    const isLoading = followLoading === user._id;

    if (status === "self") return null;

    if (status === "following") {
      return (
        <button
          onClick={() => handleFollow(user._id)}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
          {isLoading ? "Loading" : "Following"}
        </button>
      );
    }

    if (status === "pending") {
      return (
        <button
          onClick={() => handleFollow(user._id)}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Clock3 size={14} />}
          {isLoading ? "Loading" : "Requested"}
        </button>
      );
    }

    return (
      <button
        onClick={() => handleFollow(user._id)}
        disabled={isLoading}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${ACCENT.bg} ${ACCENT.bgHover}`}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Loading
          </>
        ) : (
          <>
            <UserPlus size={14} />
            {user.isPrivate ? "Request" : "Follow"}
          </>
        )}
      </button>
    );
  };

  // --------------------------------
  // RENDER
  // --------------------------------

  return (
    <div className="pt-16 lg:pl-64">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
           
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Writers to follow
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Discover people publishing on the platform right now.
            </p>
          </div>
        </div>

        {/* SEARCH */}
        {!loading && users.length > 0 && (
          <div className="relative mb-6">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search writers by name..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 size={26} className={`animate-spin ${ACCENT.text}`} />
            <p className="text-sm text-gray-400">Loading writers...</p>
          </div>
        )}

        {/* EMPTY (no users at all) */}
        {!loading && users.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <Users size={36} className="mx-auto mb-3 text-gray-300" />
            <h2 className="font-semibold text-gray-800">No writers yet</h2>
            <p className="mt-1 text-sm text-gray-500">
              There's no one else here yet — check back soon.
            </p>
          </div>
        )}

        {/* EMPTY (search yields nothing) */}
        {!loading && users.length > 0 && filteredUsers.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">
              No writers match <span className="font-medium text-gray-700">"{query}"</span>
            </p>
          </div>
        )}

        {/* LIST — hairline-divided rows, editorial contributors-page feel */}
        {!loading && filteredUsers.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                className="group flex items-center justify-between gap-4 py-4 transition hover:bg-gray-50/60"
              >
                <Link to={`/profile/${user._id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
                  {/* AVATAR */}
                  <div className="relative shrink-0">
                    {user.profileImage ? (
                      <img
                        src={`http://localhost:5000${user.profileImage}`}
                        alt={user.name}
                        className={`h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ${ACCENT.ring}`}
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${gradientFor(
                          user._id
                        )}`}
                      >
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-gray-900 group-hover:underline">
                        {user.name}
                      </h2>
                      {user.isPrivate && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          Private
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-gray-400">
                      <span className="font-medium text-gray-500">
                        {user.followers?.length || 0}
                      </span>{" "}
                      followers
                      <span className="mx-1.5 text-gray-300">·</span>
                      <span className="font-medium text-gray-500">
                        {user.followings?.length || 0}
                      </span>{" "}
                      following
                    </p>
                  </div>
                </Link>

                {/* ACTIONS */}
                {loggedUser?.role !== "ADMIN" && (
                <div className="shrink-0">{renderFollowButton(user)}</div>
                )}
               
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
