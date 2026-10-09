import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/auth/FormField";
import Banner from "../../components/auth/Banner";
import api from "../../api/client";

export default function ForgotPassword() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email: values.email });
      setSuccessMessage(data.message);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send a reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sky hover:text-fg transition-colors">
          <ArrowLeft size={14} /> Back to log in
        </Link>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet via-purple to-sky text-white font-medium text-sm hover:shadow-[0_0_24px_rgba(0,212,255,0.35)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}
