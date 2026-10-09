import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PenTool, UploadCloud, Sparkles, Loader2 } from "lucide-react";
import DrawCanvas from "../../components/recognize/DrawCanvas";
import UploadPanel from "../../components/recognize/UploadPanel";
import ProcessingAnimation from "../../components/recognize/ProcessingAnimation";
import PredictionResult from "../../components/recognize/PredictionResult";
import { predictDigit } from "../../api/predictions";

export default function Recognize() {
  const [mode, setMode] = useState("draw"); // "draw" | "upload"
  const [uploadedImage, setUploadedImage] = useState(null);
  const [canvasHasContent, setCanvasHasContent] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | processing | done | error
  const [errorMessage, setErrorMessage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const canvasRef = useRef(null);

  const canPredict =
    (mode === "draw" && canvasHasContent) || (mode === "upload" && !!uploadedImage);

  async function handlePredict() {
    setErrorMessage("");
    setPrediction(null);

    let imageDataUrl;
    if (mode === "draw") {
      if (canvasRef.current.isEmpty()) return;
      imageDataUrl = canvasRef.current.toDataURL();
    } else {
      if (!uploadedImage) return;
      imageDataUrl = uploadedImage;
    }

    setStatus("processing");
    try {
      const result = await predictDigit({ image: imageDataUrl, source: mode });
      // let the processing animation breathe for a moment — feels intentional,
      // not just a network round trip
      await new Promise((r) => setTimeout(r, 500));
      setPrediction(result);
      setStatus("done");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setPrediction(null);
    setErrorMessage("");
    if (mode === "draw") canvasRef.current?.clear();
    else setUploadedImage(null);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Recognize a digit</h1>
        <p className="text-muted text-sm mt-1">Draw one, or upload a photo — the CNN reads it live.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5 items-stretch">
        {/* LEFT — input */}
        <div className="glass rounded-2xl p-5">
          <div className="flex gap-1 mb-4 p-1 rounded-xl bg-overlay/5 w-fit">
            <button
              onClick={() => {
                setMode("draw");
                setStatus("idle");
                setPrediction(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === "draw" ? "bg-overlay/10 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              <PenTool size={13} /> Draw
            </button>
            <button
              onClick={() => {
                setMode("upload");
                setStatus("idle");
                setPrediction(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === "upload" ? "bg-overlay/10 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              <UploadCloud size={13} /> Upload
            </button>
          </div>

          {mode === "draw" ? (
            <DrawCanvas ref={canvasRef} onChange={() => setCanvasHasContent(!canvasRef.current?.isEmpty())} />
          ) : (
            <UploadPanel onImageReady={setUploadedImage} onClear={() => setUploadedImage(null)} />
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePredict}
              disabled={!canPredict || status === "processing"}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet via-purple to-sky text-white font-medium text-sm hover:shadow-[0_0_24px_rgba(0,212,255,0.35)] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {status === "processing" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {status === "processing" ? "Predicting…" : "Predict"}
            </button>
            {(prediction || status === "error") && (
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl glass text-sm text-muted hover:text-fg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* CENTER — processing animation */}
        <ProcessingAnimation status={status} errorMessage={errorMessage} />

        {/* RIGHT — result */}
        <PredictionResult prediction={prediction} />
      </div>
    </div>
  );
}
