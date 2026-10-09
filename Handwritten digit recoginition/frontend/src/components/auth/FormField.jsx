export default function FormField({ label, error, ...props }) {
  return (
    <div className="mb-5">
      <label className="block text-sm text-muted mb-1.5">{label}</label>
      <input
        {...props}
        className={`w-full bg-overlay/5 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60
          ${error ? "border-red-500/60 focus:border-red-500" : "border-border focus:border-sky/60"}`}
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
