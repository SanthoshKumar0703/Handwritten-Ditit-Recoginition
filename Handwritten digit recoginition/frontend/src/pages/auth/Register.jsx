import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/auth/FormField";
import PasswordField from "../../components/auth/PasswordField";
import Banner from "../../components/auth/Banner";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      // Auto-login happens inside registerUser (first registration only)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Free to use — draw, upload, and let the model do the reading."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-sky hover:text-fg transition-colors">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Banner type="error" message={serverError} />

        <FormField
          label="Full name"
          placeholder="Santhosh Kumar"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required.",
            minLength: { value: 2, message: "Name is too short." },
          })}
        />

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
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required.",
            minLength: { value: 8, message: "Use at least 8 characters." },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: "Include an uppercase letter, lowercase letter, and a number.",
            },
          })}
        />

        <PasswordField
          label="Confirm password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password.",
            validate: (v) => v === password || "Passwords do not match.",
          })}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet via-purple to-sky text-white font-medium text-sm hover:shadow-[0_0_24px_rgba(0,212,255,0.35)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
