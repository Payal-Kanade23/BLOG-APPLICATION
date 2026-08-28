import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginUser } from "./api/login.api";
import toast from "react-hot-toast";
import { useAuthStore } from "../../auth/authStore";
type LoginFormProps = {
  onLogin?: (token: string) => void;
};



const Login: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s)=>s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  interface LoginForm {
    email:string;
    password:string;
  
}

interface ValidateErrors{
    email?:string;
    password?:string;
}
  const  [errors, setErrors] = useState<ValidateErrors>({});

  const validateLogin = (data:LoginForm):ValidateErrors =>{
    const errors :ValidateErrors = {};

    if(!data.email.trim()){
        errors.email = "Email is required";
    }else{
       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){
        errors.email = "Invalid email format."
    }
    }

    if(!data.password.trim()){
        errors.password = "Password is required";
    }else {
      if(data.password.length < 8){
        errors.password = "Password must be at least 8 characters";

    }
    }
      

    return errors;

  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("error:",errors)
    const error = validateLogin({email , password})
    setErrors(error);

    if (Object.keys(error).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await loginUser(
        {
        email,
        password,
        
      })
      

      const loginData = res;

      if (loginData?.token) {
        localStorage.setItem("token", loginData.token);


        // ✅ Save user + role to authStore for RBAC
        if (loginData?.data) {
          setAuth({ user: {...loginData.data , profileImage:null}, token: loginData.token });
        }
      }

      onLogin?.(loginData?.token);
      toast.success(loginData.message || "Login successful");
      navigate("/dashboard");

    } catch (err: unknown) {
      console.error("Login error:", err);

      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Invalid email or password"
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans antialiased text-slate-900 transition-colors duration-300">
      <div className="w-full max-w-[440px]">
        {/* Logo / Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
             TeaPost
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Publish your passion , your way
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 sm:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                Email 
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  className={`flex h-11 w-full rounded-md border bg-white px-10 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200"
                    }`}
                  value={email}
                  placeholder="name@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter your email address to sign in.
              </p>
              {errors.email && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none text-slate-700 font-sans">
                  Password
                </label>
                {/* <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot password?
                </button> */}
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  className={`flex h-11 w-full rounded-md border bg-white px-10 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${errors.password ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200"
                    }`}
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-11 px-4 py-2 w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

         
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Don't have an account?</span>{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default Login;

