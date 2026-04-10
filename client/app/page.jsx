"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Input,
  Steps,
  App as AntdApp
} from "antd";
import {
  RocketOutlined,
  CheckCircleOutlined,
  StarFilled,
  UserOutlined,
  LinkOutlined,
  ShareAltOutlined,
  GithubOutlined,
  XOutlined,
  LinkedinOutlined,
  CrownOutlined,
  SafetyOutlined,
  GlobalOutlined,
  DollarOutlined,
  NotificationOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { linkFolioContract } from "@/app/utils";
import Hero from "./components/Hero";
import styles from "./page.module.css";

const { Title, Paragraph, Text } = Typography;

const howItWorksSteps = [
  {
    icon: (
      <UserOutlined
        style={{ fontSize: "24px", color: "var(--primary-color)" }}
      />
    ),
    title: "Connect Wallet",
    description:
      "Connect your wallet with one click - no complex setup required"
  },
  {
    icon: (
      <CrownOutlined
        style={{ fontSize: "24px", color: "var(--secondary-color)" }}
      />
    ),
    title: "Choose Template",
    description:
      "Pick from our professionally designed templates or customize your own"
  },
  {
    icon: (
      <LinkOutlined
        style={{ fontSize: "24px", color: "var(--accent-color)" }}
      />
    ),
    title: "Add Content & Links",
    description:
      "Add your social links, bio, and customize your profile appearance with themes and colors"
  },
  {
    icon: (
      <ShareAltOutlined
        style={{ fontSize: "24px", color: "var(--success-color)" }}
      />
    ),
    title: "Share & Mint",
    description:
      "Publish your profile as a soulbound NFT and share it with the world"
  },
  {
    icon: (
      <NotificationOutlined
        style={{ fontSize: "24px", color: "var(--warning-color)" }}
      />
    ),
    title: "Create Posts",
    description:
      "Share updates, announcements, and content with your audience through dynamic posts"
  },
  {
    icon: (
      <DollarOutlined
        style={{ fontSize: "24px", color: "var(--primary-color)" }}
      />
    ),
    title: "Receive Notes & Tips",
    description:
      "Your community can leave notes on your profile and send tips to support your work"
  }
];

const features = [
  {
    icon: (
      <CrownOutlined
        style={{ fontSize: "32px", color: "var(--secondary-color)" }}
      />
    ),
    title: "Soulbound NFT Profiles",
    description:
      "Each profile is minted as a unique, non-transferrable NFT ensuring true ownership and authenticity.",
    highlight: true
  },
  {
    icon: (
      <SafetyOutlined
        style={{ fontSize: "32px", color: "var(--success-color)" }}
      />
    ),
    title: "On-Chain Metadata",
    description:
      "All profile data is stored directly on-chain, ensuring permanence, integrity, and decentralization.",
    highlight: true
  },
  {
    icon: (
      <GlobalOutlined
        style={{ fontSize: "32px", color: "var(--primary-color)" }}
      />
    ),
    title: "Customizable Design",
    description:
      "Personalize your profile with custom themes, colors, fonts, and layouts to match your brand."
  },
  {
    icon: (
      <StarFilled style={{ fontSize: "32px", color: "var(--accent-color)" }} />
    ),
    title: "Social Features",
    description:
      "Receive tips, messages, and interact with your community through built-in social features.",
    highlight: true
  },
  {
    icon: (
      <CheckCircleOutlined
        style={{ fontSize: "32px", color: "var(--success-color)" }}
      />
    ),
    title: "Easy Integration",
    description:
      "Simple APIs and tools to integrate LinkFolio profiles into your existing applications and workflows."
  }
];

const socialLinks = [
  {
    icon: <GithubOutlined />,
    href: "https://github.com/Salmandabbakuti/linkfolio-polygon",
    label: "GitHub"
  },
  {
    icon: <XOutlined />,
    href: "https://x.com/linkfolio",
    label: "X"
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

const technologies = [
  { name: "Polygon", color: "#6366f1" },
  { name: "TheGraph", color: "#10b981" },
  { name: "Next.js", color: "#fdfdfd" },
  { name: "AppKit", color: "#ec4899" },
  { name: "ethers.js", color: "#f97316" },
  { name: "Ant Design", color: "#1677ff" }
];

export default function Home() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = AntdApp.useApp();

  const handleClaim = async () => {
    // handle length should be between 3 and 15 characters
    if (handle.length < 3 || handle.length > 15) {
      return message.error("Handle should be between 3 and 15 characters");
    }
    if (handle.includes(" ")) {
      return message.error("Handle should not contain spaces");
    }
    setLoading(true);
    try {
      const handleTokenId = await linkFolioContract.handleToTokenId(handle);
      // if handleTokenId is not 0n, it means the handle is already taken
      if (handleTokenId !== 0n) {
        return message.error(
          `${handle} is already taken. Please try another one.`
        );
      }
      router.push(`/${handle}?mode=claim`);
    } catch (err) {
      console.error("Error while checking handle availability", err);
      message.error(
        err?.shortMessage || "Something went wrong. Please try again!"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleGetStarted = () => {
    const handleInput = document.getElementById("handle-input");
    if (handleInput) {
      handleInput.scrollIntoView({ behavior: "smooth" });
      handleInput.focus();
    }
  };
  return (
    <div className={styles.mainContainer}>
      {/* Hero Section */}
      <Hero onGetStarted={handleGetStarted} />
      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              How LinkFolio Works
            </Title>
            <Paragraph className={styles.sectionSubtitle}>
              Create your decentralized profile in minutes with our simple,
              intuitive process
            </Paragraph>
          </div>

          <Steps
            orientation="vertical"
            size="medium"
            current={-1}
            className={styles.stepsContainer}
            items={howItWorksSteps.map((step, index) => ({
              title: <span className={styles.stepTitle}>{step.title}</span>,
              content: (
                <span className={styles.stepDescription}>
                  {step.description}
                </span>
              ),
              icon: step.icon,
              style: {
                paddingBottom: index === howItWorksSteps.length - 1 ? 0 : "40px"
              }
            }))}
          />
        </div>
      </section>
      {/* Profile Customization Showcase Section */}
      <section className={styles.customizationSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              🎨 Customize Your Style
            </Title>
            <Paragraph className={styles.sectionSubtitle}>
              Start with a template or build from scratch - make it uniquely
              yours
            </Paragraph>
          </div>

          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} lg={16}>
              <Card
                className={styles.customizationCard}
                styles={{ body: { padding: 0 } }}
              >
                <div className={styles.customizationIcon}>🎨</div>
                <Title level={3} className={styles.customizationTitle}>
                  Templates & Customization
                </Title>
                <Paragraph className={styles.customizationDescription}>
                  Start with professional templates or build from scratch with
                  advanced customization tools
                </Paragraph>

                {/* Template Preview Cards */}
                <div className={styles.templateGrid}>
                  {[
                    { name: "Modern Glass", bg: "#E3F2FD", accent: "#1565C0" },
                    { name: "Retro Vibes", bg: "#FCE4EC", accent: "#AD1457" },
                    { name: "Dark Mode", bg: "#263238", accent: "#00BCD4" },
                    { name: "Minimalist", bg: "#FAFAFA", accent: "#424242" }
                  ].map((template, index) => (
                    <div
                      key={index}
                      className={styles.templateCard}
                      style={{ background: template.bg }}
                    >
                      <div
                        className={styles.templateAvatar}
                        style={{ background: template.accent }}
                      />
                      <div
                        className={styles.templateLine}
                        style={{ background: template.accent }}
                      />
                      <div
                        className={styles.templateSubline}
                        style={{ background: template.accent }}
                      />
                      <div
                        className={styles.templateName}
                        style={{ color: template.accent }}
                      >
                        {template.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customization Features */}
                <div className={styles.featuresContainer}>
                  {[
                    { name: "Colors", icon: "🎨" },
                    { name: "Fonts", icon: "📝" },
                    { name: "Layouts", icon: "🎯" },
                    { name: "Shapes", icon: "🔘" }
                  ].map((feature, index) => (
                    <div key={index} className={styles.featurePill}>
                      <span className={styles.featureIcon}>{feature.icon}</span>
                      <span className={styles.featureText}>{feature.name}</span>
                    </div>
                  ))}
                </div>

                {/* Real-time Preview Badge */}
                <div className={styles.previewBadge}>
                  <span className={styles.previewIcon}>🔥</span>
                  <span className={styles.previewText}>Real-time preview</span>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
      {/* Features Section */}
      <section className={styles.featuresSection} id="features">
        <div className="container">
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              Why Choose LinkFolio?
            </Title>
            <Paragraph className={styles.sectionSubtitle}>
              Built for the future of digital identity with cutting-edge
              blockchain technology
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col key={index} xs={24} md={12} lg={8}>
                <Card
                  className={`${styles.featureCard} ${
                    feature.highlight
                      ? styles.featureCardHighlight
                      : styles.featureCardNormal
                  }`}
                  styles={{ body: { padding: "32px 24px" } }}
                  hoverable
                >
                  {feature.highlight && (
                    <div className={styles.popularBadge}>POPULAR</div>
                  )}

                  <div className={styles.featureIconContainer}>
                    {feature.icon}
                  </div>

                  <Title level={4} className={styles.featureTitle}>
                    {feature.title}
                  </Title>

                  <Paragraph className={styles.featureDescription}>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
      {/* Get Started Section */}
      <section className={styles.getStartedSection} id="get-started">
        <div className="container">
          <div className={styles.getStartedContainer}>
            <Title level={2} className={styles.getStartedTitle}>
              Ready to Get Started?
            </Title>
            <Paragraph className={styles.getStartedSubtitle}>
              Enter your desired handle to check availability and create your
              LinkFolio
            </Paragraph>

            <Space.Compact size="small" className={styles.handleInputGroup}>
              <Input
                id="handle-input"
                placeholder="Enter your handle (e.g., john)"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                onPressEnter={handleClaim}
                className={styles.handleInput}
                maxLength={20}
              />
              <Button
                type="primary"
                onClick={handleClaim}
                loading={loading}
                disabled={!handle.trim()}
                icon={<RocketOutlined />}
                className={styles.getStartedButton}
              >
                Get Started
              </Button>
            </Space.Compact>

            <Paragraph className={styles.tipText}>
              💡 Tip: Choose a memorable handle that represents your brand
            </Paragraph>
          </div>
        </div>
      </section>

      <footer className={styles.homeFooterSection}>
        <div className={styles.footerGradient} />

        <div className={`container ${styles.homeFooterContainer}`}>
          <Row gutter={[48, 32]}>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.footerBrandBlock}>
                <Title level={3} className={styles.footerLogo}>
                  <span>🔗 LinkFolio</span>
                  <CrownOutlined className={styles.footerLogoIcon} />
                </Title>
                <Paragraph className={styles.footerTagline}>
                  Create and own your digital identity as a soulbound NFT with
                  on-chain metadata. Built on Polygon.
                </Paragraph>

                <Space size="middle" className={styles.socialLinks}>
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
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

            <Col xs={12} sm={6} lg={4}>
              <div className={styles.footerLinkGroup}>
                <h4>Quick Links</h4>
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={styles.footerLink}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </Col>

            <Col xs={12} sm={6} lg={4}>
              <div className={styles.footerLinkGroup}>
                <h4>Resources</h4>
                {resources.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={styles.footerLink}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <div className={styles.footerLinkGroup}>
                <h4 className={styles.footerPoweredBy}>
                  <RocketOutlined />
                  <span>Powered By</span>
                </h4>

                <div className={styles.techGrid}>
                  {technologies.map((tech) => (
                    <span
                      key={tech.name}
                      className={styles.techTag}
                      style={{
                        "--tech-color": tech.color,
                        "--tech-bg": `${tech.color}15`,
                        "--tech-border": `${tech.color}30`
                      }}
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>

                <div className={styles.footerNote}>
                  <Text className={styles.footerNoteText}>
                    Built with ❤️ for the decentralized web
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  );
}
