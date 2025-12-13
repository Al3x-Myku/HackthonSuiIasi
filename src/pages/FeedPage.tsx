import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";

// Helper to shorten wallet address
const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const FeedPage: React.FC = () => {
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
            <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate("/gallery")}>Dashboard</a>
            <a className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal" href="#">Feed</a>
            <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate("/camera")}>Upload</a>
            <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate("/profile")}>Gallery</a>
          </div>

          {/* Wallet Address & Disconnect */}
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

      {/* Empty for now */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="rounded-2xl border border-white/10 bg-[#0b1220]/40 backdrop-blur p-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">rss_feed</span>
              <h1 className="text-2xl font-bold text-white">Feed</h1>
            </div>
            <p className="text-[#94a3b8]">Coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedPage;
