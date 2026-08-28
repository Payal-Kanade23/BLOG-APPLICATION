import { useEffect, useState } from "react";
import { getlike } from "../../Dashboard/api/dashboard.api";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Heart,
  Lock,
  UserPlus,
  UserCheck,
  Users,
  ArrowLeft,
  ShieldCheck,
  Mail,
  FileText,
  Plus,
  Eye,
  Loader2,
  User2,
} from "lucide-react";
import toast from "react-hot-toast";
import { likeBlog } from "../../Dashboard/api/dashboard.api";
import UserListModal from "../UserListModel";
import { getProfile ,editProfile, ProfileData} from "../api/profile.api"
import { useAuthStore } from "../../../auth/authStore";
// TODO: adjust this import path to wherever followUser actually lives in your project
import { followUser } from "../../Users/api/user.api";
function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>();
  const [loading, setLoading] = useState(true);

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [userLikedBlog, setUserLikedBlog] = useState<string[]>([]);
  const [justLikedId, setJustLikedId] = useState<string | null>(null);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);

  const [userFollowers, setUserFollowers] = useState<string[]>([]);
  const [followActionLoading, setFollowActionLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const loggedIn = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isOwnProfile = !id;

  const fetchLikes = async () => {
    try {
      const res = await getlike();
      setUserLikedBlog(res.data.map((item: any) => item.blog));
    } catch (error) {
      console.error("Error fetching Blogs:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile(id);
      setProfile(response.data);
      setUserFollowers(response.data.user.followers?.map((item) => item._id) ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchLikes();
  }, []);

  // --------------------------------
  // LIKE
  // --------------------------------

  const handleLike = async (blogId: string) => {
    try {
      const response = await likeBlog(blogId);

      // Optimistic update — fixed: was writing to `blog` (singular), a typo
      // that silently created a stray key instead of updating `blogs`.
      setProfile((prev:any) => {
        if (!prev) return prev;
        return {
          ...prev,
          blogs: prev.blogs.map((blog:any) =>
            blog._id === blogId ? { ...blog, totalLikes: response.totalLikes } : blog
          ),
        };
      });

      setJustLikedId(blogId);
      setTimeout(() => setJustLikedId(null), 400);

      fetchLikes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to like blog");
    }
  };

  // --------------------------------
  // FOLLOW (was unwired — buttons rendered but did nothing)
  // --------------------------------

  const handleFollowToggle = async () => {
    if (!loggedIn?._id) {
      toast.error("Please login first");
      return;
    }
    if (!profile?.user._id) return;

    try {
      setFollowActionLoading(true);
      const response = await followUser(profile.user._id);
      const status = response.status; // "following" | "follow" | "pending"

      if (status === "following") {
        setUserFollowers((prev) => [...prev, loggedIn._id]);
        toast.success("Following user");
      } else if (status === "follow") {
        setUserFollowers((prev) => prev.filter((uid) => uid !== loggedIn._id));
        toast.success("User unfollowed");
      } else if (status === "pending") {
        toast.success("Follow request sent");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update follow status");
    } finally {
      setFollowActionLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="animate-pulse">
            {!isOwnProfile && <div className="mb-8 h-5 w-20 rounded bg-gray-200" />}
            <div className="flex flex-col gap-8 sm:flex-row">
              <div className="flex justify-center sm:w-40">
                <div className="h-36 w-36 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1">
                <div className="h-7 w-40 rounded bg-gray-200" />
                <div className="mt-6 h-5 w-72 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-52 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= PROFILE NOT FOUND ================= */

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Users size={28} className="text-gray-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Profile not found</h2>
          <p className="mt-1 text-sm text-gray-500">The profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 2. handleSubmit — pull .user out of the response before setAuth
const handleSubmit = async (file: File) => {
  try {
    setImageUploading(true);
    const payload = new FormData();
    payload.append("profileImage", file);

    const response = await editProfile(payload);
    setAuth({ user: response.data.user, token: token! }); // <-- .user added
    toast.success(response.message);
    navigate("/users");
  } catch (error) {
    console.error(error);
    toast.error("Failed to update user");
  } finally {
    setImageUploading(false);
  }
};

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setProfileImage(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    await handleSubmit(file);
  };

  const { user, blogs = [] } = profile;
  const isAdmin = user.role === "ADMIN";
  const isFollowing = userFollowers.includes(loggedIn?._id ?? "");
  const handle = user.name?.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="pt-16 lg:pl-64" >
      {/* Local keyframes — kept scoped to this component's needs */}
      <style>{`
        @keyframes profileFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartPop {
          0% { transform: scale(1); }
          35% { transform: scale(1.4); }
          65% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes coverDrift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .fade-up { animation: profileFadeUp 0.5s ease-out both; }
        .heart-pop { animation: heartPop 0.4s ease-out; }
        .cover-drift {
          background-size: 200% 200%;
          animation: coverDrift 10s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className="fade-up mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-black"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        )}

        {/* =====================================================
            PROFILE HEADER
        ====================================================== */}
<section className="fade-up relative overflow-hidden rounded-3xl border border-gray-300">
  {/* Ambient cover backdrop — unchanged, stays visible */}
  <div
    className="cover-drift absolute inset-x-0 top-0 h-28 sm:h-32"
    style={{
      backgroundImage:
        "linear-gradient(120deg, #eef2ff 0%, #f5f3ff 35%, #eef2ff 70%, #f8fafc 100%)",
    }}
  />

  {/* White panel — starts exactly where the cover ends, fills the rest */}
  <div className="absolute inset-x-0 bottom-0 top-28 bg-white sm:top-32" />

  {/* Profile content — transparent, sits on top of both layers above */}
  <div className="relative px-6 pb-8 pt-16 sm:px-8">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              {/* ================= PROFILE IMAGE ================= */}

              <div className="flex justify-center sm:w-auto">
                <div className="relative">
                  <div className={`rounded-full bg-white p-1 shadow-sm ring-1 ${isAdmin ? "ring-yellow-500" : "ring-gray-400"}  transition-transform duration-300 hover:scale-[1.03]`}>
                    {user.profileImage || previewImage ? (
                      <img
                        src={previewImage || `http://localhost:5000${user.profileImage}`}
                        alt={user.name}
                        className="h-32 w-32 rounded-full object-cover sm:h-36 sm:w-36"
                      />
                    ) : (
                      <div
                        className={`flex h-32 w-32 items-center justify-center rounded-full  text-4xl text-indigo-600 sm:h-36 sm:w-36 
                         
                        }`}
                      >
                        <User2 size={42}/>
                      </div>
                    )}
                  </div>

                  {isOwnProfile && (
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={imageUploading}
                    />
                  )}

                  {isOwnProfile && (
                    <label
                      htmlFor="profileImage"
                      className={`absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-indigo-600 shadow-sm transition hover:bg-indigo-700 ${
                        imageUploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                      }`}
                    >
                      {imageUploading ? (
                        <Loader2 size={15} className="animate-spin text-white" />
                      ) : (
                        <Plus size={17} className="text-white" />
                      )}
                    </label>
                  )}

                  {isAdmin && !isOwnProfile && (
                    <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-indigo-600">
                      <ShieldCheck size={17} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* ================= PROFILE INFORMATION ================= */}

              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{user.name}</h1>
                    {!isAdmin && <p className="text-sm text-gray-400">@{handle}</p>}
                  </div>

                  {isAdmin && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      <ShieldCheck size={14} />
                      ADMIN
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-center sm:justify-start">
                  {!isOwnProfile && !isAdmin && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followActionLoading}
                      className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isFollowing
                          ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {followActionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isFollowing ? (
                        <UserCheck size={16} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      <span>{followActionLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}</span>
                    </button>
                  )}

                  {isOwnProfile && (
                    <button
                      onClick={() => navigate("/edit-profile")}
                      className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                ADMIN INFORMATION
            ================================================== */}

            {isAdmin ? (
              <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ShieldCheck size={16} />
                  <span>Administrator Account</span>
                </div>
                <p className="mt-4 max-w-lg text-sm leading-6 text-gray-500">
                  This account belongs to the administrator of the platform. Administrator accounts are used for
                  managing users, blogs and platform activities.
                </p>
              </div>
            ) : (
              /* =================================================
                 NORMAL USER STATS
              ================================================== */

              <div className="mt-8 border-t border-gray-100 pt-6">
  {/* ================= USER STATS ================= */}
  <div className="flex items-stretch justify-center divide-x divide-gray-100 sm:justify-start">

    {/* Posts */}
    <div className="px-6 text-center first:pl-0">
      <p className="text-xl font-bold text-gray-900">
        {blogs.length}
      </p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        Posts
      </p>
    </div>

    {/* Followers */}
    <button
      onClick={() => setShowFollowers(true)}
      className="px-6 text-center transition hover:opacity-70"
    >
      <p className="text-xl font-bold text-gray-900">
        {user.followers?.length || 0}
      </p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        Followers
      </p>
    </button>

    {/* Following */}
    <button
      onClick={() => setShowFollowing(true)}
      className="px-6 text-center transition hover:opacity-70"
    >
      <p className="text-xl font-bold text-gray-900">
        {user.followings?.length || 0}
      </p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        Following
      </p>
    </button>
  </div>

  {/* ================= VISIBILITY ================= */}
  <div className="mt-5 flex justify-center sm:justify-start">
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        user.isPrivate
          ? "bg-red-50 text-red-500"
          : "bg-green-50 text-green-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          user.isPrivate ? "bg-red-500" : "bg-green-500"
        }`}
      />
      {user.isPrivate ? "Private Profile" : "Public Profile"}
    </span>
  </div>
</div>
            )}
          </div>
        </section>

        {/* =====================================================
            ADMIN PROFILE CONTENT
        ====================================================== */}

        {isAdmin ? (
          <section className="fade-up pt-10" style={{ animationDelay: "80ms" }}>
            <div className="mx-auto max-w-xl">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                  <ShieldCheck size={36} className="text-indigo-600" />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-gray-900">Administrator Profile</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  This is an administrator account. Admin profiles don't display posts, followers, or following
                  information.
                </p>

                <div className="mt-8 grid gap-3 text-left">
                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                      <ShieldCheck size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Platform Administrator</p>
                      <p className="text-xs text-gray-500">Manages platform activities</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Users size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">User Management</p>
                      <p className="text-xs text-gray-500">Manages registered users</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <FileText size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Content Management</p>
                      <p className="text-xs text-gray-500">Manages platform content</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : user.isPrivate && !isOwnProfile && !isFollowing ? (
          /* =====================================================
             PRIVATE USER PROFILE
          ====================================================== */

          <div className="fade-up flex flex-col items-center justify-center py-24 text-center" style={{ animationDelay: "80ms" }}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
              <Lock size={32} className="text-gray-500" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-gray-900">This account is private</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">Follow this account to see their posts.</p>
            <button
              onClick={handleFollowToggle}
              disabled={followActionLoading}
              className="mt-6 flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {followActionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {followActionLoading ? "Loading..." : "Follow"}
            </button>
          </div>
        ) : (
          /* =====================================================
             NORMAL USER POSTS
          ====================================================== */

          <section className="fade-up pt-10" style={{ animationDelay: "80ms" }}>
            <div className="mb-6 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-black" />
              <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
              {blogs.length > 0 && (
                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {blogs.length}
                </span>
              )}
            </div>

            {blogs.length === 0 ? (
              /* ================= NO POSTS ================= */

              <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <FileText size={25} className="text-gray-400" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isOwnProfile ? "Start writing your first blog." : "This user hasn't published anything yet."}
                </p>

                {isOwnProfile && (
                  <button
                    onClick={() => navigate("/create-blog")}
                    className="mt-5 flex w-[240px] flex-row items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    <Plus size={16} />
                    <span>Create your first blog</span>
                  </button>
                )}
              </div>
            ) : (
              /* ================= BLOG GRID ================= */

              <div className="grid gap-4 sm:grid-cols-2">
                {blogs.map((blog, index) => {
                  const liked = userLikedBlog.includes(blog._id);
                  return (
                    <div
                      key={blog._id}
                      className="fade-up group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
                      style={{ animationDelay: `${100 + index * 60}ms` }}
                    >
                      <p className="text-xs font-medium text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      <h3 className="mt-2.5 line-clamp-2 text-lg font-semibold leading-7 text-gray-900 transition group-hover:text-gray-600">
                        {blog.title}
                      </h3>

                      {blog.subtitle && (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-gray-500">{blog.subtitle}</p>
                      )}

                      <div className="mt-auto flex w-full flex-row items-center justify-between gap-1.5 border-t border-gray-100 pt-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleLike(blog._id)}
                          className="flex items-center gap-1.5 transition hover:text-red-500"
                        >
                          <Heart
                            size={16}
                            className={justLikedId === blog._id ? "heart-pop" : ""}
                            fill={liked ? "#ef4444" : "none"}
                            stroke={liked ? "#ef4444" : "currentColor"}
                          />
                          <span>{blog.totalLikes || 0}</span>
                        </button>

                        <Link
                          to={`/view-blog/${blog._id}`}
                          className="flex flex-row items-center gap-1.5 text-xs text-gray-400 transition hover:text-gray-700"
                        >
                          <Eye size={15} />
                          <span>View blog</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* =====================================================
          FOLLOWERS MODAL
      ====================================================== */}

      {!isAdmin && showFollowers && (
        <UserListModal title="Followers" users={user.followers || []} onClose={() => setShowFollowers(false)} />
      )}

      {/* =====================================================
          FOLLOWING MODAL
      ====================================================== */}

      {!isAdmin && showFollowing && (
        <UserListModal title="Followings" users={user.followings || []} onClose={() => setShowFollowing(false)} />
      )}
    </div>
  );
}

export default Profile;