import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

type Mode = "photo" | "video";

export default function CameraPage() {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("photo");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [ready, setReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoConstraints = {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  const onUserMedia = () => {
    setCameraError(null);
    setReady(true);
  };

  const onUserMediaError = (err: any) => {
    console.error(err);
    setCameraError("Camera access failed (permission / HTTPS / busy).");
  };

  const switchCamera = () => {
    setFacingMode((p) => (p === "user" ? "environment" : "user"));
    setReady(false);
  };

  const capturePhoto = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      console.warn("Screenshot null (camera not ready)");
      return;
    }

    setIsCapturing(true);
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      navigate("/preview", {
        state: { imageSrc, hash: hashHex, blob },
      });
    } finally {
      setIsCapturing(false);
    }
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black text-white">
      {/* CAMERA FEED */}
      {cameraError ? (
        <div className="absolute inset-0 grid place-items-center p-6">
          <div className="rounded-xl border border-white/15 bg-black/70 p-5 text-center">
            <div className="font-semibold mb-2">Camera error</div>
            <div className="text-sm text-white/70 mb-4">{cameraError}</div>
            <button
              className="rounded-lg bg-white text-black px-4 py-2 font-medium"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            videoConstraints={videoConstraints}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* GRID */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
          </div>

          {/* BOTTOM BAR */}
          <div
            className="absolute left-0 right-0 bottom-0 px-6"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
          >
            <div className="mb-5 flex justify-center gap-10 text-lg select-none">
              <button
                onClick={() => setMode("video")}
                className={mode === "video" ? "text-yellow-400" : "text-white/60"}
              >
                Video
              </button>
              <button
                onClick={() => setMode("photo")}
                className={mode === "photo" ? "text-yellow-400" : "text-white/60"}
              >
                Photo
              </button>
            </div>

            <div className="flex items-center justify-between max-w-md mx-auto">
              {/* SWITCH CAMERA */}
              <button
                onClick={switchCamera}
                className="pointer-events-auto text-sm px-3 py-2 rounded-lg bg-white/10 border border-white/20"
              >
                Switch
              </button>

              {/* SHUTTER */}
              <button
                type="button"
                onClick={() => {
                  if (mode === "photo") capturePhoto();
                }}
                disabled={!ready || isCapturing || !!cameraError || mode !== "photo"}
                className="pointer-events-auto disabled:opacity-40"
              >
                <div className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-white/20" />
                </div>
              </button>

              <div className="w-[64px]" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
