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
  Tag
} from "antd";
import { LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitState
} from "@reown/appkit/react";
import { BrowserProvider } from "ethers";
import {
  supportedSocials,
  ellipsisString,
  linkFolioContract
} from "@/app/utils";
import { executeOperation } from "@/app/utils/aaUtils";

dayjs.extend(relativeTime);

const { Paragraph } = Typography;

export default function ProfileCard({ profile, aaWalletAddress }) {
  const [postInput, setPostInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState({
    createPost: false,
    leaveNote: false
  });

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
    setLoading((prev) => ({ ...prev, leaveNote: true }));
    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const leaveNoteOpTx = await executeOperation(
        signer,
        linkFolioContract.target,
        "leaveNote",
        [profile?.handle, noteInput]
      );
      console.log("Leave note operation transaction:", leaveNoteOpTx);
      message.success("Note left successfully!");
      // add the new note to the profile notes
      profile.notes = [
        {
          id: leaveNoteOpTx,
          author: account,
          content: noteInput,
          createdAt: Math.floor(Date.now() / 1000)
        },
        ...profile.notes
      ];
      setNoteInput("");
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
            <a href={link} target="_blank" rel="noopener noreferrer">
              {social?.icon || <LinkOutlined />} {social?.name || "-"}
            </a>
          )
        };
      }
    })
    .filter(Boolean);

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <Avatar
          src={
            profile?.avatar?.fileList?.[0]?.thumbUrl ||
            profile?.avatar ||
            `https://api.dicebear.com/5.x/open-peeps/svg?seed=${profile?.handle}`
          }
          alt="Profile"
          size={100}
          shape="circle"
          style={{ border: "1px solid grey" }}
        />
        <h2>{profile?.name}</h2>
        <p>@{profile?.handle}</p>
        <p>{profile?.bio}</p>
        <Tag
          bordered={false}
          color={
            profile?.category === "Personal"
              ? "magenta"
              : profile?.category === "Business"
              ? "blue"
              : profile?.category === "Creator"
              ? "green"
              : "default"
          }
        >
          {profile?.category}
        </Tag>
        {/* tabs with links, posts, notes */}
      </div>
      <Tabs
        defaultActiveKey="links"
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
            label: "Links",
            children: <Descriptions column={2} colon={false} items={items} />
          },
          {
            key: "posts",
            label: "Posts",
            children: (
              <>
                <Paragraph type="secondary">
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
                      onPressEnter={handleCreatePost}
                      style={{ marginBottom: "16px" }}
                    />
                    <Button
                      type="primary"
                      shape="round"
                      onClick={handleCreatePost}
                      loading={loading?.createPost}
                    >
                      Submit
                    </Button>
                  </>
                )}
                <Divider />
                <Typography.Text strong>
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
                            <Typography.Text strong>
                              {item?.author?.name}
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              {dayjs(item?.createdAt * 1000).fromNow()}
                            </Typography.Text>
                          </Space>
                        }
                        description={item?.content}
                      />
                    </List.Item>
                  )}
                />
              </>
            )
          },
          {
            key: "notes",
            label: "Notes",
            children: (
              <>
                <Paragraph type="secondary">
                  ✍️ Got something to say? Leave a note and make their day! Your
                  notes will be visible to the community.
                </Paragraph>
                <Input.TextArea
                  placeholder="Drop a quick thought, shout-out, or question for this creator."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onPressEnter={handleLeaveNote}
                  rows={2}
                  maxLength={280}
                  showCount
                  style={{ marginBottom: "16px" }}
                />
                <Button
                  type="primary"
                  shape="round"
                  onClick={handleLeaveNote}
                  loading={loading?.leaveNote}
                >
                  Submit
                </Button>
                <Divider />
                <Typography.Text strong>
                  Notes ({profile?.notes?.length || 0})
                </Typography.Text>
                <List
                  itemLayout="horizontal"
                  split
                  dataSource={profile?.notes || []}
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
                            src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${item?.author}`}
                          />
                        }
                        title={
                          <Space>
                            <Typography.Text strong>
                              {ellipsisString(item?.author, 8, 5)}
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              {dayjs(item?.createdAt * 1000).fromNow()}
                            </Typography.Text>
                          </Space>
                        }
                        description={item?.content}
                      />
                    </List.Item>
                  )}
                />
              </>
            )
          }
        ]}
      />
    </>
  );
}
