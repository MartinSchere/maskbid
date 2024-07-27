import Link from "next/link";
import { ConnectWalletMenu } from "./connect-wallet-menu";

export const Header = () => {
  return (
    <header className="py-2 flex justify-end gap-10 items-center pt-3">
      <Link href={"/"} className="text-lg hover:opacity-80">
        <h3>Home</h3>
      </Link>

      <Link href={"/create-rfp"} className="text-lg hover:opacity-80">
        <h3>Create RFP</h3>
      </Link>

      <ConnectWalletMenu />
    </header>
  );
};
