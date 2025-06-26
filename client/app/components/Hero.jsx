"use client";
import { Typography, Button, Space, Row, Col, Carousel, Image } from "antd";
import {
  RocketOutlined,
  CrownOutlined,
  StarFilled,
  ArrowRightOutlined,
  CompassOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useRef } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

const { Title, Paragraph } = Typography;

export default function Hero({ onGetStarted }) {
  const carouselRef = useRef(null);
  const showcaseItems = [
    {
      title: "Professional Profiles",
      description: "Create stunning profiles with custom themes and layouts",
      image: "/lfv0.4-edit-profile-sc.png",
      category: "Profiles"
    },
    {
      title: "Ready-Made Templates",
      description: "Choose from professionally designed templates",
      image: "/lfv0.4-appearance-settings-sc.png",
      category: "Templates"
    },
    {
      title: "Live Customization",
      description: "Real-time preview as you customize your profile",
      image: "/lfv0.4-edit-profile-sc.png",
      category: "Customization"
    },
    {
      title: "Posts",
      description: "Share updates and announcements with your audience",
      image: "/lfv0.4-posts-sc.png", // Update with actual posts screenshot
      category: "Posts"
    },
    {
      title: "Community Notes & Tips",
      description: "Receive messages and tips from your community",
      image: "/lfv0.4-notes-tips-sc.png",
      category: "Notes"
    }
  ];

  const stats = [
    { number: "10K+", label: "Profiles Created" },
    { number: "25K+", label: "Posts Shared" },
    { number: "15K+", label: "Notes with Tips" },
    { number: "24/7", label: "Uptime" }
  ];

  return (
    <section className={styles.heroSection}>
      {/* Background decorations */}
      <div className={styles.backgroundBlur} />
      <div className={styles.backgroundBlur} />

      <div className={`container ${styles.heroContainer}`}>
        {/* Main hero content */}
        <div className={styles.heroContent}>
          {/* Badge */}
          <div className={styles.newFeatureBadge}>
            <StarFilled style={{ color: "var(--secondary-color)" }} />
            <span className={styles.badgeText}>
              New: Profile appearance customizations and ready-made templates
            </span>
            <CrownOutlined style={{ color: "var(--secondary-color)" }} />
          </div>

          {/* Main headline */}
          <Title level={1} className={styles.heroTitle}>
            Create Your Digital Identity
            <br />
            <span className={styles.titleHighlight}>
              Own It Forever
              <svg
                className={styles.underlineSvg}
                viewBox="0 0 300 12"
                fill="none"
              >
                <path
                  d="M0 6C75 2, 150 2, 225 6C262.5 8, 337.5 8, 375 6"
                  stroke="var(--secondary-color)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </span>
          </Title>

          {/* Subtitle */}
          <Paragraph className={styles.heroSubtitle}>
            Build your professional profile as a{" "}
            <strong style={{ color: "var(--primary-color)" }}>
              soulbound NFT
            </strong>{" "}
            with on-chain metadata. Share links, receive tips, and connect with
            your audience on the decentralized web.
          </Paragraph>

          {/* CTA Buttons */}
          <Space size="large" style={{ marginBottom: "60px" }}>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={onGetStarted}
              style={{
                height: "52px",
                padding: "0 32px",
                fontSize: "16px",
                fontWeight: "var(--font-weight-semibold)",
                borderRadius: "26px",
                boxShadow: "var(--shadow-colored)",
                border: "none"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "var(--shadow-2xl)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "var(--shadow-colored)";
              }}
            >
              Create Your LinkFolio
              <ArrowRightOutlined />
            </Button>
            <Link href="/explore">
              <Button
                size="large"
                icon={<CompassOutlined />}
                style={{
                  height: "52px",
                  padding: "0 24px",
                  fontSize: "16px",
                  fontWeight: "var(--font-weight-medium)",
                  borderRadius: "26px",
                  background: "rgba(102, 126, 234, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  color: "var(--primary-color)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(102, 126, 234, 0.2)";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.borderColor = "rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(102, 126, 234, 0.1)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.borderColor = "rgba(102, 126, 234, 0.3)";
                }}
              >
                Explore Profiles
              </Button>
            </Link>
          </Space>

          {/* Feature Showcase Carousel */}
          <div
            className={`${styles.carouselContainer} ${styles.carouselWrapper}`}
          >
            {/* Carousel Navigation */}
            <div className={styles.carouselNavigation}>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current?.prev()}
                className={styles.carouselNavButton}
              />
              <Button
                type="text"
                icon={<RightOutlined />}
                onClick={() => carouselRef.current?.next()}
                className={styles.carouselNavButton}
              />
            </div>

            <Carousel
              ref={carouselRef}
              autoplay
              autoplaySpeed={4000}
              dots={true}
              style={{ borderRadius: "20px" }}
            >
              {showcaseItems.map((item, index) => (
                <div key={index}>
                  <div className={styles.carouselSlide}>
                    <div className={styles.carouselSlideContent}>
                      {/* Screenshot Image */}
                      <div className={styles.carouselImageContainer}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "400px",
                            objectFit: "contain",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.02)",
                            cursor: "pointer"
                          }}
                        />
                      </div>
                      {/* Category badge */}
                      <div className={styles.carouselCategoryBadge}>
                        {item.category}
                      </div>
                      {/* Content overlay */}
                      <div className={styles.carouselContentOverlay}>
                        <Title level={3} className={styles.carouselTitle}>
                          {item.title}
                        </Title>
                        <Paragraph className={styles.carouselDescription}>
                          {item.description}
                        </Paragraph>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>

        {/* Stats section */}
        <Row gutter={[32, 16]} justify="center">
          {stats.map((stat, index) => (
            <Col key={index} xs={12} sm={6}>
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all var(--transition-normal)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <Title
                  level={2}
                  style={{
                    margin: "0 0 8px 0",
                    background: "var(--text-gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: "var(--font-weight-bold)"
                  }}
                >
                  {stat.number}
                </Title>
                <Paragraph
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    fontWeight: "var(--font-weight-medium)"
                  }}
                >
                  {stat.label}
                </Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Floating elements */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "5%",
          fontSize: "24px",
          opacity: 0.3,
          animation: "float 4s ease-in-out infinite"
        }}
      >
        🚀
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "5%",
          fontSize: "32px",
          opacity: 0.2,
          animation: "float 5s ease-in-out infinite reverse"
        }}
      >
        ⚡
      </div>
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "15%",
          fontSize: "20px",
          opacity: 0.25,
          animation: "float 3s ease-in-out infinite"
        }}
      >
        ✨
      </div>
    </section>
  );
}
