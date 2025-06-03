"use client";
import { useState } from "react";
import {
  Button,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Divider,
  Carousel,
  Input,
  message
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { linkFolioContract } from "@/app/utils";

const { Title, Paragraph } = Typography;

const howItWorksSteps = [
  { icon: "🔐", step: "Connect your wallet" },
  { icon: "🎨", step: "Pick a template" },
  { icon: "🔗", step: "Add your links" },
  { icon: "🚀", step: "Publish & share" },
  { icon: "📝", step: "Leave notes & messages" },
  { icon: "📢", step: "Share posts & announcements" }
];

const features = [
  {
    icon: "🎨",
    title: "Customizable Profiles",
    description:
      "Personalize your profile with a bio, avatar, and custom links."
  },
  {
    icon: "🔗",
    title: "Soulbound NFTs",
    description:
      "Each profile is minted as a unique, non-transferrable NFT for true ownership and authenticity."
  },
  {
    icon: "🗄️",
    title: "On-chain Metadata",
    description:
      "Store profile data directly on-chain for integrity and immutability."
  },
  {
    icon: "⛽️",
    title: "Gasless Experience",
    description:
      "Powered by NERO Chain Paymaster, interact without paying gas fees using ETH or stablecoins."
  },
  {
    icon: "📝",
    title: "Notes for Profiles",
    description:
      "Let community members leave quick thoughts or messages on your profile."
  },
  {
    icon: "📢",
    title: "Posts & Announcements",
    description: "Share updates or announcements directly with your audience."
  },
  {
    icon: "🧩",
    title: "Native Account Abstraction",
    description:
      "Streamlined wallet interactions and enhanced UX via smart contract-based wallets."
  }
];

export default function Home() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    setHandle(e.target.value);
  };

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
      console.log("Claiming handle token ID", handleTokenId);
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
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 0
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto"
          // padding: "64px 16px 32px 16px"
        }}
      >
        <Row gutter={[48, 24]} align="middle" justify="center">
          {/* Left: Title, Description, Input */}
          <Col xs={24} md={12}>
            <Title
              level={1}
              style={{
                fontWeight: 800,
                fontSize: 48,
                marginBottom: 16,
                textAlign: "left"
              }}
            >
              Own Your Digital Identity. Forever.
            </Title>
            <Paragraph
              style={{
                fontSize: 20,
                color: "#555",
                margin: "0 0 32px 0",
                textAlign: "left"
              }}
            >
              Join LinkFolio! Your decentralized, portable, and ownable Link
              Hub. Seamlessly share your creations across Instagram, TikTok,
              Twitter, YouTube, and beyond—all with one simple link.
            </Paragraph>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <Space.Compact>
                <Input
                  size="large"
                  placeholder="Enter your handle"
                  value={handle}
                  onChange={handleInputChange}
                  prefix="link.fo/"
                />
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  loading={loading}
                  onClick={handleClaim}
                >
                  Claim
                </Button>
              </Space.Compact>
              <Link href="/explore">
                <Button size="large" shape="round" style={{ fontWeight: 600 }}>
                  Explore
                </Button>
              </Link>
            </div>
          </Col>
          {/* Right: Carousel */}
          <Col xs={24} md={12}>
            <Carousel
              dots
              autoplay
              dotPosition="top"
              style={{ borderRadius: "10px" }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  hoverable
                  style={{ height: 100, borderRadius: 18 }}
                  cover={
                    <img
                      alt="example"
                      src={`https://picsum.photos/seed/${index}/800/400`}
                    />
                  }
                >
                  <Card.Meta
                    title="Europe Street beat"
                    description="www.instagram.com"
                  />
                </Card>
              ))}
            </Carousel>
          </Col>
        </Row>
      </div>
      <Divider />

      {/* Features Section */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 16px 0 16px"
        }}
      >
        <Title
          level={2}
          style={{ textAlign: "center", fontWeight: 700, marginBottom: 32 }}
        >
          Powerful Features
        </Title>
        <Row gutter={[32, 32]} justify="center">
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={12} lg={6} key={index}>
              <Card
                variant="outlined"
                hoverable
                style={{
                  borderRadius: 18,
                  minHeight: 180,
                  boxShadow: "0 2px 16px #6366f111",
                  textAlign: "center",
                  background: "#fff"
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>
                  {feature.icon}
                </div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ color: "#666" }}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <Divider />

      {/* How It Works Section */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "64px 16px 0 16px"
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            fontWeight: 700,
            marginBottom: 32
          }}
        >
          How It Works
        </Title>
        <Row gutter={[24, 24]} justify="center">
          {howItWorksSteps.map((item, idx) => (
            <Col xs={24} sm={12} md={6} key={idx}>
              <Card
                variant="outlined"
                style={{
                  borderRadius: 18,
                  minHeight: 140,
                  textAlign: "center",
                  background: "#f8fafc"
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 10
                  }}
                >
                  {item.icon}
                </div>
                <Title level={4} style={{ marginBottom: 6 }}>
                  Step {idx + 1}
                </Title>
                <Paragraph style={{ color: "#555", fontSize: 16 }}>
                  {item.step}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
