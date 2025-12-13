import React, { useEffect, useState } from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useSuiClient } from '@mysten/dapp-kit';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const account = useCurrentAccount();
    const navigate = useNavigate();
    const suiClient = useSuiClient();
    const [blockHeight, setBlockHeight] = useState<number | null>(null);
    const [totalTxns, setTotalTxns] = useState<number | null>(null);
    const [epoch, setEpoch] = useState<number | null>(null);
    const [isDark, setIsDark] = useState(true);

    // Redirect to gallery if already connected
    useEffect(() => {
        if (account) {
            navigate('/gallery');
        }
    }, [account, navigate]);

    // Fetch blockchain stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const checkpoint = await suiClient.getLatestCheckpointSequenceNumber();
                setBlockHeight(Number(checkpoint));

                // Get latest system state for more info
                const systemState = await suiClient.getLatestSuiSystemState();
                setEpoch(Number(systemState.epoch));

                // Get checkpoint details for transaction count
                const checkpointData = await suiClient.getCheckpoint({ id: checkpoint });
                setTotalTxns(Number(checkpointData.networkTotalTransactions));
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [suiClient]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    // Format large numbers
    const formatNumber = (num: number | null) => {
        if (num === null) return '...';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className={`min-h-screen font-sans antialiased transition-colors duration-200 ${isDark ? 'dark bg-[#0B1121] text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-md ${isDark ? 'border-[#2d3748] bg-[#151e32]/90' : 'border-gray-200 bg-white/90'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">TRUTHLENS</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-primary'}`} href="#">Gallery</a>
                            <a className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-primary'}`} href="#">About</a>
                            <a className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-primary'}`} href="#">Docs</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                                onClick={toggleDarkMode}
                            >
                                <span className="material-symbols-outlined text-lg">{isDark ? 'light_mode' : 'dark_mode'}</span>
                            </button>
                            <ConnectButton className="!bg-primary hover:!bg-primary-hover !text-white !px-5 !py-2 !rounded !font-medium !text-sm !transition-all !shadow-lg !shadow-blue-500/20 !flex !items-center !gap-2" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative min-h-screen flex items-center justify-center pt-16 pb-24 overflow-hidden">
                {/* Grid Background */}
                <div className={`absolute inset-0 pointer-events-none ${isDark ? 'opacity-100' : 'opacity-50'}`} style={{
                    backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Glow Effects */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-12">
                    {/* Left Side - Hero */}
                    <div className="space-y-8 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live on SUI Testnet
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            Verify Reality. <br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse">Mint the Truth.</span>
                        </h1>

                        {/* Description */}
                        <p className={`text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            The decentralized standard for media authenticity. Capture moments, verify their origin with AI, and preserve them forever as immutable NFTs on the blockchain.
                        </p>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                            <div className={`flex flex-col items-center lg:items-start gap-2 p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#151e32] border-[#2d3748]' : 'bg-white border-gray-200'}`}>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} text-primary`}>
                                    <span className="material-symbols-outlined">camera</span>
                                </div>
                                <h3 className="font-semibold">Capture</h3>
                                <p className={`text-sm text-center lg:text-left ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Use our secure camera interface to take authentic photos.</p>
                            </div>
                            <div className={`flex flex-col items-center lg:items-start gap-2 p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#151e32] border-[#2d3748]' : 'bg-white border-gray-200'}`}>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'} text-purple-500`}>
                                    <span className="material-symbols-outlined">psychology</span>
                                </div>
                                <h3 className="font-semibold">AI Verify</h3>
                                <p className={`text-sm text-center lg:text-left ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Instant analysis to detect AI generation or manipulation.</p>
                            </div>
                            <div className={`flex flex-col items-center lg:items-start gap-2 p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#151e32] border-[#2d3748]' : 'bg-white border-gray-200'}`}>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'} text-green-500`}>
                                    <span className="material-symbols-outlined">verified</span>
                                </div>
                                <h3 className="font-semibold">Mint Proof</h3>
                                <p className={`text-sm text-center lg:text-left ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mint a Verified NFT carrying the proof of authenticity.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Panel */}
                    <div className="relative">
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className={`p-8 rounded-2xl shadow-2xl relative z-10 w-full max-w-md mx-auto backdrop-blur-xl ${isDark ? 'bg-[#151e32]/70 border border-white/10' : 'bg-white/80 border border-gray-200'}`}>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connect your wallet to access your gallery and mint new proofs.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Main Connect Button */}
                                <ConnectButton
                                    className={`!w-full !flex !items-center !justify-center !gap-3 !p-4 !rounded-xl !border-2 !border-primary !bg-primary hover:!bg-primary-hover !text-white !font-bold !text-base !transition-all !duration-300 !shadow-lg !shadow-primary/30 hover:!shadow-primary/50 hover:!scale-[1.02]`}
                                />

                                {/* Divider */}
                                <div className="flex items-center gap-4">
                                    <div className={`h-px flex-1 ${isDark ? 'bg-[#2d3748]' : 'bg-gray-200'}`}></div>
                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Live Stats</span>
                                    <div className={`h-px flex-1 ${isDark ? 'bg-[#2d3748]' : 'bg-gray-200'}`}></div>
                                </div>

                                {/* Stats Cards - Real Data */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-[#0d1526] border border-[#2d3748]' : 'bg-gray-50 border border-gray-200'}`}>
                                        <div className="text-xl font-bold text-primary">{formatNumber(totalTxns)}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Txns</div>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-[#0d1526] border border-[#2d3748]' : 'bg-gray-50 border border-gray-200'}`}>
                                        <div className="text-xl font-bold text-green-500">{formatNumber(blockHeight)}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Checkpoints</div>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-[#0d1526] border border-[#2d3748]' : 'bg-gray-50 border border-gray-200'}`}>
                                        <div className="text-xl font-bold text-purple-500">{epoch ?? '...'}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Epoch</div>
                                    </div>
                                </div>

                                {/* Trust badges */}
                                <div className={`flex items-center justify-center gap-4 pt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                                        <span className="text-xs">Secure</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-blue-500">lock</span>
                                        <span className="text-xs">Encrypted</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-purple-500">token</span>
                                        <span className="text-xs">On-Chain</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    By connecting, you agree to our{' '}
                                    <a className="text-primary hover:underline" href="#">Terms of Service</a> and{' '}
                                    <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer - Fixed at bottom, not overlapping */}
            <footer className={`fixed bottom-0 w-full border-t py-4 backdrop-blur-sm z-40 ${isDark ? 'border-[#2d3748] bg-[#0B1121]/90' : 'border-gray-200 bg-white/90'}`}>
                <div className={`max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-6 mb-2 sm:mb-0">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>System Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">block</span>
                            <span>Block: {blockHeight?.toLocaleString() ?? '...'}</span>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <a className="hover:text-primary transition-colors" href="#">Twitter</a>
                        <a className="hover:text-primary transition-colors" href="#">Discord</a>
                        <a className="hover:text-primary transition-colors" href="#">Github</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

