import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { polygonAmoy, polygon, mainnet } from "@reown/appkit/networks";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
const networks = [polygonAmoy, polygon, mainnet];
const metadata = {
  name: "LinkFolio",
  description:
    "LinkFolio turns personal profiles into NFTs. Own your soulbound digital identity effortlessly fully onchain",
  url: "https://linkfol-io.vercel.app",
  icons: ["https://linkfol-io.vercel.app/favicon.ico"]
};

createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks,
  projectId,
  defaultNetwork: polygonAmoy,
  allowUnsupportedChain: false,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#6366f1"
  },
  features: {
    analytics: true,
    swaps: false,
    onramp: false,
    email: true,
    connectMethodsOrder: ["wallet", "social", "email"],
    emailShowWallets: true,
    legalCheckbox: true
  },
  termsConditionsUrl: "https://linkfol-io.vercel.app#terms",
  privacyPolicyUrl: "https://linkfol-io.vercel.app#privacy"
});

export default function Web3ProviderClient({ children }) {
  return children;
}
