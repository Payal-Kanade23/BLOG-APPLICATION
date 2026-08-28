import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SaveButton } from "./SaveButton";
import { CloseButton } from "./CloseButton";
import type { BlogPayload, Blog } from "../api/createBlog.api";
import { useAuthStore } from "../../../auth/authStore";

interface Props {
  initialData?: Blog;
  onSubmit: (data: BlogPayload) => void;
}

interface ValidateErrors {
  title?: string;
  subtitle?: string;
  content?: string;
  Visibility?: string;
}

function AddForm({ onSubmit, initialData }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isPrivate = user?.isPrivate === true;
 
  const [form, setForm] = useState<BlogPayload>({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    content: initialData?.content || "",
    Visibility: initialData?.Visibility || ("" as "" | "PUBLIC" | "PRIVATE"),
  });

  useEffect(() => {
    if (isPrivate) {
      setForm((prev) => ({ ...prev, Visibility: "PRIVATE" }));
    }
  }, [isPrivate]);

  /* ----------------------------- Validation ----------------------------- */
  const [errors, setErrors] = useState<ValidateErrors>({});

  const validation = (data: BlogPayload): ValidateErrors => {
    const newErrors: ValidateErrors = {};

    if (!data.title) newErrors.title = "Title is required";
    else if (data.title.length <= 3) newErrors.title = "Title must be more than 3 characters";

    if (!data.subtitle) newErrors.subtitle = "Subtitle is required";
    if (!data.content) newErrors.content = "Content is required";
    if (!data.Visibility) newErrors.Visibility = "Choose public or private visibility for this blog";

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const error = validation(form);
      setErrors(error);

      if (Object.keys(error).length > 0) return;

      onSubmit(form);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error detected!");
    }
  };

  const isEditing = !!initialData;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isEditing ? "Edit blog" : "Write a new blog"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? "Update your post and save your changes."
            : "Share your thoughts — fill in the details below to publish."}
        </p>

      </div>
     

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Input
            required
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter title for blog"
            label="Blog title"
            error={errors.title}
          />

          <Input
            required
            type="text"
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            placeholder="Enter subtitle for blog"
            label="Blog subtitle"
            error={errors.subtitle}
          />

          <TextArea
            required
            name="content"
            value={form.content}
            placeholder="Share your thoughts for this article..."
            label="Blog content"
            onChange={handleChange}
            error={errors.content}
          />

          {isPrivate ? (
            <PrivateAccountNotice />
          ) : (
            <VisibilityToggle
              required
              value={form.Visibility}
              error={errors.Visibility}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, Visibility: value }))
              }
            />
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <CloseButton onClick={() => navigate(-1)} />
          <SaveButton type="submit" />
        </div>
      </form>
    </div>
  );
}

export default AddForm;

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Globe, Lock } from "lucide-react";
import { hasPermission } from "../../../utils/utils";
import { PERMISSIONS } from "../../../utils/constant";

/* ------------------------------- Input ------------------------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ label, required, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <input
        {...props}
        aria-invalid={!!error}
        className={[
          "rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
          "transition-colors duration-150 outline-none",
          "focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-300 focus:border-slate-500 focus:ring-slate-100",
        ].join(" ")}
      />

      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------ TextArea ------------------------------ */

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}
function TextArea({ label, required, error, ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <textarea
        {...props}
        rows={6}
        aria-invalid={!!error}
        className={[
          "resize-y rounded-lg border bg-white px-3.5 py-2.5 text-sm leading-6 text-gray-900 placeholder:text-gray-400",
          "transition-colors duration-150 outline-none",
          "focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-300 focus:border-slate-500 focus:ring-slate-100",
        ].join(" ")}
      />

      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* --------------------------- Visibility toggle --------------------------- */
// Replaces the plain <select> with a clearer segmented control.

interface VisibilityToggleProps {
  value: "" | "PUBLIC" | "PRIVATE";
  onChange: (value: "PUBLIC" | "PRIVATE") => void;
  error?: string;
  required?: boolean;
}

function VisibilityToggle({
  value,
  onChange,
  error,
  required,
}: VisibilityToggleProps) {
  const options: { key: "PUBLIC" | "PRIVATE"; label: string; hint: string; icon: typeof Globe }[] = [
    { key: "PUBLIC", label: "Public", hint: "Anyone can view this post", icon: Globe },
    { key: "PRIVATE", label: "Private", hint: "Only you can view this post", icon: Lock },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        Visibility
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div
        className={[
          "grid grid-cols-2 gap-2 rounded-lg border p-1.5",
          error ? "border-red-300" : "border-gray-200 bg-gray-50",
        ].join(" ")}
      >
        {options.map(({ key, label, hint, icon: Icon }) => {
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={[
                "flex items-start gap-2.5 rounded-md px-3 py-2.5 text-left transition-all duration-150",
                active
                  ? "bg-white shadow-sm ring-1 ring-slate-900/10"
                  : "hover:bg-white/60",
              ].join(" ")}
            >
              <Icon
                size={16}
                className={`mt-0.5 shrink-0 ${active ? "text-slate-900" : "text-gray-400"}`}
              />
              <span className="flex flex-col">
                <span
                  className={`text-sm font-semibold ${
                    active ? "text-slate-900" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
                <span className="text-xs text-gray-400">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

/* ------------------------- Private account notice ------------------------- */

 function PrivateAccountNotice() {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">Visibility</label>
      <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
        <Lock size={16} className="shrink-0 text-gray-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700">Private account</span>
          <span className="text-xs text-gray-400">
            Your posts are private and only visible to you
          </span>
        </div>
      </div>
    </div>
  );
}
