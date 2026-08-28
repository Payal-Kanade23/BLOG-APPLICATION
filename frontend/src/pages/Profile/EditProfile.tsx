import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Mail, Save, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { editProfile, getProfile } from "./api/profile.api";
import { useAuthStore } from "../../auth/authStore";
interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  profileImage?: string|null;
  isPrivate?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export const EditProfile = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s)=>s.setAuth)
  const user = useAuthStore((s)=>s.user);
  const token = useAuthStore((s)=>s.token)
  const isAdmin = user?.role === 'ADMIN';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
const [previewImage, setPreviewImage] = useState<string>("");
const loggedUser = useAuthStore((s)=>s.user);

  const [formData, setFormData] = useState<User>({
    _id: "",
    name: "",
    email: "",
    password: "",
    profileImage: null,
    isPrivate : false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
      const fetchProfile = async () => {
        try {
          setLoading(true);
  
          const response = await getProfile();
          
          setFormData(response.data.user);
          setPreviewImage(response.data.user.profileImage || "");
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message || "Failed to load profile"
          );
        } finally {
          setLoading(false);
        }
      };
  
      fetchProfile();
    }, []);

    const handleImageChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Only JPG, PNG and WEBP images are allowed");
    return;
  }

  // Validate size - 5MB
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be less than 5MB");
    return;
  }

  setProfileImage(file);

  // Create preview
  const imageUrl = URL.createObjectURL(file);
  setPreviewImage(imageUrl);
};

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Remove error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Password is optional while editing
    if (
      formData.password &&
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    setSaving(true);

    const payload = new FormData();

    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append(
      "isPrivate",
      String(formData.isPrivate)
    );

    if (formData.password) {
      payload.append("password", formData.password);
    }

    if (profileImage) {
      payload.append("profileImage", profileImage);
    }

    const response = await editProfile(payload);
    console.log("edit:::::::::",response)

    console.log("edit res:",response.data.user)
    console.log("edit----------------:",response.data.permissions)

    setAuth({user:response.data.user , token:token!  })
    toast.success(response.message);

    navigate("/profile");

  } catch (error) {
    console.error(error);
    toast.error("Failed to update user");

  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pl-64">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="mb-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={16} />
              Back to Users
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              Edit User
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update the user's account information.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Profile Image */}
          <div className="mb-8 flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-600">
              
                <UserIcon size={32} />
              
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Profile Information
              </h2>
              <p className="text-sm text-slate-500">
                Update the user's basic information.
              </p>
            </div>
          </div>

          <div className="space-y-6">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>

              <div className="relative">
                <UserIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter user name"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-4 text-sm outline-none transition
                    ${
                      errors.name
                        ? "border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                />
              </div>

              {errors.name && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-4 text-sm outline-none transition
                    ${
                      errors.email
                        ? "border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                New Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-4 text-sm outline-none transition
                    ${
                      errors.password
                        ? "border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                />
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Leave this field empty if you don't want to change
                the password.
              </p>

              {errors.password && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Profile Image URL */}
           {/* Profile Image */}
<div>
  <label className="mb-3 block text-sm font-medium text-slate-700">
    Profile Image
  </label>

  <div className="flex items-center gap-5">
    {/* Preview */}
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">
      {previewImage || loggedUser?.profileImage ? (
        <img
          src={previewImage}
          alt="Profile preview"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UserIcon size={32} className="text-slate-400" />
        </div>
      )}
    </div>

    {/* Upload */}
    <div>
      <label
        htmlFor="profileImage"
        className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        Upload Image
      </label>

      <input
        id="profileImage"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />

      <p className="mt-2 text-xs text-slate-500">
        JPG, PNG or WEBP. Maximum size 5MB.
      </p>
    </div>
  </div>
</div>

            {/* Private Account */}
            {
              !isAdmin && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Private Account
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Only approved followers can view the user's
                  content.
                </p>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="peer sr-only"
                />

                <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
              )
            }
            
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;