import { useState, useMemo } from "react";
import {
  Avatar,
  Descriptions,
  Tabs,
  List,
  Input,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Tag,
  Badge
} from "antd";
import {
  LinkOutlined,
  DollarOutlined,
  ExportOutlined,
  CopyOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitState
} from "@reown/appkit/react";
import { BrowserProvider, parseEther, formatEther } from "ethers";
import {
  supportedSocials,
  ellipsisString,
  linkFolioContract
} from "@/app/utils";
import { executeOperation } from "@/app/utils/aaUtils";
import { EXPLORER_URL } from "@/app/utils/constants";

dayjs.extend(relativeTime);

const { Paragraph } = Typography;

export default function ProfileCard({
  profile,
  aaWalletAddress,
  appearanceSettings = {}
}) {
  const [postInput, setPostInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [loading, setLoading] = useState({
    createPost: false,
    leaveNote: false
  });

  // Suggested tip amounts in NERO
  const suggestedTips = [
    { label: "No tip", value: "0" },
    { label: "0.5 NERO", value: "0.5" },
    { label: "1 NERO", value: "1" },
    { label: "5 NERO", value: "5" },
    { label: "25 NERO", value: "25" },
    { label: "50 NERO", value: "50" }
  ];

  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { walletProvider } = useAppKitProvider("eip155");

  const isProfileOwner = useMemo(
    () =>
      aaWalletAddress &&
      profile?.owner?.toLowerCase() === aaWalletAddress?.toLowerCase(),
    [aaWalletAddress, profile]
  );

  const handleLeaveNote = async () => {
    // check if note input is between 1 and 280 characters
    if (noteInput.length < 1 || noteInput.length > 280)
      return message.error("Note must be between 1 and 280 characters");
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:689")
      return message.error("Please switch to NERO Testnet");

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
            ? ` Thank you for tipping ${finalTipAmount} NERO!`
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
    if (selectedNetworkId !== "eip155:689")
      return message.error("Please switch to NERO Testnet");
    setLoading((prev) => ({ ...prev, createPost: true }));
    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const createPostOpTx = await executeOperation(
        signer,
        linkFolioContract.target,
        "createPost",
        [profile?.id, postInput]
      );
      console.log("Create post operation transaction:", createPostOpTx);
      message.success("Post created successfully!");
      // add the new post to the profile posts
      profile.posts = [
        {
          id: createPostOpTx,
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
              style={{
                color: appearanceSettings.accentColor || "#ff9900",
                fontWeight:
                  appearanceSettings.linkStyle === "bold" ? "bold" : "normal",
                textDecoration:
                  appearanceSettings.linkStyle === "underline"
                    ? "underline"
                    : "none",
                borderRadius:
                  appearanceSettings.buttonShape === "round"
                    ? "6px"
                    : appearanceSettings.buttonShape === "pill"
                    ? "50px"
                    : "0px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {social?.icon || <LinkOutlined />} {social?.name || "-"}
            </Button>
          )
        };
      }
    })
    .filter(Boolean);
  // Generate dynamic styles based on appearance settings
  const dynamicStyles = useMemo(() => {
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
      banner = "",
      customCSS = ""
    } = appearanceSettings; // Helper function to convert hex to rgba
    const hexToRgba = (hex, opacity) => {
      // Handle case where hex might not be a string or might not start with #
      if (!hex || typeof hex !== "string")
        return `rgba(255, 153, 0, ${opacity})`;

      const hexValue = hex.startsWith("#") ? hex : `#${hex}`;
      if (hexValue.length !== 7) return `rgba(255, 153, 0, ${opacity})`;

      const r = parseInt(hexValue.slice(1, 3), 16);
      const g = parseInt(hexValue.slice(3, 5), 16);
      const b = parseInt(hexValue.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    const containerStyle = {
      fontFamily,
      fontSize: `${fontSize}px`,
      color: textColor,
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
      // Use backgroundColor and backgroundImage separately to avoid conflicts
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
        buttonShape === "round"
          ? "6px"
          : buttonShape === "pill"
          ? "50px"
          : "0px",
      backgroundColor: accentColor,
      borderColor: accentColor
    };

    const linkTextStyle = {
      fontWeight: linkStyle === "bold" ? "bold" : "normal",
      textDecoration: linkStyle === "underline" ? "underline" : "none",
      color: linkStyle === "normal" ? textColor : accentColor
    };

    const bannerStyle = {
      backgroundImage: `url(${banner})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "120px",
      width: "calc(100% + 48px)",
      margin: "-24px -24px 24px -24px",
      borderTopLeftRadius: containerStyle.borderRadius,
      borderTopRightRadius: containerStyle.borderRadius
    };

    return {
      container: containerStyle,
      avatar: avatarStyle,
      button: buttonStyle,
      linkText: linkTextStyle,
      banner: bannerStyle,
      accent: accentColor,
      custom: customCSS,
      hexToRgba
    };
  }, [appearanceSettings]);

  return (
    <>
      {/* Custom CSS */}
      {dynamicStyles.custom && (
        <style dangerouslySetInnerHTML={{ __html: dynamicStyles.custom }} />
      )}
      <Badge.Ribbon text={profile?.category} color={dynamicStyles.accent}>
        <div style={dynamicStyles.container}>
          {/* Banner */}
          <div style={dynamicStyles.banner} />

          <div style={{ textAlign: "center" }}>
            <Avatar
              src={
                profile?.avatar?.fileList?.[0]?.thumbUrl ||
                profile?.avatar ||
                `https://api.dicebear.com/5.x/open-peeps/svg?seed=${profile?.handle}`
              }
              alt="Profile"
              size={100}
              shape={
                appearanceSettings.avatarShape === "square"
                  ? "square"
                  : "circle"
              }
              style={dynamicStyles.avatar}
            />
            <h2 style={{ color: dynamicStyles.accent, margin: "16px 0 8px 0" }}>
              {profile?.name}
            </h2>
            <p
              style={{
                color: dynamicStyles.container.color,
                opacity: 0.8,
                margin: "0 0 8px 0"
              }}
            >
              @{profile?.handle}
            </p>
            <p
              style={{
                color: dynamicStyles.container.color,
                margin: "0 0 16px 0"
              }}
            >
              {profile?.bio}
            </p>

            <Tag
              bordered={false}
              style={{
                backgroundColor: dynamicStyles.accent,
                color: "white",
                borderRadius: dynamicStyles.button.borderRadius
              }}
            >
              {profile?.category}
            </Tag>
            {/* Tag with tip amount stats and eoa address */}
            <Tag
              bordered={false}
              style={{
                backgroundColor: dynamicStyles.accent,
                color: "white",
                borderRadius: dynamicStyles.button.borderRadius,
                marginLeft: "8px"
              }}
            >
              <span>💰 {formatEther(profile?.tipAmount || 0n)} NERO</span>
            </Tag>
            <Tag
              bordered={false}
              style={{
                backgroundColor: dynamicStyles.accent,
                color: "white",
                borderRadius: dynamicStyles.button.borderRadius,
                marginLeft: "8px"
              }}
            >
              <span
                title="Copy EOA address"
                onClick={() => {
                  navigator.clipboard.writeText(
                    profile?.eoa?.id || account || ""
                  );
                  message.success("EOA address copied to clipboard!");
                }}
                style={{ cursor: "pointer" }}
              >
                {ellipsisString(profile?.eoa?.id || account || "", 8, 5)}{" "}
                <CopyOutlined style={{ marginLeft: "4px" }} />
              </span>
            </Tag>
            {/* tabs with links, posts, notes */}
          </div>
          <Tabs
            defaultActiveKey="links"
            animated
            // activeKey={activeTab}
            onChange={(key) => {
              // const urlSearchParams = new URLSearchParams(window.location.search);
              // urlSearchParams.set("tab", key);
              // router.push(`${pathname}?${urlSearchParams.toString()}`);
              // router.push(`${pathname}?tab=${key}`);
            }}
            items={[
              {
                key: "links",
                label: (
                  <Typography.Text
                    strong
                    style={{ color: dynamicStyles.accent }}
                  >
                    Links
                  </Typography.Text>
                ),
                children: (
                  <Descriptions column={2} colon={false} items={items} />
                )
              },
              {
                key: "posts",
                label: (
                  <Typography.Text
                    strong
                    style={{ color: dynamicStyles?.accent }}
                  >
                    Posts
                  </Typography.Text>
                ),
                children: (
                  <>
                    <Paragraph
                      type="secondary"
                      style={{
                        color: dynamicStyles.container.color,
                        opacity: 0.7
                      }}
                    >
                      📢 Stay in the loop — see what this creator is sharing
                      with the world.
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
                          onPressEnter={handleCreatePost}
                          style={{
                            marginBottom: "16px",
                            backgroundColor:
                              dynamicStyles.cardStyle === "glass"
                                ? "rgba(255,255,255,0.1)"
                                : undefined,
                            borderColor: dynamicStyles.accent,
                            color: dynamicStyles.container.color
                          }}
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
                    <Typography.Text
                      strong
                      style={{ color: dynamicStyles?.accent }}
                    >
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
                                src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${item?.author?.id}`}
                              />
                            }
                            title={
                              <Space>
                                <Typography.Text
                                  strong
                                  style={{ color: dynamicStyles.accent }}
                                >
                                  {item?.author?.name}
                                </Typography.Text>
                                <Typography.Text
                                  type="secondary"
                                  style={{
                                    color: dynamicStyles.container.color,
                                    opacity: 0.6
                                  }}
                                >
                                  {dayjs(item?.createdAt * 1000).fromNow()}
                                </Typography.Text>
                              </Space>
                            }
                            description={
                              <span
                                style={{ color: dynamicStyles.container.color }}
                              >
                                {item?.content}
                              </span>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )
              },
              {
                key: "notes",
                label: (
                  <Typography.Text
                    strong
                    style={{ color: dynamicStyles?.accent }}
                  >
                    Notes
                  </Typography.Text>
                ),
                children: (
                  <>
                    <Paragraph
                      type="secondary"
                      style={{
                        color: dynamicStyles?.container?.color,
                        opacity: 0.7
                      }}
                    >
                      ✍️ Got something to say? Leave a note and make their day!
                      Your notes will be visible to the community.
                    </Paragraph>
                    <Input.TextArea
                      placeholder="Drop a quick thought, shout-out, or question for this creator."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows={2}
                      maxLength={280}
                      showCount
                      style={{
                        marginBottom: "0.5em",
                        backgroundColor:
                          dynamicStyles.cardStyle === "glass"
                            ? "rgba(255,255,255,0.1)"
                            : undefined,
                        borderColor: dynamicStyles?.accent,
                        color: dynamicStyles?.container?.color
                      }}
                    />
                    <Space wrap style={{ marginBottom: "0.5em" }}>
                      {suggestedTips.map((tip) => (
                        <Button
                          key={tip.label}
                          size="small"
                          variant="solid"
                          onClick={() => setTipAmount(tip.value)}
                          style={{
                            minWidth: 60,
                            ...dynamicStyles.button,
                            color: dynamicStyles?.container?.color,
                            backgroundColor:
                              tipAmount === tip.value
                                ? dynamicStyles?.accent
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
                          maxWidth: 170,
                          verticalAlign: "middle",
                          backgroundColor:
                            dynamicStyles?.cardStyle === "glass"
                              ? "rgba(255,255,255,0.1)"
                              : undefined,
                          borderColor: dynamicStyles?.accent,
                          color: dynamicStyles?.container?.color
                        }}
                      />
                    </Space>
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: "12px",
                        display: "block",
                        marginBottom: "16px",
                        color: dynamicStyles?.container?.color
                      }}
                    >
                      💡 Tip will be sent directly to the profile owner
                    </Typography.Text>
                    <Button
                      variant="solid"
                      onClick={handleLeaveNote}
                      loading={loading?.leaveNote}
                      icon={<DollarOutlined />}
                      style={dynamicStyles.button}
                    >
                      {tipAmount && parseFloat(tipAmount) > 0
                        ? `Submit with ${tipAmount} NERO tip`
                        : "Submit Note"}
                    </Button>
                    <Divider />
                    <Typography.Text
                      strong
                      style={{ color: dynamicStyles.accent }}
                    >
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
                                    style={{ color: dynamicStyles.accent }}
                                  >
                                    {ellipsisString(item?.author, 8, 5)}
                                  </Typography.Text>
                                  <Typography.Text
                                    type="secondary"
                                    style={{
                                      color: dynamicStyles.container.color,
                                      opacity: 0.6
                                    }}
                                  >
                                    {dayjs(item?.createdAt * 1000).fromNow()}
                                  </Typography.Text>
                                  {isTipped && (
                                    <>
                                      <Tag
                                        icon={<DollarOutlined />}
                                        style={{
                                          backgroundColor: dynamicStyles.accent,
                                          color: "white",
                                          borderColor: dynamicStyles.accent
                                        }}
                                      >
                                        {formatEther(item?.tipAmount)} NERO
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
                                <span
                                  style={{
                                    color: dynamicStyles.container.color
                                  }}
                                >
                                  {item?.content}
                                </span>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                  </>
                )
              }
            ]}
          />
        </div>
      </Badge.Ribbon>
    </>
  );
}
