import React, { useCallback, useState } from "react";
import Onboard, { WalletState } from "@web3-onboard/core";
import injectedModule from '@web3-onboard/injected-wallets'

import SendTransaction from "./SendTransaction";

const injected = injectedModule();

const onboard = Onboard({
  wallets: [injected],
  appMetadata: {
    name: 'Ioanas App',
    icon: '<svg>App Icon</svg>',
    description: 'This is an awesome app',
    recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' },]
  },
  chains: [
    {
      id: "0x539",
      token: "ETH",
      label: "Ganache",
      publicRpcUrl: "http://localhost:8545",
      rpcUrl: "http://localhost:8545"
    },
  ],
});

const Navigation: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>();

  const handleConnect = useCallback(async () => {

    const wallets = await onboard.connectWallet();

    const [metamaskWallet] = wallets;

    if (
      metamaskWallet?.label === "MetaMask" &&
      metamaskWallet?.accounts[0].address
    ) {
      setWallet(metamaskWallet);
    }
  }, []);

  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-ful text-sm py-4 bg-gray-800">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <a
            className="flex-none text-xl font-semibold dark:text-white"
            href="."
          >
            Transactions List
          </a>
        </div>
        <div className="hs-collapse overflow-hidden transition-all duration-300 basis-full grow block">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:pl-5">
            {wallet && (
              <>
                <SendTransaction sender={wallet.accounts[0].address} />
                <p className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-gray-200 text-sm">
                  {wallet.accounts[0].address}
                </p>
              </>
            )}
            {!wallet && (
              <button
                type="button"
                onClick={handleConnect}
                className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-gray-200 hover:text-white hover:bg-gray-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
