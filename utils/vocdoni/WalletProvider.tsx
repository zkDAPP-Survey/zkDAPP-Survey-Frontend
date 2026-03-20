import { Wallet } from '@ethersproject/wallet';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { getOrCreateDeviceWallet } from '@/utils/vocdoni/wallet';

type WalletContextValue = {
  wallet: Wallet | null;
  walletAddress: string | null;
  isLoading: boolean;
  error: Error | null;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadWallet = async () => {
      try {
        const nextWallet = await getOrCreateDeviceWallet();

        if (!isMounted) {
          return;
        }

        setWallet(nextWallet);
        setWalletAddress(nextWallet.address);
        setError(null);
      } catch (nextError) {
        if (!isMounted) {
          return;
        }

        setError(nextError instanceof Error ? nextError : new Error('Failed to load wallet'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletAddress,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useDeviceWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useDeviceWallet must be used within a WalletProvider');
  }

  return context;
}
