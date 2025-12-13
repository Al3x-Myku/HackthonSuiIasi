import React, { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const account = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(true);

    // Wait a moment for auto-connect to complete
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Give wallet 500ms to auto-connect

        return () => clearTimeout(timer);
    }, []);

    // Also stop loading immediately if account is found
    useEffect(() => {
        if (account) {
            setIsLoading(false);
        }
    }, [account]);

    // Show loading while waiting for wallet state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#111722] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-400">Loading...</span>
                </div>
            </div>
        );
    }

    if (!account) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

