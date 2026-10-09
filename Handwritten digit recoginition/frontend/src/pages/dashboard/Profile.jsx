import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Save, KeyRound, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, changePassword, deleteAccount } from "../../api/profile";
import AvatarUpload from "../../components/profile/AvatarUpload";
import FormField from "../../components/auth/FormField";
import PasswordField from "../../components/auth/PasswordField";
import Banner from "../../components/auth/Banner";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // ---- profile info ----
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);
    try {
      const updated = await updateProfile({ name, avatarUrl });
      setUser(updated);
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  // ---- change password ----
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    watch,
    reset: resetPwForm,
    formState: { errors: pwErrors },
  } = useForm();
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const newPassword = watch("newPassword");

  async function onChangePassword(values) {
    setPwError("");
    setPwSuccess("");
    setPwSubmitting(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setPwSuccess("Password updated.");
      resetPwForm();
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSubmitting(false);
    }
  }

  // ---- delete account ----
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-semibold text-2xl">Profile</h1>
        <p className="text-muted text-sm mt-1">Update your name, photo, and password.</p>
      </motion.div>

      <form onSubmit={handleSaveProfile} className="glass rounded-2xl p-6">
        <Banner type="error" message={profileError} />
        <Banner type="success" message={profileMessage} />

        <AvatarUpload avatarUrl={avatarUrl} name={name} onChange={setAvatarUrl} />

        <div className="mt-6">
          <FormField label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="mb-1">
            <label className="block text-sm text-muted mb-1.5">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full bg-overlay/5 border border-border rounded-xl px-4 py-2.5 text-sm text-muted cursor-not-allowed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet via-purple to-sky text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-shadow disabled:opacity-60"
        >
          {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save changes
        </button>
      </form>

      <form onSubmit={handleSubmitPw(onChangePassword)} className="glass rounded-2xl p-6">
        <h2 className="font-display font-medium text-sm mb-4 flex items-center gap-2">
          <KeyRound size={15} className="text-sky" /> Change password
        </h2>
        <Banner type="error" message={pwError} />
        <Banner type="success" message={pwSuccess} />

        <PasswordField
          label="Current password"
          error={pwErrors.currentPassword?.message}
          {...registerPw("currentPassword", { required: "Current password is required." })}
        />
        <PasswordField
          label="New password"
          error={pwErrors.newPassword?.message}
          {...registerPw("newPassword", {
            required: "New password is required.",
            minLength: { value: 8, message: "Use at least 8 characters." },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: "Include an uppercase letter, lowercase letter, and a number.",
            },
          })}
        />
        <PasswordField
          label="Confirm new password"
          error={pwErrors.confirmPassword?.message}
          {...registerPw("confirmPassword", {
            required: "Please confirm your new password.",
            validate: (v) => v === newPassword || "Passwords do not match.",
          })}
        />

        <button
          type="submit"
          disabled={pwSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-sm font-medium hover:border-overlay/20 transition-colors disabled:opacity-60"
        >
          {pwSubmitting && <Loader2 size={15} className="animate-spin" />}
          Update password
        </button>
      </form>

      <div className="glass rounded-2xl p-6 border-red-500/20">
        <h2 className="font-display font-medium text-sm mb-2 flex items-center gap-2 text-red-300">
          <Trash2 size={15} /> Delete account
        </h2>
        <p className="text-muted text-xs mb-4">
          This permanently deletes your account and every prediction you've made. This can't be undone.
        </p>

        {deleteError && <p className="text-red-400 text-xs mb-3">{deleteError}</p>}

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="text-sm px-4 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              placeholder="Confirm your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="flex-1 bg-overlay/5 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500/60"
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || !deletePassword}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : "Confirm delete"}
            </button>
            <button
              onClick={() => {
                setConfirmingDelete(false);
                setDeletePassword("");
                setDeleteError("");
              }}
              className="px-4 py-2.5 rounded-xl glass text-sm text-muted hover:text-fg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
