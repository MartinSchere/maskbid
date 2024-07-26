import { ConnectWalletMenu } from "./connect-wallet-menu";

export const Header = () => {
  return (
    <header className="px-28 py-2 flex justify-end">
      <ConnectWalletMenu />
    </header>
  );
};
