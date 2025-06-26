"use client";
import { Layout } from "antd";
import Link from "next/link";
import Footer from "./Footer";
import styles from "./SiteLayout.module.css";
import "antd/dist/reset.css";

const { Header, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout className={styles.siteLayout}>
      <Header className={styles.siteHeader}>
        <Link href="/">
          <h3 className={styles.siteLogo}>🔗 LinkFolio</h3>
        </Link>
        <div className={styles.headerActions}>
          <appkit-button />
        </div>
      </Header>

      <Content className={styles.siteContent}>{children}</Content>

      <Footer />
    </Layout>
  );
}
