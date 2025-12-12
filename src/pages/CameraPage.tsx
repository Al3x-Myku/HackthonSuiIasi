import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@mysten/dapp-kit';

const CameraPage: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const navigate = useNavigate();
    const [isCapturing, setIsCapturing] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const [flashOn, setFlashOn] = useState(false);

    const toggleFlash = () => {
        setFlashOn(!flashOn);
        console.log("Flash toggled:", !flashOn);
    };

    const capture = useCallback(async () => {
        if (webcamRef.current) {
            setIsCapturing(true);
            const imageSrc = webcamRef.current.getScreenshot();

            // Capture Geolocation
            let locationData = "Unknown Location";
            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        });
                    });
                    locationData = `${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° W`;
                } catch (error) {
                    console.warn("Geolocation access denied or failed", error);
                    locationData = "Location Denied";
                }
            }

            if (imageSrc) {
                // Convert base64 to blob/buffer for hashing
                const response = await fetch(imageSrc);
                const blob = await response.blob();
                const buffer = await blob.arrayBuffer();
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                navigate('/preview', { state: { imageSrc, hash: hashHex, blob, location: locationData } });
            }
            setIsCapturing(false);
        }
    }, [webcamRef, navigate]);

    const handleUserMediaError = useCallback((error: string | DOMException) => {
        console.error("Camera Error:", error);
        let errorMessage = "Could not access camera.";
        if (typeof error === 'object' && error !== null && 'name' in error) {
            if (error.name === 'NotAllowedError') {
                errorMessage = "Permission denied. Please allow camera access.";
            } else if (error.name === 'NotFoundError') {
                errorMessage = "No camera found.";
            } else if (error.name === 'NotReadableError') {
                errorMessage = "Camera is in use by another application.";
            } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                errorMessage = "Camera requires HTTPS or localhost.";
            }
        }
        setCameraError(errorMessage);
    }, []);

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-camera-bg text-slate-900 dark:text-white font-display">
            {/* Header */}
            <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg size-8 text-primary bg-primary/10 cursor-pointer" onClick={() => navigate('/')}>
                        <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/')}>TruthLens</h1>
                    <span className="bg-gray-200 dark:bg-border-dark text-xs px-2 py-0.5 rounded font-mono text-gray-500 dark:text-gray-400">v1.2.0</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-border-dark/50 border border-transparent dark:border-white/5">
                        <div className="rounded-full size-2 bg-accent-green animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-600 font-mono dark:text-gray-300">Sui Testnet</span>
                    </div>
                    <ConnectButton className="!bg-primary !text-white !font-bold !rounded-lg !px-4 !py-2 !h-10 !flex !items-center !gap-2 hover:!bg-primary-hover transition-colors shadow-lg shadow-primary/20" />
                </div>
            </header>

            {/* Main Content */}
            <main className="relative flex flex-1 overflow-hidden">
                {/* Sidebar (Left - Tools) */}
                <aside className="z-10 flex-col items-center hidden py-6 bg-white border-r border-gray-200 w-16 md:flex gap-6 dark:border-border-dark dark:bg-surface-dark">
                    <button className="relative p-3 transition-all rounded-xl text-primary bg-primary/10 group">
                        <span className="material-symbols-outlined">photo_camera</span>
                    </button>
                    <button className="relative p-3 text-gray-400 transition-all rounded-xl hover:text-white hover:bg-white/5 group">
                        <span className="material-symbols-outlined">videocam</span>
                    </button>
                    <label className="relative p-3 text-gray-400 transition-all rounded-xl hover:text-white hover:bg-white/5 group cursor-pointer">
                        <span className="material-symbols-outlined">upload_file</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const blob = file;
                                    const buffer = await blob.arrayBuffer();
                                    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
                                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        const imageSrc = e.target?.result as string;
                                        navigate('/preview', { state: { imageSrc, hash: hashHex, blob } });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </label>
                </aside>

                {/* Viewfinder Area */}
                <section className="relative flex items-center justify-center flex-1 p-4 overflow-hidden bg-black md:p-8 group">
                    {/* Webcam Feed */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center">
                        {cameraError ? (
                            <div className="text-center text-red-500 bg-black/80 p-6 rounded-xl border border-red-500/50 flex flex-col items-center gap-4 max-w-md">
                                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                                <p>{cameraError}</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.mediaDevices.getUserMedia({ video: true })
                                                .then(() => {
                                                    setCameraError(null);
                                                    window.location.reload();
                                                })
                                                .catch(err => handleUserMediaError(err));
                                        }}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 rounded-lg transition-colors font-medium text-sm"
                                    >
                                        Retry Camera
                                    </button>
                                    <label className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg transition-colors font-medium text-sm cursor-pointer flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const blob = file; // File is a Blob
                                                    const buffer = await blob.arrayBuffer();
                                                    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
                                                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                                                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                                                    // Create a preview URL
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        const imageSrc = e.target?.result as string;
                                                        navigate('/preview', { state: { imageSrc, hash: hashHex, blob } });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode }}
                                onUserMediaError={handleUserMediaError}
                                className="object-cover w-full h-full opacity-80"
                            />
                        )}
                    </div>

                    {/* Viewfinder UI Layer */}
                    <div className="relative flex flex-col justify-between w-full h-full max-w-5xl overflow-hidden shadow-2xl aspect-video border border-white/10 rounded-2xl pointer-events-none">
                        {/* Corner Reticles */}
                        <div className="absolute top-4 left-4 size-8 border-l-2 border-t-2 border-white/50 rounded-tl-lg"></div>
                        <div className="absolute top-4 right-4 size-8 border-r-2 border-t-2 border-white/50 rounded-tr-lg"></div>
                        <div className="absolute bottom-4 left-4 size-8 border-l-2 border-b-2 border-white/50 rounded-bl-lg"></div>
                        <div className="absolute bottom-4 right-4 size-8 border-r-2 border-b-2 border-white/50 rounded-br-lg"></div>

                        {/* Center Focus */}
                        <div className="absolute -translate-x-1/2 -translate-y-1/2 border top-1/2 left-1/2 size-16 border-white/30 rounded-full flex items-center justify-center">
                            <div className="rounded-full size-1 bg-accent-green/80"></div>
                        </div>

                        {/* Scan Animation */}
                        <div className="scan-line"></div>

                        {/* Top Info Bar */}
                        <div className="z-10 flex items-start justify-between p-6 pointer-events-auto">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-lg glass-panel">
                                <div className="bg-red-500 rounded-full size-2 animate-pulse"></div>
                                <span className="text-xs font-bold tracking-wider text-white uppercase">Live Feed</span>
                            </div>
                            <div className="flex flex-col items-end gap-1 px-4 py-3 rounded-lg glass-panel">
                                <div className="flex items-center gap-2 text-accent-green">
                                    <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                                    <span className="text-xs font-bold tracking-widest font-mono">HASH GENERATING</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="z-10 flex flex-col gap-4 p-6 mt-auto pointer-events-auto">
                            <div className="flex items-center justify-between gap-4 p-2 rounded-xl glass-panel">
                                <div className="flex items-center gap-1">
                                    <button
                                        className={`p-3 transition-colors rounded-lg ${flashOn ? 'text-yellow-400 bg-white/10' : 'text-white hover:bg-white/10'}`}
                                        onClick={toggleFlash}
                                    >
                                        <span className="material-symbols-outlined">{flashOn ? 'flash_on' : 'flash_off'}</span>
                                    </button>
                                </div>

                                <button
                                    onClick={capture}
                                    disabled={isCapturing || !!cameraError}
                                    className="group relative flex items-center justify-center gap-3 px-8 h-14 bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(23,84,207,0.4)] hover:shadow-[0_0_30px_rgba(23,84,207,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">filter_center_focus</span>
                                    <span className="text-lg tracking-wide uppercase">{isCapturing ? 'Capturing...' : 'Mint & Capture'}</span>
                                </button>

                                <div className="flex items-center gap-1">
                                    <button className="p-3 text-white transition-colors rounded-lg hover:bg-white/10" onClick={toggleCamera}>
                                        <span className="material-symbols-outlined">cameraswitch</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CameraPage;
