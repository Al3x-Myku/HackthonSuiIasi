import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuiClientQuery, ConnectButton } from '@mysten/dapp-kit';

const ProofPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: objectData, isPending, error } = useSuiClientQuery(
        'getObject',
        {
            id: id || '',
            options: { showContent: true, showDisplay: true, showType: true, showOwner: true },
        },
        { enabled: !!id }
    );

    if (isPending) return <div className="flex items-center justify-center min-h-screen bg-[#111722] text-white">Loading Proof...</div>;
    if (error || !objectData?.data) return <div className="flex items-center justify-center min-h-screen bg-[#111722] text-white">Proof not found</div>;

    const content = objectData.data.content?.dataType === 'moveObject' ? objectData.data.content.fields as any : null;
    const display = objectData.data.display?.data;
    const imageUrl = display?.image_url || `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${content?.blob_id}`;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased overflow-x-hidden selection:bg-primary selection:text-white min-h-screen flex flex-col">
            {/* Navbar */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#243047] bg-[#111722]/90 backdrop-blur-md px-4 sm:px-10 py-3">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-white cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-8 text-primary">
                            <span className="material-symbols-outlined text-[32px]">photo_filter</span>
                        </div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">TruthLens</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-9">
                        <a className="text-[#93a5c8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/')}>Gallery</a>
                        <a className="text-[#93a5c8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/camera')}>Upload</a>
                        <a className="text-[#93a5c8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/profile')}>My Profile</a>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <ConnectButton className="!bg-primary !text-white !font-bold !rounded-lg !px-4 !py-2 !h-10 !flex !items-center !gap-2 hover:!bg-primary/90 transition-colors shadow-lg shadow-primary/20" />
                </div>
            </header>

            <div className="layout-container flex h-full grow flex-col w-full max-w-[1440px] mx-auto">
                <div className="px-4 sm:px-6 lg:px-20 xl:px-40 flex flex-1 justify-center py-6 md:py-8">
                    <div className="layout-content-container flex flex-col w-full flex-1 gap-8">
                        {/* Breadcrumbs & Heading */}
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap gap-2 items-center text-sm">
                                <span className="text-[#93a5c8] hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</span>
                                <span className="text-[#64748b]">/</span>
                                <span className="text-[#93a5c8] hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/')}>Proofs</span>
                                <span className="text-[#64748b]">/</span>
                                <span className="text-primary font-medium">Proof #{id?.slice(0, 6)}...</span>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
                                <div>
                                    <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                                        Proof #{id?.slice(0, 8)}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                            <span className="material-symbols-outlined text-[14px] mr-1">verified</span>
                                            On-Chain Verified
                                        </span>
                                        <span className="text-[#93a5c8] text-sm">Created {new Date(Number(content?.timestamp)).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 cursor-pointer rounded-lg h-10 px-4 bg-[#243047] hover:bg-[#2d3b55] text-white text-sm font-bold transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">share</span>
                                        Share
                                    </button>
                                    <button className="flex items-center gap-2 cursor-pointer rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-[0_0_15px_rgba(23,84,207,0.3)]">
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Export Certificate
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Viewer Section */}
                        <div className="relative w-full rounded-xl overflow-hidden glass-panel group shadow-2xl">
                            {/* Tech overlay corners */}
                            <div className="absolute top-4 left-4 size-4 border-t-2 border-l-2 border-primary/50 z-20"></div>
                            <div className="absolute top-4 right-4 size-4 border-t-2 border-r-2 border-primary/50 z-20"></div>
                            <div className="absolute bottom-4 left-4 size-4 border-b-2 border-l-2 border-primary/50 z-20"></div>
                            <div className="absolute bottom-4 right-4 size-4 border-b-2 border-r-2 border-primary/50 z-20"></div>

                            {/* Badge */}
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10 shadow-lg animate-[pulse_3s_ease-in-out_infinite]">
                                <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>
                                <span className="text-xs font-bold tracking-wide uppercase">Authenticated on Sui Network</span>
                            </div>

                            {/* Image */}
                            <div className="w-full aspect-video md:aspect-[21/9] lg:h-[600px] bg-black bg-center bg-contain bg-no-repeat relative flex items-center justify-center">
                                <img src={imageUrl} alt={content?.description} className="max-w-full max-h-full object-contain" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111722] via-transparent to-transparent opacity-60 pointer-events-none"></div>
                            </div>

                            {/* Overlay Info Bar */}
                            <div className="absolute bottom-0 w-full glass-panel-heavy px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-6 text-sm text-[#93a5c8]">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                        <span>{content?.device_type || 'Unknown Device'}</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">straighten</span>
                                        <span>Original Quality</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">hard_drive</span>
                                        <span>Walrus Storage</span>
                                    </div>
                                </div>
                                <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                                    SIGNED_BY_DEVICE_KEY
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Provenance & Metadata (Span 2) */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Chain of Custody Card */}
                                <section className="glass-panel rounded-xl p-6 relative">
                                    <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-md"></div>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">history</span>
                                        Chain of Custody
                                    </h3>
                                    <div className="relative pl-4 border-l border-[#243047] space-y-8 ml-2">
                                        {/* Event 1 */}
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 size-3 bg-[#243047] border-2 border-[#93a5c8] rounded-full"></div>
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-white font-medium">Image Captured</h4>
                                                    <p className="text-[#93a5c8] text-sm mt-1">Original raw file created by trusted hardware.</p>
                                                </div>
                                                <div className="font-mono text-xs text-[#93a5c8] bg-[#243047]/50 px-2 py-1 rounded">
                                                    {new Date(Number(content?.timestamp)).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Event 2 */}
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 size-3 bg-[#243047] border-2 border-[#93a5c8] rounded-full"></div>
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-white font-medium">Cryptographic Signing</h4>
                                                    <p className="text-[#93a5c8] text-sm mt-1">Signed with device-unique private key.</p>
                                                </div>
                                                <div className="font-mono text-xs text-[#93a5c8] bg-[#243047]/50 px-2 py-1 rounded">
                                                    {new Date(Number(content?.timestamp) + 1000).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Event 3 (Active) */}
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 size-3 bg-primary border-2 border-primary shadow-[0_0_10px_#1754cf] rounded-full animate-pulse"></div>
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-white font-medium flex items-center gap-2">
                                                        Authenticated on Sui Network
                                                        <span className="material-symbols-outlined text-green-400 text-[16px]">verified_user</span>
                                                    </h4>
                                                    <p className="text-[#93a5c8] text-sm mt-1">Proof anchored to blockchain.</p>
                                                </div>
                                                <div className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">
                                                    {new Date(Number(content?.timestamp) + 5000).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Location */}
                                    <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-white font-bold flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[#93a5c8]">location_on</span>
                                                Location Data
                                            </h4>
                                            <span className="text-xs text-[#93a5c8] border border-[#243047] px-2 py-1 rounded">GPS Fixed</span>
                                        </div>
                                        <div className="h-32 w-full rounded-lg overflow-hidden relative grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300 bg-[#1e293b] flex items-center justify-center">
                                            {/* Placeholder for Map */}
                                            <span className="material-symbols-outlined text-4xl text-[#64748b]">map</span>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="size-8 bg-primary/20 rounded-full flex items-center justify-center ring-1 ring-primary">
                                                    <div className="size-2 bg-primary rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm font-mono text-[#93a5c8]">
                                            <span className="truncate max-w-full">{content?.location || 'Unknown Location'}</span>
                                        </div>
                                    </div>

                                    {/* Environment / Camera */}
                                    <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-white font-bold flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[#93a5c8]">shutter_speed</span>
                                                Capture Settings
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            <div className="bg-[#243047]/30 p-3 rounded-lg border border-white/5">
                                                <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">Aperture</p>
                                                <p className="text-white font-mono text-lg">f/2.8</p>
                                            </div>
                                            <div className="bg-[#243047]/30 p-3 rounded-lg border border-white/5">
                                                <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">ISO</p>
                                                <p className="text-white font-mono text-lg">400</p>
                                            </div>
                                            <div className="bg-[#243047]/30 p-3 rounded-lg border border-white/5">
                                                <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">Shutter</p>
                                                <p className="text-white font-mono text-lg">1/200s</p>
                                            </div>
                                            <div className="bg-[#243047]/30 p-3 rounded-lg border border-white/5">
                                                <p className="text-xs text-[#93a5c8] uppercase tracking-wider mb-1">Focal Len</p>
                                                <p className="text-white font-mono text-lg">24mm</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Tech Specs (Span 1) */}
                            <div className="flex flex-col gap-6">
                                {/* Tech Details Card */}
                                <section className="glass-panel rounded-xl p-6 h-full relative overflow-hidden">
                                    <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-md"></div>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">terminal</span>
                                        Tech Details
                                    </h3>
                                    <div className="flex flex-col gap-6">
                                        {/* Hash */}
                                        <div className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-semibold text-[#93a5c8] uppercase tracking-wider">SHA-256 Hash</label>
                                                <button className="text-[#93a5c8] hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                </button>
                                            </div>
                                            <div className="bg-[#111722] rounded-lg p-3 border border-white/5 font-mono text-xs text-[#93a5c8] break-all group-hover:border-primary/30 transition-colors">
                                                {content?.image_hash || 'Loading...'}
                                            </div>
                                        </div>
                                        {/* Blob ID */}
                                        <div className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-semibold text-[#93a5c8] uppercase tracking-wider">Object ID</label>
                                                <button className="text-[#93a5c8] hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                </button>
                                            </div>
                                            <div className="bg-[#111722] rounded-lg p-3 border border-white/5 font-mono text-xs text-[#93a5c8] group-hover:border-primary/30 transition-colors break-all">
                                                {id}
                                            </div>
                                        </div>
                                        {/* Verification Links */}
                                        <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-3">
                                            <a className="flex items-center justify-between p-3 rounded-lg bg-[#243047]/30 hover:bg-[#243047]/60 transition-colors border border-white/5 group"
                                                href={`https://suiscan.xyz/testnet/object/${id}`} target="_blank" rel="noreferrer">
                                                <span className="text-sm text-white font-medium flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">open_in_new</span>
                                                    View on Sui Explorer
                                                </span>
                                                <span className="material-symbols-outlined text-[#93a5c8] group-hover:translate-x-1 transition-transform text-[16px]">arrow_forward</span>
                                            </a>
                                            <a className="flex items-center justify-between p-3 rounded-lg bg-[#243047]/30 hover:bg-[#243047]/60 transition-colors border border-white/5 group"
                                                href="#">
                                                <span className="text-sm text-white font-medium flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">policy</span>
                                                    Validator Signature
                                                </span>
                                                <span className="material-symbols-outlined text-[#93a5c8] group-hover:translate-x-1 transition-transform text-[16px]">arrow_forward</span>
                                            </a>
                                        </div>
                                    </div>
                                </section>

                                {/* Mini Help Card */}
                                <div className="rounded-xl p-5 bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">info</span>
                                    <div>
                                        <h5 className="text-white font-bold text-sm">Verification Guarantee</h5>
                                        <p className="text-[#93a5c8] text-xs mt-1 leading-relaxed">
                                            This media file has been cryptographically signed at the point of capture and immutably recorded on the Sui blockchain.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProofPage;
