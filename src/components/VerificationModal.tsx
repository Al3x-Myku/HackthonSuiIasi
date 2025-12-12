import React, { useEffect, useState } from 'react';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    proofId: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, proofId }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            const timers = [
                setTimeout(() => setStep(1), 800),  // Fetching
                setTimeout(() => setStep(2), 2000), // Hashing
                setTimeout(() => setStep(3), 3000), // Signature
                setTimeout(() => setStep(4), 4000), // Complete
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-md bg-[#0d1526] rounded-2xl overflow-hidden border border-[#334155] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        Verification Protocol
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Step 1: On-Chain Check */}
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/50 border border-white/5">
                        <div className={`flex items-center justify-center size-8 rounded-full transition-colors ${step >= 1 ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-gray-500'}`}>
                            {step >= 1 ? <span className="material-symbols-outlined text-lg">check</span> : <span className="material-symbols-outlined text-lg animate-spin">sync</span>}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${step >= 1 ? 'text-white' : 'text-gray-400'}`}>Blockchain Anchor</p>
                            <p className="text-xs text-gray-500">Verifying object {proofId.slice(0, 6)}... on Sui</p>
                        </div>
                    </div>

                    {/* Step 2: Hash Check */}
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/50 border border-white/5">
                        <div className={`flex items-center justify-center size-8 rounded-full transition-colors ${step >= 2 ? 'bg-green-500/20 text-green-500' : (step === 1 ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-500')}`}>
                            {step >= 2 ? <span className="material-symbols-outlined text-lg">check</span> : (step === 1 ? <span className="material-symbols-outlined text-lg animate-spin">sync</span> : <span className="material-symbols-outlined text-lg">pending</span>)}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${step >= 2 ? 'text-white' : 'text-gray-400'}`}>Integrity Check</p>
                            <p className="text-xs text-gray-500">Validating SHA-256 image hash</p>
                        </div>
                    </div>

                    {/* Step 3: Signature Check */}
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/50 border border-white/5">
                        <div className={`flex items-center justify-center size-8 rounded-full transition-colors ${step >= 3 ? 'bg-green-500/20 text-green-500' : (step === 2 ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-500')}`}>
                            {step >= 3 ? <span className="material-symbols-outlined text-lg">check</span> : (step === 2 ? <span className="material-symbols-outlined text-lg animate-spin">sync</span> : <span className="material-symbols-outlined text-lg">pending</span>)}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${step >= 3 ? 'text-white' : 'text-gray-400'}`}>Validator Signature</p>
                            <p className="text-xs text-gray-500">Confirming device authenticity</p>
                        </div>
                    </div>
                </div>

                {/* Final Status */}
                <div className={`mt-8 text-center transition-all duration-500 ${step >= 4 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 mb-2">
                        <span className="material-symbols-outlined">verified</span>
                        <span className="font-bold uppercase tracking-wider text-sm">Proof Valid</span>
                    </div>
                    <p className="text-xs text-gray-500">This content is authentic and immutable.</p>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
