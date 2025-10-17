"use client";
import { Row, Col, Typography, Space, Divider } from "antd";
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  RocketOutlined,
  CrownOutlined
} from "@ant-design/icons";
import Link from "next/link";
import styles from "./Footer.module.css";

const { Title, Text, Paragraph } = Typography;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <GithubOutlined />,
      href: "https://github.com/Salmandabbakuti/linkfolio",
      label: "GitHub"
    },
    {
      icon: <TwitterOutlined />,
      href: "https://twitter.com/linkfolio",
      label: "Twitter"
    },
    {
      icon: <LinkedinOutlined />,
      href: "https://linkedin.com/company/linkfolio",
      label: "LinkedIn"
    }
  ];

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/#get-started", label: "Create" },
    { href: "/explore", label: "Explore" },
    { href: "#", label: "About" },
    { href: "#", label: "Contact" }
  ];

  const resources = [
    { href: "#", label: "Documentation" },
    { href: "#", label: "API Reference" },
    { href: "#", label: "Getting Started" },
    { href: "#", label: "FAQ" }
  ];

  return (
    <footer className={styles.footerSection}>
      {/* Background decoration */}
      <div className={styles.footerGradient} />

      <div className={`container ${styles.footerContainer}`}>
        {/* Main footer content */}
        <Row gutter={[48, 32]}>
          {/* Brand section */}
          <Col xs={24} sm={12} lg={8}>
            <div style={{ marginBottom: "24px" }}>
              <Title level={3} className={styles.footerLogo}>
                🔗 LinkFolio
                <CrownOutlined
                  style={{
                    fontSize: "20px",
                    color: "var(--secondary-color)",
                    marginLeft: "8px"
                  }}
                />
              </Title>
              <Paragraph className={styles.footerTagline}>
                Create and own your digital identity as a soulbound NFT with
                on-chain metadata. Built on Polygon.
              </Paragraph>

              {/* Social links */}
              <Space size="middle" className={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </Space>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={12} sm={6} lg={4}>
            <div className={styles.footerLinkGroup}>
              <h4>Quick Links</h4>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={styles.footerLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </Col>

          {/* Resources */}
          <Col xs={12} sm={6} lg={4}>
            <div className={styles.footerLinkGroup}>
              <h4>Resources</h4>
              {resources.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={styles.footerLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </Col>

          {/* Technology Stack */}
          <Col xs={24} sm={12} lg={8}>
            <div className={styles.footerLinkGroup}>
              <h4>
                <RocketOutlined style={{ marginRight: "8px" }} />
                Powered By
              </h4>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}
                >
                  {[
                    { name: "Polygon", color: "#6366f1" },
                    { name: "TheGraph", color: "#10b981" },
                    { name: "Next.js", color: "#fdfdfd" },
                    { name: "AppKit", color: "#ec4899" },
                    { name: "ethers.js", color: "#f97316" },
                    { name: "Ant Design", color: "#1677ff" }
                  ].map((tech, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "4px 12px",
                        background: `${tech.color}15`,
                        color: tech.color,
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "var(--font-weight-medium)",
                        border: `1px solid ${tech.color}30`
                      }}
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    padding: "16px",
                    background: "var(--surface-secondary)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    Built with ❤️ for the decentralized web
                  </Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        <Divider className={styles.footerDivider} />

        {/* Bottom section */}
        <Row
          justify="space-between"
          align="middle"
          style={{ flexWrap: "wrap-reverse", gap: "16px" }}
        >
          <Col>
            <Text className={styles.footerCopyright}>
              © {currentYear} LinkFolio. All rights reserved.{" "}
              <span style={{ margin: "0 8px" }}>•</span>
              <Link
                href="#"
                style={{
                  color: "var(--text-muted)",
                  textDecoration: "underline"
                }}
              >
                Privacy Policy
              </Link>
              <span style={{ margin: "0 8px" }}>•</span>
              <Link
                href="#"
                style={{
                  color: "var(--text-muted)",
                  textDecoration: "underline"
                }}
              >
                Terms of Service
              </Link>
            </Text>
          </Col>
          <Col>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "var(--surface-secondary)",
                borderRadius: "20px",
                border: "1px solid var(--border-color)"
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--success-color)",
                  animation: "pulse 2s infinite"
                }}
              />
              <Text
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: "var(--font-weight-medium)"
                }}
              >
                v0.6.0 • All systems operational
              </Text>
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  );
}
