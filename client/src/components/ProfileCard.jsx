import { useState } from "react";
import {
  Avatar,
  Descriptions,
  Tabs,
  List,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  Tag,
  Image,
  App as AntdApp
} from "antd";
import {
  LinkOutlined,
  DollarOutlined,
  ExportOutlined,
  XOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  GithubOutlined,
  GlobalOutlined,
  DiscordOutlined,
  FrownOutlined,
  CodeOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  CalendarOutlined,
  EditOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitState
} from "@reown/appkit/react";
import { BrowserProvider, parseEther, formatEther } from "ethers";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ellipsisString, linkFolioContract } from "@/utils";
import { EXPLORER_URL } from "@/utils/constants";

dayjs.extend(relativeTime);

const { Paragraph, Text, Title } = Typography;

const supportedSocials = [
  { id: "facebook", name: "Facebook", icon: <FacebookOutlined /> },
  { id: "youtube", name: "YouTube", icon: <YoutubeOutlined /> },
  { id: "github", name: "GitHub", icon: <GithubOutlined /> },
  { id: "snapchat", name: "Snapchat", icon: <GlobalOutlined /> },
  { id: "telegram", name: "Telegram", icon: <GlobalOutlined /> },
  { id: "discord", name: "Discord", icon: <DiscordOutlined /> },
  { id: "farcaster", name: "Farcaster", icon: <FrownOutlined /> },
  { id: "blockchain", name: "Blockchain", icon: <CodeOutlined /> },
  { id: "linkedin", name: "LinkedIn", icon: <LinkedinOutlined /> },
  { id: "x", name: "X", icon: <XOutlined /> },
  { id: "instagram", name: "Instagram", icon: <InstagramOutlined /> },
  { id: "other", name: "Other", icon: <GlobalOutlined /> }
];

export default function ProfileCard({ profile, appearanceSettings = {} }) {
  const [postInput, setPostInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [loading, setLoading] = useState({
    createPost: false,
    leaveNote: false
  });

  // Suggested tip amounts in POL
  const suggestedTips = [
    { label: "No tip", value: "0" },
    { label: "1 POL", value: "1" },
    { label: "10 POL", value: "10" },
    { label: "25 POL", value: "25" },
    { label: "50 POL", value: "50" },
    { label: "75 POL", value: "75" },
    { label: "100 POL", value: "100" },
    { label: "200 POL", value: "200" }
  ];

  const { message } = AntdApp.useApp();
  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { walletProvider } = useAppKitProvider("eip155");

  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const activeTab = search?.tab || "links";

  const isProfileOwner = profile?.owner?.id === account?.toLowerCase();

  const handleLeaveNote = async () => {
    // check if note input is between 1 and 280 characters
    if (noteInput.length < 1 || noteInput.length > 280)
      return message.error("Note must be between 1 and 280 characters");
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:80002")
      return message.error("Please switch to Polygon Amoy network");

    // Validate tip amount
    const finalTipAmount = tipAmount || "0";
    if (isNaN(finalTipAmount) || parseFloat(finalTipAmount) < 0)
      return message.error("Please enter a valid tip amount");

    setLoading((prev) => ({ ...prev, leaveNote: true }));
    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      // Convert tip amount to wei if > 0
      const tipAmountWei =
        parseFloat(finalTipAmount) > 0 ? parseEther(finalTipAmount) : 0n;

      const leaveNoteTx = await linkFolioContract
        .connect(signer)
        .leaveNote(profile?.handle, noteInput, {
          value: tipAmountWei
        });
      console.log("Leave note tx:", leaveNoteTx);
      await leaveNoteTx.wait();
      message.success(
        `Note left successfully!${
          parseFloat(finalTipAmount) > 0
            ? ` Thank you for tipping ${finalTipAmount} POL!`
            : ""
        }`
      );
      // add the new note to the profile notes
      profile.notes = [
        {
          id: leaveNoteTx,
          author: account,
          content: noteInput,
          tipAmount: tipAmountWei.toString(),
          createdAt: Math.floor(Date.now() / 1000)
        },
        ...profile.notes
      ];
      setNoteInput("");
      setTipAmount("");
    } catch (error) {
      console.error("Error leaving note:", error);
      message.error("Failed to leave note. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, leaveNote: false }));
    }
  };

  const handleCreatePost = async () => {
    // check if post input is between 1 and 1000 characters
    if (postInput.length < 1 || postInput.length > 1000)
      return message.error("Post must be between 1 and 1000 characters");
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:80002")
      return message.error("Please switch to Polygon Amoy network");
    setLoading((prev) => ({ ...prev, createPost: true }));
    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const createPostTx = await linkFolioContract
        .connect(signer)
        .createPost(profile?.id, postInput);
      console.log("Create post transaction:", createPostTx);
      await createPostTx.wait();
      message.success("Post created successfully!");
      // add the new post to the profile posts
      profile.posts = [
        {
          id: createPostTx?.hash,
          author: {
            id: profile?.id,
            handle: profile?.handle,
            name: profile?.name
          },
          content: postInput,
          createdAt: Math.floor(Date.now() / 1000)
        },
        ...profile.posts
      ];
      setPostInput("");
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Failed to create post. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, createPost: false }));
    }
  };
  // Generate dynamic styles based on appearance settings
  // React compiler handles memoization internally
  const {
    fontFamily = "Inter, sans-serif",
    fontSize = 16,
    background = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    accentColor = "#ff9900",
    cardStyle = "glass",
    buttonShape = "round",
    linkStyle = "bold",
    textColor = "#222",
    avatarShape = "circle",
    banner = ""
  } = appearanceSettings;

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, opacity) => {
    if (!hex || typeof hex !== "string") return `rgba(255, 153, 0, ${opacity})`;

    const hexValue = hex.startsWith("#") ? hex : `#${hex}`;
    if (hexValue.length !== 7) return `rgba(255, 153, 0, ${opacity})`;

    const r = parseInt(hexValue.slice(1, 3), 16);
    const g = parseInt(hexValue.slice(3, 5), 16);
    const b = parseInt(hexValue.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Base styles applied to entire component
  const baseStyles = {
    fontFamily,
    fontSize: `${fontSize}px`,
    color: textColor
  };

  const containerStyle = {
    ...baseStyles,
    borderRadius:
      cardStyle === "glass"
        ? "20px"
        : cardStyle === "bordered"
          ? "12px"
          : "8px",
    boxShadow:
      cardStyle === "glass"
        ? `0 4px 24px ${hexToRgba(accentColor, 0.3)}`
        : cardStyle === "bordered"
          ? "0 2px 8px rgba(0,0,0,0.1)"
          : "none",
    border: cardStyle === "bordered" ? `1.5px solid ${accentColor}` : "none",
    backdropFilter: cardStyle === "glass" ? "blur(20px)" : "none",
    backgroundColor: background,
    backgroundImage:
      cardStyle === "glass"
        ? "linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))"
        : "none",
    padding: "24px",
    overflow: "hidden",
    position: "relative"
  };

  const avatarStyle = {
    border: `2px solid ${accentColor}`,
    borderRadius:
      avatarShape === "circle"
        ? "50%"
        : avatarShape === "rounded"
          ? "20%"
          : "0%"
  };

  const buttonStyle = {
    borderRadius:
      buttonShape === "round" ? "6px" : buttonShape === "pill" ? "50px" : "0px",
    backgroundColor: accentColor,
    borderColor: accentColor,
    fontFamily,
    fontSize: `${fontSize}px`
  };

  const inputStyle = {
    backgroundColor:
      cardStyle === "glass" ? "rgba(255,255,255,0.1)" : undefined,
    borderColor: accentColor,
    color: textColor,
    fontFamily,
    fontSize: `${fontSize}px`
  };

  const linkButtonStyle = {
    color: accentColor,
    fontWeight: linkStyle === "bold" ? "bold" : "normal",
    textDecoration: linkStyle === "underline" ? "underline" : "none",
    borderRadius:
      buttonShape === "round" ? "6px" : buttonShape === "pill" ? "50px" : "0px",
    fontFamily,
    fontSize: `${fontSize}px`
  };

  const textStyles = {
    primary: { ...baseStyles, color: accentColor },
    secondary: { ...baseStyles, color: textColor, opacity: 0.7 },
    muted: { ...baseStyles, color: textColor, opacity: 0.6 }
  };

  const tagStyle = {
    backgroundColor: accentColor,
    color: "white",
    borderRadius: buttonStyle.borderRadius,
    fontFamily,
    fontSize: `${Math.max(fontSize - 2, 12)}px`
  };

  const dynamicStyles = {
    base: baseStyles,
    container: containerStyle,
    avatar: avatarStyle,
    button: buttonStyle,
    input: inputStyle,
    linkButton: linkButtonStyle,
    text: textStyles,
    tag: tagStyle,
    accent: accentColor,
    hexToRgba,
    banner: {
      backgroundImage: `url(${banner})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "120px",
      width: "calc(100% + 48px)",
      margin: "-24px -24px 24px -24px",
      borderTopLeftRadius: containerStyle.borderRadius,
      borderTopRightRadius: containerStyle.borderRadius
    }
  };

  // Apply base styles to the entire component
  const componentStyle = {
    ...dynamicStyles.base,
    ...dynamicStyles.container
  };

  const items = Object.keys(profile?.links || {})
    .map((key) => {
      const link = profile?.links[key];
      if (link) {
        const social = supportedSocials.find((s) => s.id === key);
        return {
          key,
          children: (
            <Button
              type={
                appearanceSettings?.linkStyle === "button" ? "default" : "link"
              }
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={dynamicStyles.linkButton}
            >
              {social?.icon || <LinkOutlined />} {social?.name || "-"}
            </Button>
          )
        };
      }
    })
    .filter(Boolean);

  return (
    <div style={componentStyle}>
      {/* Banner */}
      {appearanceSettings.banner && (
        <Image
          src={appearanceSettings.banner}
          alt="Profile Banner"
          preview={{
            mask: { blur: true }
          }}
          width={"calc(100% + 48px)"}
          height={120}
          style={dynamicStyles.banner}
        />
      )}

      <div style={{ textAlign: "center" }}>
        <Image
          src={
            profile?.avatar?.fileList?.[0]?.thumbUrl ||
            profile?.avatar ||
            `https://api.dicebear.com/5.x/open-peeps/svg?seed=${profile?.handle}`
          }
          alt="Profile Avatar"
          preview={{
            mask: { blur: true }
          }}
          width={100}
          height={100}
          style={dynamicStyles.avatar}
        />
        <Title
          level={2}
          style={{
            ...dynamicStyles.text.primary,
            fontSize: fontSize * 1.6 + "px",
            margin: "16px 0 8px 0"
          }}
        >
          {profile?.name}
        </Title>
        <Text style={{ ...dynamicStyles.text.secondary }}>
          @{profile?.handle}
        </Text>
        <Paragraph ellipsis style={{ ...dynamicStyles.text.secondary }}>
          {profile?.bio}
        </Paragraph>

        <Space wrap size="small" align="center">
          <Tag title="NFT ID" style={dynamicStyles.tag}>
            #{profile?.id || 0}
          </Tag>
          <Tag title="Category" style={dynamicStyles.tag}>
            {profile?.category}
          </Tag>
          <Tag
            title="Tips"
            icon={<DollarOutlined />}
            style={{ ...dynamicStyles.tag, marginLeft: "8px" }}
          >
            {formatEther(profile?.tipAmount || 0n)} POL
          </Tag>
          <Tag style={{ ...dynamicStyles.tag, marginLeft: "8px" }}>
            <Text copyable={{ text: profile?.owner?.id || account || "" }}>
              {ellipsisString(profile?.owner?.id || account || "", 8, 5)}
            </Text>
          </Tag>
        </Space>
      </div>

      <Tabs
        defaultActiveKey="links"
        animated
        activeKey={activeTab}
        onChange={(key) =>
          navigate({
            to: "/$handle",
            params: { handle: profile?.handle },
            search: (prev) => ({ ...prev, tab: key })
          })
        }
        items={[
          {
            key: "links",
            label: (
              <Typography.Text strong style={dynamicStyles.text.primary}>
                Links
              </Typography.Text>
            ),
            children: (
              <div style={dynamicStyles.base}>
                <Descriptions column={2} colon={false} items={items} />
              </div>
            )
          },
          {
            key: "posts",
            label: (
              <Typography.Text strong style={dynamicStyles.text.primary}>
                Posts
              </Typography.Text>
            ),
            children: (
              <div style={dynamicStyles.base}>
                <Paragraph style={dynamicStyles.text.secondary}>
                  📢 Stay in the loop — see what this creator is sharing with
                  the world.
                </Paragraph>
                {isProfileOwner && (
                  <>
                    <Input.TextArea
                      placeholder="Share what you're building. Updates, ideas, milestones — your space, your voice."
                      value={postInput}
                      rows={4}
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      maxLength={1000}
                      showCount
                      onChange={(e) => setPostInput(e.target.value)}
                      style={{ ...dynamicStyles.input, marginBottom: "16px" }}
                    />
                    <Button
                      variant="solid"
                      onClick={handleCreatePost}
                      loading={loading?.createPost}
                      style={dynamicStyles.button}
                    >
                      Submit
                    </Button>
                  </>
                )}
                <Divider />
                <Typography.Text strong style={dynamicStyles.text.primary}>
                  Posts ({profile?.posts?.length || 0})
                </Typography.Text>
                <List
                  dataSource={profile?.posts || []}
                  itemLayout="horizontal"
                  split
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="circle"
                            size="small"
                            style={{
                              cursor: "pointer",
                              border: "1px solid grey"
                            }}
                            src={
                              item?.author?.avatar ||
                              `https://api.dicebear.com/5.x/open-peeps/svg?seed=${item?.author?.id}`
                            }
                          />
                        }
                        title={
                          <Space>
                            <Typography.Text
                              strong
                              style={dynamicStyles.text.primary}
                            >
                              {item?.author?.name}
                            </Typography.Text>
                            <Typography.Text style={dynamicStyles.text.muted}>
                              {dayjs(item?.createdAt * 1000).fromNow()}
                            </Typography.Text>
                          </Space>
                        }
                        description={
                          <span style={dynamicStyles.base}>
                            {item?.content}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )
          },
          {
            key: "notes",
            label: (
              <Typography.Text strong style={dynamicStyles.text.primary}>
                Notes
              </Typography.Text>
            ),
            children: (
              <div style={dynamicStyles.base}>
                <Paragraph style={dynamicStyles.text.secondary}>
                  ✍️ Got something to say? Leave a note and make their day! Your
                  notes will be visible to the community.
                </Paragraph>
                <Input.TextArea
                  placeholder="Drop a quick thought, shout-out, or question for this creator."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={2}
                  maxLength={280}
                  showCount
                  style={{ ...dynamicStyles.input, marginBottom: "0.5em" }}
                />
                <Space wrap style={{ marginBottom: "0.5em" }}>
                  {suggestedTips.map((tip) => (
                    <Button
                      key={tip.label}
                      size="small"
                      variant="solid"
                      onClick={() => setTipAmount(tip.value)}
                      style={{
                        ...dynamicStyles.button,
                        minWidth: 60,
                        backgroundColor:
                          tipAmount === tip.value
                            ? dynamicStyles.accent
                            : undefined
                      }}
                    >
                      {tip.label}
                    </Button>
                  ))}
                  <Input
                    allowClear
                    type="number"
                    size="small"
                    placeholder="Custom"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    min={0}
                    step={0.5}
                    precision={2}
                    style={{
                      ...dynamicStyles.input,
                      maxWidth: 170,
                      verticalAlign: "middle"
                    }}
                  />
                </Space>
                <Typography.Text
                  style={{
                    ...dynamicStyles.text.secondary,
                    fontSize: "12px",
                    display: "block",
                    marginBottom: "16px"
                  }}
                >
                  💡 Tip will be sent directly to the profile owner
                </Typography.Text>
                <Button
                  variant="solid"
                  onClick={handleLeaveNote}
                  loading={loading?.leaveNote}
                  icon={tipAmount > 0 ? <DollarOutlined /> : null}
                  style={dynamicStyles.button}
                >
                  {tipAmount && parseFloat(tipAmount) > 0
                    ? `Submit with ${tipAmount} POL tip`
                    : "Submit"}
                </Button>
                <Divider />
                <Typography.Text strong style={dynamicStyles.text.primary}>
                  Notes ({profile?.notes?.length || 0})
                </Typography.Text>
                <List
                  itemLayout="horizontal"
                  split
                  dataSource={profile?.notes || []}
                  renderItem={(item) => {
                    const isTipped = parseFloat(item?.tipAmount || "0") > 0;
                    return (
                      <List.Item
                        style={
                          isTipped
                            ? {
                                background: `linear-gradient(90deg, ${dynamicStyles.hexToRgba(
                                  dynamicStyles.accent,
                                  0.1
                                )} 60%, ${dynamicStyles.hexToRgba(
                                  dynamicStyles.accent,
                                  0.25
                                )} 100%)`,
                                border: `1px solid ${dynamicStyles.accent}`,
                                borderRadius: "8px",
                                marginBottom: "8px"
                              }
                            : { background: "transparent" }
                        }
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              shape="circle"
                              size="small"
                              style={{
                                cursor: "pointer",
                                border: "1px solid grey"
                              }}
                              src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${item?.author}`}
                            />
                          }
                          title={
                            <Space wrap>
                              <Typography.Text
                                strong
                                style={dynamicStyles.text.primary}
                              >
                                {ellipsisString(item?.author, 8, 5)}
                              </Typography.Text>
                              <Typography.Text style={dynamicStyles.text.muted}>
                                {dayjs(item?.createdAt * 1000).fromNow()}
                              </Typography.Text>
                              {isTipped && (
                                <>
                                  <Tag
                                    icon={<DollarOutlined />}
                                    style={dynamicStyles.tag}
                                  >
                                    {formatEther(item?.tipAmount)} POL
                                  </Tag>
                                  <a
                                    href={`${EXPLORER_URL}/tx/${item?.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: dynamicStyles.accent }}
                                  >
                                    <ExportOutlined title="View on Explorer" />
                                  </a>
                                </>
                              )}
                            </Space>
                          }
                          description={
                            <span style={dynamicStyles.base}>
                              {item?.content}
                            </span>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            )
          }
        ]}
      />
      {/* Card Footer - Profile Timestamps */}
      {profile?.createdAt && (
        <>
          <Divider />
          <div
            style={{
              fontSize: "12px",
              textAlign: "center"
            }}
          >
            <small title="Created At">
              <CalendarOutlined />{" "}
              {dayjs(profile.createdAt * 1000).format("MMM D, YYYY h:mm A")}
            </small>
            {" • "}
            <small title="Updated At">
              <EditOutlined />{" "}
              {dayjs(profile.updatedAt * 1000).format("MMM D, YYYY h:mm A")}
            </small>
          </div>
        </>
      )}
    </div>
  );
}
