import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";

// NOTE: This route is still `/gallery` for now, but the page is the Dashboard.
// (Requested: "Gallery" -> "Dashboard")

const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const StatCard = ({
  title,
  value,
  icon,
  helper,
}: {
  title: string;
  value: string;
  icon: string;
  helper?: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-[#0b1220]/40 backdrop-blur p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-[#94a3b8]">{title}</div>
        <div className="text-3xl font-bold text-white mt-2">{value}</div>
        {helper ? <div className="text-xs text-[#94a3b8] mt-2">{helper}</div> : null}
      </div>
      <div className="size-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-6 py-3 border-b-0 border-b-[#243047]/50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-white cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center size-8 text-primary">
              <span className="material-symbols-outlined text-[32px]">photo_filter</span>
            </div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] uppercase">TruthLens</h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="items-center hidden gap-6 lg:flex">
            <a className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal" href="#">Dashboard</a>
            <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate("/feed")}>Feed</a>
            <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate("/camera")}>Upload</a>
            <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate("/profile")}>Gallery</a>
          </div>

          {account && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155]">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-mono text-[#94a3b8]">{shortenAddress(account.address)}</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Dashboard content only */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-[#94a3b8] mt-1">Quick status and actions.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/camera")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-3 transition-colors"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                Capture / Upload
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 hover:bg-black/30 text-white font-semibold px-4 py-3 transition-colors"
              >
                <span className="material-symbols-outlined">photo_library</span>
                Open Gallery
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Captured proofs" value="—" icon="verified" helper="Hook up indexing later." />
            <StatCard title="On-chain permanence" value="Immutable" icon="lock" helper="Proofs are verifiable forever." />
            <StatCard title="Network" value="Testnet" icon="public" helper="Switchable in provider config." />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1220]/40 backdrop-blur p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">insights</span>
              <h2 className="text-xl font-bold text-white">What&apos;s next</h2>
            </div>
            <ul className="text-[#94a3b8] list-disc pl-5 space-y-1">
              <li>Feed: public proofs and trending content.</li>
              <li>Dashboard stats: real counts from owned objects / indexer.</li>
              <li>More capture metadata surfaced in proof views.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
