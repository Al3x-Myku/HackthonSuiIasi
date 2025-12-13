import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const account = useCurrentAccount();

    if (!account) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
