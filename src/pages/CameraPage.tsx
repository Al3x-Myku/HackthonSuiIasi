import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`block ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v10m0-10 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 14v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SwitchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`block ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12a8 8 0 0 0-14.928-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M5 4v4h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 12a8 8 0 0 0 14.928 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M19 20v-4h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`block ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 6.5L9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CameraPage() {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [ready, setReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // toast UI (no popup)
  const [uiError, setUiError] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showUiError = (msg: string) => {
    setUiError(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setUiError(null), 2600);
  };

  const getLocationString = async (): Promise<string> => {
    if (!("geolocation" in navigator)) return "Unknown Location";
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const latDir = lat >= 0 ? "N" : "S";
      const lonDir = lon >= 0 ? "E" : "W";

      return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
    } catch (e) {
      console.warn("Geolocation denied/failed", e);
      return "Location Denied";
    }
  };

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

  const uploadImage = async (file: File) => {
    setIsCapturing(true);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const imageSrc = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      const location = await getLocationString();
      navigate("/preview", { state: { imageSrc, hash: hashHex, blob: file, location } });
    } finally {
      setIsCapturing(false);
    }
  };

  const capturePhoto = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      showUiError("Camera not ready yet. Try again.");
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

      const location = await getLocationString();
      navigate("/preview", { state: { imageSrc, hash: hashHex, blob, location } });
    } finally {
      setIsCapturing(false);
    }
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black text-white cursor-default">
      {cameraError ? (
        <div className="absolute inset-0 grid place-items-center p-6">
          <div className="rounded-2xl border border-white/15 bg-black/70 p-5 text-center max-w-sm w-full">
            <div className="font-semibold mb-2">Camera error</div>
            <div className="text-sm text-white/70 mb-4">{cameraError}</div>
            <button
              className="w-full rounded-xl bg-white text-black px-4 py-2 font-medium cursor-pointer hover:opacity-90"
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

          {/* TOP-LEFT BACK BUTTON */}
          <div className="absolute top-0 left-0 p-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
            <button
              type="button"
              onClick={() => navigate("/gallery")}
              className="cursor-pointer inline-flex items-center justify-center h-12 w-12 rounded-full
                         bg-black/60 border border-white/25 backdrop-blur
                         shadow-[0_8px_24px_rgba(0,0,0,0.55)]
                         hover:bg-black/70 active:scale-95 transition"
              aria-label="Back to dashboard"
            >
              <BackIcon className="h-7 w-7 -translate-x-[1.5px]" />
            </button>
          </div>

          {/* Toast (no popup) */}
          {uiError && (
            <div className="pointer-events-none absolute left-0 right-0 bottom-44 px-6">
              <div
                className="mx-auto max-w-md rounded-xl border border-white/15 bg-black/70 backdrop-blur
                           px-4 py-3 text-sm text-white/90
                           shadow-[0_10px_30px_rgba(0,0,0,0.55)]"
              >
                {uiError}
              </div>
            </div>
          )}

          {/* Bottom gradient for visibility */}
          <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent" />

          {/* BOTTOM CONTROLS */}
          <div className="absolute left-0 right-0 bottom-0 px-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}>
            <div className="flex items-center justify-between max-w-md mx-auto">
              {/* UPLOAD */}
              <label
                className="cursor-pointer pointer-events-auto inline-flex items-center justify-center h-14 w-14 rounded-full
                           bg-white/20 border border-white/30
                           shadow-[0_10px_30px_rgba(0,0,0,0.55)]
                           hover:bg-white/30 active:scale-95 transition"
                aria-label="Upload image"
              >
                <UploadIcon className="h-7 w-7 -translate-x-[1px]" />
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.heic"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;

                    if (!f.type.startsWith("image/")) {
                      showUiError("Doar imagini (jpg/png/webp/heic).");
                      e.currentTarget.value = "";
                      return;
                    }

                    void uploadImage(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              {/* SHUTTER */}
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!ready || isCapturing || !!cameraError}
                className="cursor-pointer pointer-events-auto disabled:opacity-40 active:scale-[0.98] transition group"
                aria-label="Capture photo"
              >
                <div
                  className="h-24 w-24 rounded-full border-[5px] border-white
                             shadow-[0_14px_40px_rgba(0,0,0,0.6)]
                             flex items-center justify-center
                             transition
                             group-hover:border-white/80"
                >
                  <div className="h-19 w-19 rounded-full bg-white/25 transition group-hover:bg-white/35" />
                </div>
              </button>

              {/* SWITCH */}
              <button
                type="button"
                onClick={switchCamera}
                className="cursor-pointer pointer-events-auto inline-flex items-center justify-center h-14 w-14 rounded-full
                           bg-white/20 border border-white/30
                           shadow-[0_10px_30px_rgba(0,0,0,0.55)]
                           hover:bg-white/30 active:scale-95 transition"
                aria-label="Switch camera"
              >
                <SwitchIcon className="h-7 w-7" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
