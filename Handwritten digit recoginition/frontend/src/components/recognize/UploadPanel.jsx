import { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE_BYTES = 6 * 1024 * 1024;

export default function UploadPanel({ onImageReady, onClear }) {
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      setError("");
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only PNG and JPG images are supported.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("Image is too large (max 6MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        onImageReady?.(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [onImageReady]
  );

  function handleRemove() {
    setPreview(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <div>
      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
            dragOver ? "border-sky bg-sky/5" : "border-border hover:border-overlay/20"
          }`}
        >
          <UploadCloud size={28} className="text-muted" />
          <div className="text-center px-6">
            <p className="text-sm">Drag & drop an image</p>
            <p className="text-xs text-muted mt-1">or click to browse — PNG or JPG</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-[#0a0a12] aspect-square">
          <img src={preview} alt="Uploaded digit preview" className="w-full h-full object-contain" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
