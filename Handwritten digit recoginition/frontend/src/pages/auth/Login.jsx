import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/auth/FormField";
import PasswordField from "../../components/auth/PasswordField";
import Banner from "../../components/auth/Banner";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const successMessage = location.state?.resetSuccess
    ? "Password updated. Log in with your new password."
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to DigiSense"
      subtitle="Pick up where you left off — your prediction history is waiting."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-sky hover:text-fg transition-colors">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Banner type="error" message={serverError} />
        <Banner type="success" message={successMessage} />

        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required.",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email." },
          })}
        />

        <PasswordField
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", { required: "Password is required." })}
        />

        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center gap-2 text-muted cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-border bg-overlay/5 accent-violet"
              {...register("rememberMe")}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sky hover:text-fg transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet via-purple to-sky text-white font-medium text-sm hover:shadow-[0_0_24px_rgba(0,212,255,0.35)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
