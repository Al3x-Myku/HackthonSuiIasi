import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSuiClientQuery, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import VerificationModal from "../components/VerificationModal";

// Helper to shorten wallet address
const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

// --- MM helpers ---
const mm = (n: number) => `${n}mm`;

// Reusable copy button with "Copied!" tooltip
function CopyButton({
  value,
  ariaLabel,
  disabled,
}: {
  value: string;
  ariaLabel: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  if (disabled) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-white/10
                   bg-[#243047]/50 hover:bg-[#243047] text-[#93a5c8] hover:text-white transition-colors cursor-pointer"
        style={{ height: mm(10), width: mm(10) }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1100);
          } catch {
            alert("Could not copy.");
          }
        }}
        aria-label={ariaLabel}
        title="Copy"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
          content_copy
        </span>
      </button>

      {copied && (
        <div
          className="pointer-events-none absolute right-0 rounded-lg border border-white/10 bg-black/75 backdrop-blur text-white shadow-lg"
          style={{ top: `-${mm(10)}`, padding: `${mm(1)} ${mm(2.2)}`, fontSize: "12px" }}
        >
          Copied!
        </div>
      )}
    </div>
  );
}

const ProofPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isVerificationOpen, setIsVerificationOpen] = React.useState(false);

  const { data: objectData, isPending, error } = useSuiClientQuery(
    "getObject",
    {
      id: id || "",
      options: { showContent: true, showDisplay: true, showType: true, showOwner: true },
    },
    { enabled: !!id }
  );

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111722] text-white">
        Loading Proof...
      </div>
    );

  if (error || !objectData?.data)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111722] text-white">
        Proof not found
      </div>
    );

  const content =
    objectData.data.content?.dataType === "moveObject"
      ? (objectData.data.content.fields as any)
      : null;

  const display = objectData.data.display?.data;
  const imageUrl =
    display?.image_url ||
    `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${content?.blob_id}`;

  // --- Derived image metadata (best-effort) ---
  const [imgMeta, setImgMeta] = React.useState<{
    width?: number;
    height?: number;
    mime?: string;
    bytes?: number;
  }>({});

  React.useEffect(() => {
    let alive = true;

    // Dimensions
    try {
      const img = new Image();
      img.onload = () => {
        if (!alive) return;
        setImgMeta((p) => ({ ...p, width: img.naturalWidth, height: img.naturalHeight }));
      };
      img.src = imageUrl;
    } catch {
      // ignore
    }

    // Content-Type / Content-Length (may fail due to CORS depending on the blob gateway)
    (async () => {
      try {
        const res = await fetch(imageUrl, { method: "HEAD" });
        if (!res.ok) return;
        const mime = res.headers.get("content-type") || undefined;
        const len = res.headers.get("content-length");
        const bytes = len ? Number(len) : undefined;
        if (!alive) return;
        setImgMeta((p) => ({ ...p, mime, bytes }));
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, [imageUrl]);

  const rawLocation = String(content?.location || "");
  const hasKnownLocation =
    rawLocation.length > 0 && rawLocation !== "Unknown Location" && rawLocation !== "Location Denied";

  const imageHash = String(content?.image_hash || "");
  const objectId = String(id || "");
  const typeStr = String(objectData.data.type || "truth_lens::MediaProof");

  // --- MM layout constants ---
  const GAP = 4;
  const PAD = 4;
  const OUTER_PX = 5;

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white">
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#243047] bg-[#111722]/90 backdrop-blur-md"
        style={{ padding: `${mm(2.2)} ${mm(4.5)}` }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-white cursor-pointer" onClick={() => navigate("/")}>
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: "30px" }}>
                photo_filter
              </span>
            </div>
            <h2 className="text-white text-base sm:text-lg font-bold leading-tight tracking-tight">
              TruthLens
            </h2>
          </div>

          <nav className="hidden md:flex items-center" style={{ gap: mm(6) }}>
            <a
              className="text-[#93a5c8] hover:text-white transition-colors text-sm font-medium leading-normal"
              href="#"
              onClick={() => navigate("/gallery")}
            >
              Dashboard
            </a>
            <a
              className="text-[#93a5c8] hover:text-white transition-colors text-sm font-medium leading-normal"
              href="#"
              onClick={() => navigate("/feed")}
            >
              Feed
            </a>
            <a
              className="text-[#93a5c8] hover:text-white transition-colors text-sm font-medium leading-normal"
              href="#"
              onClick={() => navigate("/camera")}
            >
              Upload
            </a>
            <a
              className="text-[#93a5c8] hover:text-white transition-colors text-sm font-medium leading-normal"
              href="#"
              onClick={() => navigate("/profile")}
            >
              Gallery
            </a>
          </nav>
        </div>

        <div className="flex flex-1 justify-end items-center" style={{ gap: mm(4) }}>
          {account && (
            <div className="flex items-center" style={{ gap: mm(3) }}>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155]">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-mono text-[#94a3b8]">{shortenAddress(account.address)}</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium cursor-pointer"
                style={{ padding: `${mm(1.5)} ${mm(3)}` }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  logout
                </span>
                <span className="hidden md:inline">Disconnect</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1" style={{ paddingBottom: mm(8) }}>
        <div className="layout-container flex flex-col w-full max-w-[1440px] mx-auto min-h-full">
          <div
            className="px-4 sm:px-6 lg:px-14 xl:px-24 flex flex-1 justify-center"
            style={{ paddingTop: mm(OUTER_PX), paddingBottom: mm(OUTER_PX) }}
          >
            <div className="layout-content-container flex flex-col w-full flex-1" style={{ gap: mm(4) }}>
              {/* Breadcrumbs & Heading */}
              <div className="flex flex-col" style={{ gap: mm(1.5) }}>
                <div className="flex flex-wrap items-center text-sm" style={{ gap: mm(1.5) }}>
                  <span className="text-[#93a5c8] hover:text-white transition-colors cursor-pointer" onClick={() => navigate("/")}>
                    Home
                  </span>
                  <span className="text-[#64748b]">/</span>
                  <span className="text-[#93a5c8] hover:text-white transition-colors cursor-pointer" onClick={() => navigate("/")}>
                    Proofs
                  </span>
                  <span className="text-[#64748b]">/</span>
                  <span className="text-primary font-medium">Proof #{id?.slice(0, 6)}...</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center" style={{ gap: mm(3) }}>
                  <div>
                    <div className="flex items-center flex-wrap" style={{ gap: mm(3) }}>
                      <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                        Proof #{id?.slice(0, 8)}
                      </h1>

                      <span
                        className="inline-flex items-center gap-2 rounded-full bg-black/40 border border-white/10 text-xs font-bold tracking-wide uppercase"
                        style={{ padding: `${mm(1.2)} ${mm(3)}` }}
                      >
                        <span className="material-symbols-outlined text-green-400" style={{ fontSize: "18px" }}>
                          check_circle
                        </span>
                        Verified
                      </span>

                      <span
                        className="inline-flex items-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                        style={{ padding: `${mm(0.8)} ${mm(2)}` }}
                      >
                        <span className="material-symbols-outlined mr-1" style={{ fontSize: "14px" }}>
                          verified
                        </span>
                        On-Chain Verified
                      </span>

                      <span className="text-[#93a5c8] text-sm">
                        Created {new Date(Number(content?.timestamp)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex" style={{ gap: mm(3) }}>
                    <button
                      className="flex items-center gap-2 cursor-pointer rounded-lg bg-[#243047] hover:bg-[#2d3b55] text-white text-sm font-bold transition-colors"
                      style={{ height: mm(11), padding: `0 ${mm(4)}` }}
                      onClick={async () => {
                        const shareUrl = window.location.href;
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: `TruthLens Proof #${id?.slice(0, 8)}`,
                              text: "Check out this verified proof on TruthLens!",
                              url: shareUrl,
                            });
                          } catch {
                            // ignore
                          }
                        } else {
                          await navigator.clipboard.writeText(shareUrl);
                          alert("Link copied to clipboard!");
                        }
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        share
                      </span>
                      Share
                    </button>

                    <button
                      className="flex items-center gap-2 cursor-pointer rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-[0_0_15px_rgba(23,84,207,0.3)]"
                      style={{ height: mm(11), padding: `0 ${mm(4)}` }}
                      onClick={() => {
                        const certificateText = `
╔═══════════════════════════════════════════════════════════════════╗
║                    TRUTHLENS VERIFICATION CERTIFICATE             ║
╠═══════════════════════════════════════════════════════════════════╣
║  PROOF ID: ${id}
║  STATUS: ✓ VERIFIED ON SUI BLOCKCHAIN
║  TIMESTAMP: ${new Date(Number(content?.timestamp)).toISOString()}
║  LOCATION: ${content?.location || "Unknown"}
║  DEVICE: ${content?.device_type || "Unknown"}
║  SHA-256 HASH: ${content?.image_hash || "N/A"}
║  WALRUS BLOB ID: ${content?.blob_id || "N/A"}
║  EXPLORER: https://suiscan.xyz/testnet/object/${id}
╚═══════════════════════════════════════════════════════════════════╝
`;
                        const blob = new Blob([certificateText], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `TruthLens_Certificate_${id?.slice(0, 8)}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        download
                      </span>
                      Export Certificate
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: mm(GAP), gridAutoRows: "min-content" }}>
                {/* Image (span 2) */}
                <div className="glass-panel rounded-xl shadow-2xl overflow-hidden lg:col-span-2">
                  <div style={{ padding: mm(PAD) }} className="bg-black/25 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt={content?.description}
                      className="block rounded-lg object-contain"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "62vh",
                        height: "auto",
                        width: "auto",
                        boxShadow: "0 14px 50px rgba(0,0,0,0.55)",
                      }}
                    />
                  </div>
                </div>

                {/* Certificate */}
                <div className="glass-panel rounded-xl flex flex-col">
                  <div style={{ padding: mm(PAD) }} className="flex flex-col">
                    <div className="flex items-center" style={{ gap: mm(3), paddingBottom: mm(3) }}>
                      <div className="rounded-xl bg-green-500/20 flex items-center justify-center" style={{ width: mm(12), height: mm(12) }}>
                        <span className="material-symbols-outlined text-green-400" style={{ fontSize: "22px" }}>
                          verified
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">Authenticity Certificate</h3>
                        <p className="text-xs text-[#93a5c8]">Captured via TruthLens</p>
                      </div>
                    </div>

                    <div className="border-b border-white/10" style={{ marginBottom: mm(3) }} />

                    <div className="flex flex-col" style={{ gap: mm(3) }}>
                      <div>
                        <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Captured By</label>
                        <div className="flex items-center" style={{ gap: mm(2), marginTop: mm(2) }}>
                          <div className="rounded-full bg-primary/20 flex items-center justify-center" style={{ width: mm(8), height: mm(8) }}>
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>
                              person
                            </span>
                          </div>
                          <span className="text-white font-medium">
                            {objectData.data.owner &&
                            typeof objectData.data.owner === "object" &&
                            "AddressOwner" in objectData.data.owner
                              ? shortenAddress((objectData.data.owner as any).AddressOwner)
                              : "You"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Timestamp</label>
                        <p className="text-white font-mono text-sm" style={{ marginTop: mm(2) }}>
                          {new Date(Number(content?.timestamp)).toLocaleString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Object ID</label>
                        <div
                          className="bg-[#0d1526] rounded-lg border border-[#334155] font-mono text-xs text-[#93a5c8] break-all"
                          style={{ padding: mm(3), marginTop: mm(2) }}
                        >
                          {objectId}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Contract Type</label>
                        <div
                          className="bg-[#0d1526] rounded-lg border border-[#334155] font-mono text-xs text-[#93a5c8] break-all"
                          style={{ padding: mm(3), marginTop: mm(2) }}
                        >
                          {typeStr}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10" style={{ marginTop: mm(4), paddingTop: mm(3) }} />

                    <div className="flex flex-col" style={{ gap: mm(3) }}>
                      <a
                        href={`https://suiscan.xyz/testnet/object/${id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#243047]/50 hover:bg-[#243047] border border-[#334155] text-white font-medium transition-colors"
                        style={{ padding: `${mm(3)} ${mm(4)}` }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          open_in_new
                        </span>
                        View on Explorer
                      </a>

                      <button
                        onClick={() => setIsVerificationOpen(true)}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors shadow-[0_0_20px_rgba(23,84,207,0.3)] cursor-pointer"
                        style={{ padding: `${mm(3)} ${mm(4)}` }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          verified_user
                        </span>
                        View Full Proof
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chain (span 2) */}
                <section className="glass-panel rounded-xl relative lg:col-span-2" style={{ padding: mm(PAD) }}>
                  <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-md"></div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ marginBottom: mm(3) }}>
                    <span className="material-symbols-outlined text-primary">history</span>
                    Chain of Custody
                  </h3>

                  <div className="relative pl-4 border-l border-[#243047] ml-2" style={{ gap: mm(4), display: "grid" }}>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 size-3 bg-[#243047] border-2 border-[#93a5c8] rounded-full"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between" style={{ gap: mm(2) }}>
                        <div>
                          <h4 className="text-white font-medium">Image Captured</h4>
                          <p className="text-[#93a5c8] text-sm" style={{ marginTop: mm(1) }}>
                            Original raw file created by trusted hardware.
                          </p>
                        </div>
                        <div className="font-mono text-xs text-[#93a5c8] bg-[#243047]/50 px-2 py-1 rounded">
                          {new Date(Number(content?.timestamp)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 size-3 bg-[#243047] border-2 border-[#93a5c8] rounded-full"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between" style={{ gap: mm(2) }}>
                        <div>
                          <h4 className="text-white font-medium">Cryptographic Signing</h4>
                          <p className="text-[#93a5c8] text-sm" style={{ marginTop: mm(1) }}>
                            Signed with device-unique private key.
                          </p>
                        </div>
                        <div className="font-mono text-xs text-[#93a5c8] bg-[#243047]/50 px-2 py-1 rounded">
                          {new Date(Number(content?.timestamp) + 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 size-3 bg-primary border-2 border-primary shadow-[0_0_10px_#1754cf] rounded-full animate-pulse"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between" style={{ gap: mm(2) }}>
                        <div>
                          <h4 className="text-white font-medium flex items-center gap-2">
                            Authenticated on Sui Network
                            <span className="material-symbols-outlined text-green-400" style={{ fontSize: "16px" }}>
                              verified_user
                            </span>
                          </h4>
                          <p className="text-[#93a5c8] text-sm" style={{ marginTop: mm(1) }}>
                            Proof anchored to blockchain.
                          </p>
                        </div>
                        <div className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">
                          {new Date(Number(content?.timestamp) + 5000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tech (right, row 2 col 3) */}
                <section className="glass-panel rounded-xl relative overflow-hidden" style={{ padding: mm(PAD) }}>
                  <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-md"></div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ marginBottom: mm(3) }}>
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    Tech Details
                  </h3>

                  <div style={{ marginBottom: mm(4) }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: mm(2) }}>
                      <label className="text-xs font-semibold text-[#93a5c8] uppercase tracking-wider">SHA-256 Hash</label>
                      <CopyButton value={imageHash} ariaLabel="Copy SHA-256 hash" disabled={!imageHash} />
                    </div>
                    <div className="bg-[#111722] rounded-lg border border-white/5 font-mono text-xs text-[#93a5c8] break-all" style={{ padding: mm(3) }}>
                      {imageHash || "Loading..."}
                    </div>
                  </div>

                  <div style={{ marginBottom: mm(4) }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: mm(2) }}>
                      <label className="text-xs font-semibold text-[#93a5c8] uppercase tracking-wider">Object ID</label>
                      <CopyButton value={objectId} ariaLabel="Copy object id" disabled={!objectId} />
                    </div>
                    <div className="bg-[#111722] rounded-lg border border-white/5 font-mono text-xs text-[#93a5c8] break-all" style={{ padding: mm(3) }}>
                      {objectId}
                    </div>
                  </div>

                  <div className="border-t border-white/10" style={{ paddingTop: mm(3), marginTop: mm(3) }} />

                  <div className="flex flex-col" style={{ gap: mm(3) }}>
                    <a
                      className="w-full flex items-center justify-between rounded-xl bg-[#243047]/35 hover:bg-[#243047]/70 transition-colors border border-white/10 group"
                      style={{ padding: mm(4) }}
                      href={`https://suiscan.xyz/testnet/object/${id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="text-sm text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                          open_in_new
                        </span>
                        View on Sui Explorer
                      </span>
                      <span className="material-symbols-outlined text-[#93a5c8] group-hover:translate-x-1 transition-transform" style={{ fontSize: "18px" }}>
                        arrow_forward
                      </span>
                    </a>

                    <button
                      className="w-full flex items-center justify-between rounded-xl bg-[#243047]/35 hover:bg-[#243047]/70 transition-colors border border-white/10 group cursor-pointer"
                      style={{ padding: mm(4) }}
                      onClick={() => setIsVerificationOpen(true)}
                    >
                      <span className="text-sm text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                          policy
                        </span>
                        Validator Signature
                      </span>
                      <span className="material-symbols-outlined text-[#93a5c8] group-hover:translate-x-1 transition-transform" style={{ fontSize: "18px" }}>
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </section>

                {/* Row 3 - Location */}
                <div className="glass-panel rounded-xl flex flex-col" style={{ padding: mm(PAD), gap: mm(3) }}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#93a5c8]">location_on</span>
                      Location Data
                    </h4>
                    <span className="text-xs text-[#93a5c8] border border-[#243047] rounded" style={{ padding: `${mm(1)} ${mm(2)}` }}>
                      {hasKnownLocation ? "Recorded" : "Unavailable"}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0d1526]" style={{ padding: mm(3) }}>
                    <div className="flex items-start justify-between" style={{ gap: mm(3) }}>
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wider text-[#64748b]">Coordinates</div>
                        <div className="mt-2 font-mono text-sm text-white break-words">
                          {hasKnownLocation ? rawLocation : "Unknown Location"}
                        </div>
                        <div className="mt-2 text-xs text-[#93a5c8]">Stored at capture time (client-side geolocation).</div>
                      </div>
                      <CopyButton value={rawLocation} ariaLabel="Copy location" disabled={!hasKnownLocation} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#93a5c8]">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      satellite_alt
                    </span>
                    <span>GPS</span>
                  </div>
                </div>

                {/* Row 3 - Capture */}
                <div className="glass-panel rounded-xl flex flex-col" style={{ padding: mm(PAD), gap: mm(3) }}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#93a5c8]">shutter_speed</span>
                      Capture Settings
                    </h4>
                  </div>

                  <div className="grid grid-cols-2" style={{ gap: mm(3) }}>
                    <div className="bg-[#243047]/30 rounded-lg border border-white/5" style={{ padding: mm(3) }}>
                      <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">Device</p>
                      <p className="text-white font-mono text-sm break-words">{String(content?.device_type || "Unknown")}</p>
                    </div>
                    <div className="bg-[#243047]/30 rounded-lg border border-white/5" style={{ padding: mm(3) }}>
                      <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">Dimensions</p>
                      <p className="text-white font-mono text-sm">
                        {imgMeta.width && imgMeta.height ? `${imgMeta.width}×${imgMeta.height}` : "Unknown"}
                      </p>
                    </div>
                    <div className="bg-[#243047]/30 rounded-lg border border-white/5" style={{ padding: mm(3) }}>
                      <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">File Type</p>
                      <p className="text-white font-mono text-sm break-words">{imgMeta.mime || "Unknown"}</p>
                    </div>
                    <div className="bg-[#243047]/30 rounded-lg border border-white/5" style={{ padding: mm(3) }}>
                      <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">File Size</p>
                      <p className="text-white font-mono text-sm">
                        {typeof imgMeta.bytes === "number" && !Number.isNaN(imgMeta.bytes)
                          ? `${(imgMeta.bytes / 1024).toFixed(1)} KB`
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 3 - Verification Guarantee back in bottom-right */}
                <div
                  className="rounded-xl bg-gradient-to-br from-primary/18 to-transparent border border-primary/20 flex items-start"
                  style={{ padding: mm(PAD) }}
                >
                  <span className="material-symbols-outlined text-primary" style={{ marginTop: "1px", marginRight: mm(3), fontSize: "20px" }}>
                    info
                  </span>
                  <div className="min-w-0">
                    <h5 className="text-white font-bold text-sm leading-tight">Verification Guarantee</h5>
                    <p className="text-[#93a5c8] text-xs leading-relaxed" style={{ marginTop: mm(1.5), fontSize: "25px" }}>
                      Cryptographically signed at capture and immutably recorded on the Sui blockchain.
                    </p>
                  </div>
                </div>
              </div>

              <VerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} proofId={id || ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofPage;
