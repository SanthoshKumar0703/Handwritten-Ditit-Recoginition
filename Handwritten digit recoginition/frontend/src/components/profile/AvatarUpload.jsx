import { useRef } from "react";
import { Camera } from "lucide-react";

const MAX_SIZE_BYTES = 1.5 * 1024 * 1024;

export default function AvatarUpload({ avatarUrl, name, onChange }) {
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Please choose a PNG or JPG image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      alert("Image is too large (max 1.5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }

  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet to-sky flex items-center justify-center text-onaccent font-semibold text-lg">
            {initials}
          </div>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-ink border border-border flex items-center justify-center hover:border-overlay/30 transition-colors"
          aria-label="Change avatar"
        >
          <Camera size={11} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <div>
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted mt-0.5">PNG or JPG, up to 1.5MB.</p>
      </div>
    </div>
  );
}
