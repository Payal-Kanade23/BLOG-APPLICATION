import { useState } from "react"
import { Eye, EyeOff,Globe,Shield,User, User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./api/register.api";
import toast from "react-hot-toast";
import type{ Role } from "../../utils/constant";
import { useAuthStore } from "../../auth/authStore";
import { Input } from "../../components/Input";
type SignupFormProps = {
    onSignup?: (token:string) =>void;
}
const Register : React.FC<SignupFormProps> = ({onSignup})=>{
const setAuth = useAuthStore((s)=>s.setAuth);

  const navigate = useNavigate();
const [form , setForm] = useState<RegisterForm>({
    name:"",
    email:'',
    password:"",
    confirmPassword: "",
    role: "USER",
})

const [loading , setLoading] = useState(false);
const [showPassword , setShowPassword] = useState(false);
const [showConfirmPassword , setShowConfirmPassword] = useState(false);
const [errors , setErrors] = useState<ValidateErrors>({});

/*=======================VALIDATION========================*/
interface RegisterForm   {
    name:string;
    email:string;
    role:Role;
    password:string;
    confirmPassword:string
}
interface ValidateErrors {
    name?:string;
    email?:string;
    role?:string;
    password?:string;
    confirmPassword?:string

}
const validateForm = (data: RegisterForm): ValidateErrors => {
    const newErrors: ValidateErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.name.trim()) {
        newErrors.name = "Name is required";
    }

    if (!data.email.trim()) {
        newErrors.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
        newErrors.email = "Invalid email format";
    }

    if (!data.password) {
        newErrors.password = "Password is required";
    } else if (data.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
    }

    if (!data.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
    } else if (data.password !== data.confirmPassword) {
        newErrors.confirmPassword = "Passwords must match";
    }

    if (!data.role) {
        newErrors.role = "Role is required";
    }

    return newErrors;
};
    function handleChange(e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement| HTMLSelectElement>): void {
        const {name ,value} = e.target;
        setForm({...form , [name]:value});

       
    }

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);

    console.log("validation errors:", validationErrors);

    setErrors(validationErrors);

    // Stop if validation errors exist
    if (Object.keys(validationErrors).length > 0) {
        return;
    }

    setLoading(true);

    try {
        const res = await registerUser({
            name: form.name,
            password: form.password,
            email: form.email,
            role: form.role,
            isPrivate:false
        });


        if (res?.token) {
            localStorage.setItem("token", res.token);

            if (res?.data) {
                setAuth({
                    user: {...res.data , profileImage:null},
                    token: res.token,
                });
            }

            onSignup?.(res.token);

            toast.success("Account created successfully");
            navigate("/dashboard");
        }
    } catch (err: any) {
        console.error("Signup error:", err);

        toast.error(
            err.response?.data?.message ||
            "Signup failed. Please try again."
        );
    } finally {
        setLoading(false);
    }
};

return(
 <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Join TeaPost and start publish your passions 
          </p>
       </div>

       <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-10">

          <section>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2 text-indigo-600">
                <User size={20} />
                <h2 className="text-lg font-semibold text-slate-800">User Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                label="Full Name"
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Alex whilliam" 
                />
                <Input
                  label="Email Address"
                  required
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="john@example.com"
                />
                         <Input
                  label="Password"
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  rightElement={
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
                <Input
                  label="Confirm Password"
                  required
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
                <div className="md:col-span-2">
                   <VisibilityToggle
              required
              value={form.role}
              error={errors.role}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, role: value }))
              }
            />
                </div>
                
              </div>


                 {/* SUBMIT BUTTON */}
     <div className="pt-4 w-full max-w-md mx-auto">
  <button
    type="submit"
    disabled={loading}
    className="w-full inline-flex items-center justify-center rounded-md text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-700 h-14 px-8 py-3 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:pointer-events-none disabled:opacity-50"
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Signing user...
      </span>
    ) : (
      "Sign up"
    )}
  </button>

  <p className="text-center mt-6 text-sm text-slate-500 font-medium">
    Already have an account?{" "}
    <button
      type="button"
      onClick={() => navigate("/login")}
      className="text-indigo-600 hover:text-indigo-500 font-bold ml-1 transition-colors underline-offset-4 hover:underline"
    >
      Log in
    </button>
  </p>
</div>
        

            </section>

          </form>
        </div>




      






       </div>
    </div>    

)


}

export default Register;
interface VisibilityToggleProps {
  value: "" | "ADMIN" | "USER";
  onChange: (value: "ADMIN" | "USER") => void;
  error?: string;
  required?: boolean;
}

function VisibilityToggle({
  value,
  onChange,
  error,
  required,
}: VisibilityToggleProps) {
  const options: { key: "ADMIN" | "USER"; label: string; hint: string; icon: typeof Globe }[] = [
    { key: "ADMIN", label: "Admin", hint: "Full access to manage users and all content", icon:  Shield},
    { key: "USER", label: "User", hint: "Can create and manage their own posts", icon: User2 },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        Role
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