import React from 'react';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    onDelete?: (item: any) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, item, onDelete }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-5xl bg-[#0d1526] rounded-2xl overflow-hidden border border-[#334155] shadow-2xl flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Image Section */}
                <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-hidden">
                    <img
                        src={item.src}
                        alt={item.title}
                        className="max-w-full max-h-[80vh] object-contain"
                    />
                </div>

                {/* Details Section */}
                <div className="w-full md:w-96 bg-[#0d1526] p-6 flex flex-col border-l border-[#334155] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        {item.verified && (
                            <div className="bg-verified/20 border border-verified/30 px-3 py-1 rounded-full flex items-center gap-2">
                                <span className="material-symbols-outlined text-verified text-[18px]">verified</span>
                                <span className="text-verified text-xs font-bold uppercase tracking-wide">Verified Proof</span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                    <p className="text-[#94a3b8] text-sm mb-6">{item.description || "No description provided."}</p>

                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Captured By</label>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500"></div>
                                <span className="text-white font-mono text-sm truncate">{item.user}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Timestamp</label>
                            <p className="text-white text-sm font-mono">
                                {new Date(Number(item.timestamp)).toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Object ID</label>
                            <p className="text-white text-xs font-mono break-all bg-[#1e293b] p-2 rounded border border-[#334155]">
                                {item.id}
                            </p>
                        </div>

                        {item.objectType && (
                            <div>
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Contract Type</label>
                                <p className="text-[#94a3b8] text-[10px] font-mono break-all">
                                    {item.objectType}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-[#334155]">
                        <a
                            href={`https://suiscan.xyz/testnet/object/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl transition-colors mb-3 font-medium"
                        >
                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            View on Explorer
                        </a>

                        <button
                            onClick={() => window.location.href = `/proof/${item.id}`}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors mb-3 font-medium shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-[20px]">verified</span>
                            View Full Proof
                        </button>

                        {onDelete && (
                            <button
                                onClick={() => onDelete(item)}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all font-bold uppercase tracking-wide"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                Delete NFT
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
