'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface GodotGameProps {
  walletAddress: string;
}

export function GodotGame({ walletAddress }: GodotGameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isConnected } = useAccount();

  const loadGodotGame = useCallback(async () => {
    console.log('Loading Godot game with wallet address:', walletAddress);
    
    // Load the Godot game in iframe
    const iframe = iframeRef.current;
    if (iframe) {
      // Set up message passing between parent and iframe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMessage = (event: any) => {
        if (event.data.type === 'REQUEST_WALLET_INFO') {
          // Send wallet info to Godot game (only serializable data)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ethereumInfo = (window as any).ethereum ? {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chainId: (window as any).ethereum.chainId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            selectedAddress: (window as any).ethereum.selectedAddress,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isMetaMask: (window as any).ethereum.isMetaMask,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isConnected: (window as any).ethereum.isConnected?.() || false
          } : null;
          
          iframe.contentWindow?.postMessage({
            type: 'WALLET_INFO',
            address: walletAddress,
            ethereum: ethereumInfo
          }, '*');
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Load the game
      iframe.src = '/godot-game/index.html';
      
      // Return cleanup function
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!isConnected || !walletAddress) return;

    // Inject wallet address into window for Godot to access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).walletAddress = walletAddress;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ethereum = (window as any).ethereum || {};
    
    // Load Godot game
    const cleanupPromise = loadGodotGame();
    
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cleanupPromise?.then((cleanupFn: any) => cleanupFn?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletAddress, loadGodotGame]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <iframe 
        ref={iframeRef}
        width={800}
        height={600}
        className="border border-gray-300 rounded-lg"
        title="Godot Web3 Game"
      />
    </div>
  );
}