import { ConfigProvider, theme, App as AntdApp } from "antd";
import { ClientOnly } from "@tanstack/react-router";
import Web3ProviderClient from "./Web3Provider.client";

export default function Web3Provider({ children }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#6366f1",
          colorText: "#e5e7eb",
          colorBgContainer: "rgba(255, 255, 255, 0.05)",
          colorBgElevated: "#293142",
          colorBorder: "rgba(124, 139, 255, 0.25)",
          borderRadius: 8,
          controlHeight: 32
        },
        components: {
          Layout: {
            headerBg: "transparent",
            footerBg: "transparent",
            bodyBg: "transparent"
          }
        }
      }}
    >
      <AntdApp>
        <ClientOnly fallback={children}>
          <Web3ProviderClient>{children}</Web3ProviderClient>
        </ClientOnly>
      </AntdApp>
    </ConfigProvider>
  );
}
