"use client";
import { useState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, theme } from "antd";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { neroTestnetChain, neroMainnetChain } from "@/app/utils";

// 1. Get projectId at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
const networks = [neroMainnetChain, neroTestnetChain];

// 2. Create a metadata object
const metadata = {
  name: "LinkFolio",
  description:
    "LinkFolio turns personal profiles into NFTs. Own your soulbound digital identity effortlessly fully onchain",
  url: "https://linkfolio-nero.vercel.app", // origin must match your domain & subdomain
  icons: ["https://linkfolio-nero.vercel.app/favicon.ico"]
};

// 3. Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks,
  projectId,
  defaultNetwork: neroMainnetChain, // Default network to use
  allowUnsupportedChain: false,
  chainImages: {
    689: "https://testnet.neroscan.io/favicon.svg",
    1689: "https://framerusercontent.com/images/45NncLY0V1ELrMis3GvSCJsN79s.png"
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#6366f1" // Primary indigo color
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    swaps: false,
    onramp: false,
    // socials: false, // should be false or provider only
    email: true,
    connectMethodsOrder: ["social", "email", "wallet"],
    emailShowWallets: true,
    legalCheckbox: true
  },
  termsConditionsUrl: "https://linkfolio-nero.vercel.app#terms",
  privacyPolicyUrl: "https://linkfolio-nero.vercel.app#privacy"
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          // Colors
          colorPrimary: "#6366f1", // Primary indigo
          // Background colors
          colorBgContainer: "#1a1a1a", // Card backgrounds
          colorBgElevated: "#293142", // Modal, dropdown backgrounds
          colorBgSpotlight: "#262626", // Hover states

          // Layout
          wireframe: false,
          motion: true
        },
        components: {
          // Button customization
          Button: {
            colorPrimary: "#6366f1",
            defaultColor: "#ffffff",
            primaryShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            borderRadius: 26,
            controlHeight: 40,
            fontSize: 14,
            fontWeight: 500,
            defaultBg: "rgba(255, 255, 255, 0.1)",
            defaultHoverBg: "rgba(255, 255, 255, 0.15)",
            defaultActiveBg: "rgba(255, 255, 255, 0.3)"
          },
          InputNumber: {
            colorPrimary: "#6366f1",
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.2)",
            borderRadius: 12,
            controlHeight: 48,
            fontSize: 14
          },

          ColorPicker: {
            colorPrimary: "#6366f1",
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.2)",
            borderRadius: 12,
            colorText: "#ffffff",
            colorTextPlaceholder: "#737373"
          },

          // Select customization
          Select: {
            colorPrimary: "#6366f1",
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.2)",
            borderRadius: 12,
            controlHeight: 48,
            fontSize: 14,
            colorText: "#ffffff",
            colorTextPlaceholder: "#737373",
            optionSelectedBg: "rgba(99, 102, 241, 0.2)"
          },

          // Card customization
          Card: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorderSecondary: "rgba(255, 255, 255, 0.1)",
            borderRadiusLG: 16,
            boxShadowTertiary:
              "0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
            headerBg: "transparent",
            colorTextHeading: "#ffffff",
            colorTextDescription: "#a3a3a3"
          },

          // Input customization
          Input: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.2)",
            borderRadius: 12,
            controlHeight: 48,
            fontSize: 14,
            colorText: "#ffffff",
            colorTextPlaceholder: "#737373"
          },

          // Typography customization
          Typography: {
            colorText: "#ffffff",
            colorTextSecondary: "#a3a3a3",
            colorTextTertiary: "#737373",
            titleMarginBottom: 16,
            titleMarginTop: 0
          },

          // Steps customization
          Steps: {
            colorPrimary: "#6366f1",
            colorText: "#ffffff",
            colorTextDescription: "#a3a3a3",
            colorSplit: "#404040",
            dotSize: 32,
            iconSize: 16
          },

          // Dropdown customization
          Dropdown: {
            colorBgElevated: "#1f1f1f",
            borderRadiusLG: 12,
            boxShadowSecondary: "0 10px 25px -3px rgba(0, 0, 0, 0.3)"
          },

          // Menu customization
          Menu: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorText: "#ffffff",
            colorTextSecondary: "#a3a3a3",
            itemBg: "transparent",
            itemHoverBg: "rgba(255, 255, 255, 0.1)",
            itemSelectedBg: "rgba(99, 102, 241, 0.2)",
            itemSelectedColor: "#6366f1"
          },

          // Form customization
          Form: {
            labelColor: "#ffffff",
            labelFontSize: 14,
            itemMarginBottom: 24
          },

          // Message customization
          Message: {
            colorBgElevated: "#1f1f1f",
            borderRadiusLG: 12,
            colorText: "#ffffff"
          },

          // Divider customization
          Divider: {
            colorSplit: "#404040",
            colorText: "#a3a3a3"
          },

          // Tag customization
          Tag: {
            colorText: "#ffffff",
            colorBgContainer: "rgba(255, 255, 255, 0.1)",
            borderRadiusSM: 20
          },

          // Badge customization
          Badge: {
            colorBgContainer: "#6366f1",
            colorText: "#ffffff"
          }
        }
      }}
    >
      {mounted && children}
    </ConfigProvider>
  );
}
