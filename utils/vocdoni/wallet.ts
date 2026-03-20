import { Wallet } from '@ethersproject/wallet';
import * as SecureStore from 'expo-secure-store';
import { EnvOptions, VocdoniSDKClient } from '@vocdoni/sdk';

const DEVICE_WALLET_PRIVATE_KEY_STORAGE_KEY = 'vocdoni.deviceWallet.privateKey';

const canUseBrowserStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStoredPrivateKey = async (): Promise<string | null> => {
  if (canUseBrowserStorage()) {
    return window.localStorage.getItem(DEVICE_WALLET_PRIVATE_KEY_STORAGE_KEY);
  }

  return SecureStore.getItemAsync(DEVICE_WALLET_PRIVATE_KEY_STORAGE_KEY);
};

const persistPrivateKey = async (privateKey: string): Promise<void> => {
  if (canUseBrowserStorage()) {
    window.localStorage.setItem(DEVICE_WALLET_PRIVATE_KEY_STORAGE_KEY, privateKey);
    return;
  }

  await SecureStore.setItemAsync(DEVICE_WALLET_PRIVATE_KEY_STORAGE_KEY, privateKey);
};

export const getOrCreateDeviceWallet = async (): Promise<Wallet> => {
  const storedPrivateKey = await readStoredPrivateKey();

  if (storedPrivateKey) {
    return new Wallet(storedPrivateKey);
  }

  const wallet = Wallet.createRandom();
  await persistPrivateKey(wallet.privateKey);
  return wallet;
};

export const createVocdoniClient = (wallet: Wallet) =>
  new VocdoniSDKClient({
    env: EnvOptions.STG,
    api_url: process.env.EXPO_PUBLIC_API_URL ?? process.env.API_URL,
    wallet,
  });

export const getDeviceClient = async () => {
  const wallet = await getOrCreateDeviceWallet();
  const client = createVocdoniClient(wallet);

  return { wallet, client };
};

export const formatWalletAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
