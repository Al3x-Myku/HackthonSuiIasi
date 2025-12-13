import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    // Hide on landing page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111722]/95 backdrop-blur-md border-t border-[#243047] pb-safe lg:hidden">
            <div className="flex items-center justify-around h-16 px-2">
                <button
                    onClick={() => navigate('/gallery')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/gallery') ? 'text-primary' : 'text-[#93a5c8] hover:text-white'}`}
                >
                    <span className={`material-symbols-outlined ${isActive('/gallery') ? 'filled' : ''}`}>photo_library</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide">Gallery</span>
                </button>

                <button
                    onClick={() => navigate('/camera')}
                    className="flex flex-col items-center justify-center w-full h-full gap-1 -mt-6"
                >
                    <div className="flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-[0_0_15px_rgba(23,84,207,0.4)] border-4 border-[#111722]">
                        <span className="material-symbols-outlined text-[28px]">photo_camera</span>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-white">Capture</span>
                </button>

                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/profile') ? 'text-primary' : 'text-[#93a5c8] hover:text-white'}`}
                >
                    <span className={`material-symbols-outlined ${isActive('/profile') ? 'filled' : ''}`}>person</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide">Profile</span>
                </button>
            </div>
        </div>
    );
};

export default MobileNav;

