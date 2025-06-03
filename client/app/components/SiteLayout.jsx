"use client";
import { Divider, Layout } from "antd";
import Link from "next/link";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout
      style={{
        minHeight: "100vh"
      }}
    >
      <Header
        style={{
          position: "sticky",
          top: 5,
          zIndex: 99,
          padding: 0,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "15px",
          marginTop: "10px"
        }}
      >
        <Link href="/">
          <h3
            style={{
              margin: 0,
              padding: "0 6px",
              fontWeight: "bold"
            }}
          >
            🔗 LinkFolio
          </h3>
        </Link>
        <appkit-button />
      </Header>

      <Content
        style={{
          margin: "12px 8px",
          padding: 12,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <Divider />
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} LinkFolio. Powered by NERO Chain & Reown
        </a>
        <p style={{ fontSize: "12px" }}>v0.3.0</p>
      </Footer>
    </Layout>
  );
}
