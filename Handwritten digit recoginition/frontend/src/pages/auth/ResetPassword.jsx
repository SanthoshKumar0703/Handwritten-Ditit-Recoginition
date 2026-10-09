import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams, useNavigate } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import PasswordField from "../../components/auth/PasswordField";
import Banner from "../../components/auth/Banner";
import api from "../../api/client";

export default function ResetPassword() {
  const { token } = useParams();
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
      await api.post(`/auth/reset-password/${token}`, {
        password: values.password,
        confirm_password: values.confirmPassword,
      });
      navigate("/login", {
        replace: true,
        state: { resetSuccess: true },
      });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="Make it something you haven't used before."
      footer={
        <Link to="/login" className="text-sky hover:text-fg transition-colors">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Banner type="error" message={serverError} />

        <PasswordField
          label="New password"
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
          label="Confirm new password"
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
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
