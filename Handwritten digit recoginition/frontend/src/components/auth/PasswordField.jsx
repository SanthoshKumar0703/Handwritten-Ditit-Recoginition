import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ label, error, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mb-5">
      <label className="block text-sm text-muted mb-1.5">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`w-full bg-overlay/5 border rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition-colors placeholder:text-muted/60
            ${error ? "border-red-500/60 focus:border-red-500" : "border-border focus:border-sky/60"}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
