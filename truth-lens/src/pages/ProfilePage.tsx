import React from 'react';
import { useCurrentAccount, useSuiClientQuery, ConnectButton, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const account = useCurrentAccount();
    const navigate = useNavigate();

    const { data: ownedObjects } = useSuiClientQuery(
        'getOwnedObjects',
        {
            owner: account?.address || '',
            filter: { StructType: '0x296c6caf0f41bebafa00148f9417a9d3cf43d61e32925606fef950938d51bef7::truth_lens::MediaProof' },
            options: { showContent: true, showDisplay: true },
        },
        { enabled: !!account }
    );

    const items = ownedObjects?.data?.map((obj: any) => {
        const content = obj.data?.content?.fields;
        if (!content) return null;
        return {
            id: obj.data?.objectId,
            type: 'photo',
            src: `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${content.blob_id}`,
            title: content.description || 'Untitled',
            user: 'You',
            verified: true,
            timestamp: content.timestamp
        };
    }).filter(Boolean) || [];

    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const handleBurn = (objectId: string) => {
        const tx = new Transaction();
        tx.moveCall({
            target: '0x296c6caf0f41bebafa00148f9417a9d3cf43d61e32925606fef950938d51bef7::truth_lens::burn',
            arguments: [tx.object(objectId)],
        });

        signAndExecuteTransaction({
            transaction: tx,
        }, {
            onSuccess: () => {
                console.log('Burned successfully');
                window.location.reload();
            },
            onError: (err) => {
                console.error('Burn failed:', err);
            }
        });
    };

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
                            {items.length === 0 && (
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
                            {items.map((item: any) => (
                                <div key={item.id} className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-surface-dark border border-[#334155]/50 hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-lg shadow-black/20 hover:shadow-primary/10">
                                    <div className="absolute top-3 right-3 z-20 bg-[#0b1221]/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 border border-verified/30">
                                        <span className="material-symbols-outlined text-verified text-[16px]">verified</span>
                                        <span className="text-verified text-[10px] font-bold uppercase tracking-wide">Verified</span>
                                    </div>
                                    <img className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" src={item.src} alt={item.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1221] via-[#0b1221]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="mb-1 text-lg font-bold text-white">{item.title}</h3>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-5 h-5 rounded-full border border-white/20 bg-gray-500"></div>
                                                <span className="text-xs font-medium text-white/80">{item.user}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBurn(item.id);
                                                }}
                                                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 rounded-lg transition-colors font-bold text-xs uppercase tracking-wider"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
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
