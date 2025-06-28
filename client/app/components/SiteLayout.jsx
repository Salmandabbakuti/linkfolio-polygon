"use client";
import { Layout, Menu, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";
import Footer from "./Footer";
import styles from "./SiteLayout.module.css";
import "antd/dist/reset.css";

const { Header, Content } = Layout;

export default function SiteLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { key: "features", label: "Features", href: "/#features" },
    { key: "create", label: "Create", href: "/#get-started" },
    { key: "explore", label: "Explore", href: "/explore" }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Layout className={styles.siteLayout}>
      <Header className={styles.siteHeader}>
        <div className={styles.leftSection}>
          <Link href="/">
            <h3 className={styles.siteLogo}>🔗 LinkFolio</h3>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {navigationItems.map((item) => (
              <Link key={item.key} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.headerActions}>
          <appkit-button />
          {/* Mobile Menu Button */}
          <Button
            className={styles.mobileMenuButton}
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleMobileMenu}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        <Drawer
          title="Navigation"
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={250}
        >
          <Menu
            mode="vertical"
            style={{ border: "none" }}
            onClick={() => setMobileMenuOpen(false)}
            items={navigationItems.map((item) => ({
              key: item.key,
              label: <Link href={item.href}>{item.label}</Link>
            }))}
          />
        </Drawer>
      </Header>

      <Content className={styles.siteContent}>{children}</Content>

      <Footer />
    </Layout>
  );
}
