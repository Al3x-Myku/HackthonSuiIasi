import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GalleryPage from './pages/GalleryPage';
import CameraPage from './pages/CameraPage';
import PreviewPage from './pages/PreviewPage';
import ProfilePage from './pages/ProfilePage';
import ProofPage from './pages/ProofPage';
import MobileNav from './components/MobileNav';

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<GalleryPage />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/proof/:id" element={<ProofPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <MobileNav />
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
