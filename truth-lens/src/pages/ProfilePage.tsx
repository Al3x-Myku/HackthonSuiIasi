import React from 'react';
import { useCurrentAccount, useSuiClientQuery, ConnectButton } from '@mysten/dapp-kit';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const account = useCurrentAccount();
    const navigate = useNavigate();

    const { data: ownedObjects } = useSuiClientQuery(
        'getOwnedObjects',
        {
            owner: account?.address || '',
            filter: { StructType: '0x0::provenance::MediaProof' },
            options: { showContent: true, showDisplay: true },
        },
        { enabled: !!account }
    );

    return (
        <div className="flex flex-col min-h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            {/* Header */}
            <header className="glass-panel sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-6 py-3 border-b-0 border-b-[#243047]/50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-white cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center justify-center size-8 text-primary">
                            <span className="material-symbols-outlined text-[32px]">photo_filter</span>
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] uppercase">TruthLens</h2>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="items-center hidden gap-6 lg:flex">
                        <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/')}>Gallery</a>
                        <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/camera')}>Upload</a>
                        <a className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal" href="#">My Profile</a>
                    </div>
                    <ConnectButton className="!bg-primary !text-white !font-bold !rounded-lg !px-4 !py-2 !h-10 !flex !items-center !gap-2 hover:!bg-primary/90 transition-colors shadow-lg shadow-primary/20" />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col items-center justify-center mb-12">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent-green flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-4xl text-white">person</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Collection</h1>
                        <p className="text-[#94a3b8] font-mono text-sm bg-[#1e293b] px-3 py-1 rounded-full border border-[#334155]">
                            {account ? account.address : 'Please connect your wallet'}
                        </p>
                    </div>

                    {account ? (
                        <div className="gap-6 space-y-6 columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
                            {/* Placeholder for when we have real data */}
                            {(!ownedObjects || ownedObjects.data.length === 0) && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#64748b]">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-50">image_not_supported</span>
                                    <p className="text-lg font-medium">No verified media found</p>
                                    <button
                                        onClick={() => navigate('/camera')}
                                        className="mt-6 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                                    >
                                        Capture New Media
                                    </button>
                                </div>
                            )}

                            {/* Map owned objects here */}
                            {ownedObjects?.data.map((obj) => (
                                <div key={obj.data?.objectId} className="break-inside-avoid bg-surface-dark rounded-2xl p-4 border border-white/10">
                                    <p className="text-white">Object ID: {obj.data?.objectId}</p>
                                    {/* Display object content */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <p className="text-[#94a3b8] text-lg mb-6">Connect your wallet to view your collection</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
