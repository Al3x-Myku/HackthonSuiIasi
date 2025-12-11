import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PreviewPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { imageSrc, hash, blob } = location.state || {};
    const [isMinting, setIsMinting] = useState(false);
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const account = useCurrentAccount();

    if (!imageSrc) {
        navigate('/camera');
        return null;
    }

    const handleMint = async () => {
        if (!account) return;
        setIsMinting(true);

        try {
            // 1. Upload to Walrus
            // Use the publisher node for uploads with the correct /v1/blobs endpoint
            const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5', {
                method: 'PUT',
                body: blob,
            });

            if (!response.ok) {
                throw new Error(`Walrus upload failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different response structures if necessary, but standard is newlyCreated.blobObject.blobId
            let blobId;
            if (data.newlyCreated && data.newlyCreated.blobObject && data.newlyCreated.blobObject.blobId) {
                blobId = data.newlyCreated.blobObject.blobId;
            } else if (data.alreadyCertified && data.alreadyCertified.blobId) {
                blobId = data.alreadyCertified.blobId;
            } else {
                console.error("Unexpected Walrus response:", data);
                throw new Error("Invalid response from Walrus");
            }

            // 2. Mint NFT
            const tx = new Transaction();
            // Address of the deployed contract
            // Address of the deployed contract
            const PACKAGE_ID = '0x296c6caf0f41bebafa00148f9417a9d3cf43d61e32925606fef950938d51bef7';

            tx.moveCall({
                target: `${PACKAGE_ID}::truth_lens::mint_proof`,
                arguments: [
                    tx.pure.string(hash),          // image_hash
                    tx.pure.string(blobId),        // blob_id
                    tx.pure.u64(Date.now()),       // timestamp
                    tx.pure.string('Unknown'),     // location (placeholder)
                    tx.pure.string('Webcam'),      // device_type
                    tx.pure.string('Captured via TruthLens'), // description
                ],
            });

            signAndExecuteTransaction({
                transaction: tx,
            }, {
                onSuccess: () => {
                    console.log('Minted successfully');
                    navigate('/');
                },
                onError: (err) => {
                    console.error('Minting failed:', err);
                    setIsMinting(false);
                }
            });

        } catch (error) {
            console.error('Error minting:', error);
            setIsMinting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/camera')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Back</span>
                    </button>
                </div>
                <h1 className="text-xl font-bold tracking-tight">Preview Capture</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Preview */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
                    </div>

                    {/* Details & Actions */}
                    <div className="flex flex-col gap-6 justify-center">
                        <div className="p-6 rounded-2xl bg-surface-dark border border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Cryptographic Proof</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">SHA-256 HASH</label>
                                    <div className="font-mono text-xs text-accent-green break-all bg-black/30 p-3 rounded border border-accent-green/20">
                                        {hash}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">TIMESTAMP</label>
                                    <div className="font-mono text-sm text-white">
                                        {new Date().toISOString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleMint}
                            disabled={isMinting}
                            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isMinting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                    <span>Minting Proof...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">verified</span>
                                    <span>Confirm & Mint Proof</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PreviewPage;
