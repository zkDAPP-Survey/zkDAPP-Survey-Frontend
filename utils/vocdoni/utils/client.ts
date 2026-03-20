import { Wallet } from '@ethersproject/wallet';
import { createVocdoniClient, getDeviceClient } from '@/utils/vocdoni/wallet';

export const getDefaultClient = (created_wallet?: Wallet) => {
    const wallet = created_wallet ?? Wallet.createRandom();
    const client = createVocdoniClient(wallet);

    return { wallet, client };
};

export const getPersistentDeviceClient = () => getDeviceClient();
