"use client";
import { Layout, Menu, Drawer, Button, Badge, Typography, Tag } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";
import styles from "./SiteLayout.module.css";
import "antd/dist/reset.css";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function SiteLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

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
          size={250}
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

      <footer className={styles.bottomFooter}>
        <div className={`container ${styles.bottomFooterInner}`}>
          <div className={styles.bottomFooterMeta}>
            <p className={styles.bottomFooterCopyright}>
              © {currentYear} LinkFolio. All rights reserved.
            </p>
            <div className={styles.bottomFooterLinks}>
              <Link href="#" className={styles.bottomFooterLink}>
                Privacy Policy
              </Link>
              <span className={styles.bottomFooterDot}>•</span>
              <Link href="#" className={styles.bottomFooterLink}>
                Terms of Service
              </Link>
            </div>
          </div>

          <Tag title="All systems operational">
            <Text>v0.7.1</Text>{" "}
            <Badge status="processing" color="#52c41a" text="All OK" />
          </Tag>
        </div>
      </footer>
    </Layout>
  );
}
