'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface GodotGameProps {
  walletAddress: string;
}

export function GodotGame({ walletAddress }: GodotGameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !walletAddress) return;

    // Inject wallet address into window for Godot to access
    (window as any).walletAddress = walletAddress;
    (window as any).ethereum = (window as any).ethereum || {};
    
    // Load Godot game
    loadGodotGame();
  }, [isConnected, walletAddress]);

  const loadGodotGame = async () => {
    console.log('Loading Godot game with wallet address:', walletAddress);
    
    // Load the Godot game in iframe
    const iframe = iframeRef.current;
    if (iframe) {
      // Set up message passing between parent and iframe
      window.addEventListener('message', (event) => {
        if (event.data.type === 'REQUEST_WALLET_INFO') {
          // Send wallet info to Godot game (only serializable data)
          const ethereumInfo = (window as any).ethereum ? {
            chainId: (window as any).ethereum.chainId,
            selectedAddress: (window as any).ethereum.selectedAddress,
            isMetaMask: (window as any).ethereum.isMetaMask,
            isConnected: (window as any).ethereum.isConnected?.() || false
          } : null;
          
          iframe.contentWindow?.postMessage({
            type: 'WALLET_INFO',
            address: walletAddress,
            ethereum: ethereumInfo
          }, '*');
        }
      });
      
      // Load the game
      iframe.src = '/godot-game/index.html';
    }
  };

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