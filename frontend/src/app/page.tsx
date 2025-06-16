'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { GodotGame } from '@/components/GodotGame';

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Godot Web3 Demo</h1>
          <ConnectButton />
        </header>
        
        <main className="bg-white rounded-lg shadow-lg p-6">
          {isConnected && address ? (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Connected Wallet:</p>
                <p className="font-mono text-sm">{address}</p>
              </div>
              <GodotGame walletAddress={address} />
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8">
                Please connect your wallet to access the Godot Web3 game.
              </p>
              <ConnectButton />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
